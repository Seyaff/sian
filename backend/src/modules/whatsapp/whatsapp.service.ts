import axios from "axios";
import { Env } from "../../config/app.config";
import { AgentService } from "../agent/agent.service";
import { CustomerService } from "../customer/customer.service";
import { RestaurantService } from "../restaurant/restaurant.service";
import { getWhatsAppSession } from "../../memory/whatsapp-session";
import { SessionWriter } from "../../memory/session-writer";
import { AgentChatResponse, CustomToolApprovalResponse } from "../agent/agent.service";
import { WhatsAppComposer } from "./whatsapp.composer";
import { IntentRouter } from "./intent.router";
import { FastPathHandlers } from "./fast-path.handlers";
import { isActionId } from "../../utils/language-normalizer";
import { isStaffPhone } from "../../utils/staff-phones";
import { OrderService } from "../../services/order/order.service";
import { profileExtractorService } from "../../services/memory/profile-extractor.service";

const processedMessageIds = new Map<string, number>();
const MESSAGE_ID_TTL_MS = 5 * 60 * 1000;

function isDuplicateMessage(messageId: string): boolean {
  const now = Date.now();
  for (const [id, expiresAt] of processedMessageIds.entries()) {
    if (expiresAt < now) processedMessageIds.delete(id);
  }
  if (processedMessageIds.has(messageId)) return true;
  processedMessageIds.set(messageId, now + MESSAGE_ID_TTL_MS);
  return false;
}

function isOptOutMessage(text: string): boolean {
  return /^(stop|unsubscribe|opt\s*out|band\s*karo|marketing\s*band)$/i.test(text.trim());
}

export class WhatsappService {
  private agentService = new AgentService();
  private customerService = new CustomerService();
  private restaurantService = new RestaurantService();
  private intentRouter = new IntentRouter();
  private orderService = new OrderService();

  private getHeaders() {
    return {
      Authorization: `Bearer ${Env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    };
  }

  private getBaseUrl(phoneNumberId?: string) {
    const id = phoneNumberId || Env.WHATSAPP_PHONE_NUMBER_ID;
    return `https://graph.facebook.com/v20.0/${id}/messages`;
  }

  private createComposer(to: string, whatsappPhoneNumberId?: string) {
    return new WhatsAppComposer(
      (payload) => this.postToWhatsApp(payload, whatsappPhoneNumberId),
      to
    );
  }

  async handleInboundMessage(
    to: string,
    text: string,
    options: {
      restaurantId?: string;
      whatsappPhoneNumberId?: string;
      messageId?: string;
      isInteractive?: boolean;
    } = {}
  ): Promise<void> {
    if (options.messageId && isDuplicateMessage(options.messageId)) {
      console.log("[WHATSAPP] Duplicate message skipped:", options.messageId);
      return;
    }

    const restaurantId = await this.resolveRestaurantId(options);

    if (isStaffPhone(to)) {
      await this.handleStaffMessage(to, text, restaurantId, options.whatsappPhoneNumberId);
      return;
    }

    if (isOptOutMessage(text)) {
      await this.customerService.optOutMarketing(to, restaurantId);
      const composer = this.createComposer(to, options.whatsappPhoneNumberId);
      await composer.sendText("Theek hai — ab aap ko marketing messages nahi aayengi. Order ke liye kabhi bhi message karein!");
      return;
    }

    const session = await getWhatsAppSession(to, restaurantId);

    if (session.pendingApproval && isActionId(text)) {
      await this.handleApprovalResponse(to, text, restaurantId, options.whatsappPhoneNumberId);
      return;
    }

    const sessionWriter = new SessionWriter(to, restaurantId);
    const composer = this.createComposer(to, options.whatsappPhoneNumberId);
    const handlers = new FastPathHandlers(composer, restaurantId, sessionWriter);
    const { isNew } = await this.customerService.findOrCreate(to, restaurantId);
    const isFirstMessage = session.messages.length === 0 && !options.isInteractive;

    await profileExtractorService.extractFromMessage(to, restaurantId, text);

    const qualifying = profileExtractorService.extractQualifyingAnswers(text);
    if (Object.keys(qualifying).length > 0) {
      const current = await sessionWriter.getSessionState();
      await sessionWriter.updateSessionState({
        qualifyingAnswers: { ...current.qualifyingAnswers, ...qualifying },
      });
    }

    const routeResult = await this.intentRouter.route(text, handlers, {
      isNewCustomer: isNew,
      isFirstMessage,
    });

    if (routeResult.handled) {
      await sessionWriter.appendUserMessage(text);
      return;
    }

    const response = await this.agentService.chat(to, text, {
      restaurantId,
      phone: to,
    });

    await this.sendAgentResponse(to, response, restaurantId, options.whatsappPhoneNumberId);
  }

  async sendMessage(
    to: string,
    text: string,
    options: { restaurantId?: string; whatsappPhoneNumberId?: string } = {}
  ): Promise<void> {
    await this.handleInboundMessage(to, text, options);
  }

  private async resolveRestaurantId(options: { restaurantId?: string; whatsappPhoneNumberId?: string }) {
    if (options.restaurantId) return options.restaurantId;

    if (options.whatsappPhoneNumberId) {
      const restaurant = await this.restaurantService.getRestaurantByWhatsAppPhoneNumberId(
        options.whatsappPhoneNumberId
      );
      if (restaurant) return restaurant.pineconeNamespace;
    }

    return Env.DEFAULT_RESTAURANT_ID;
  }

  private async handleStaffMessage(
    to: string,
    text: string,
    restaurantId: string,
    whatsappPhoneNumberId?: string
  ): Promise<void> {
    const composer = this.createComposer(to, whatsappPhoneNumberId);
    const normalized = text.trim().toLowerCase();

    if (normalized === "orders" || normalized === "active orders" || normalized === "pending") {
      const orders = await this.orderService.getActiveOrders(restaurantId);
      if (orders.length === 0) {
        await composer.sendText("Koi active order nahi hai abhi.");
        return;
      }

      const summary = orders
        .map((o) => {
          const shortId = String(o._id).slice(-6).toUpperCase();
          const items = o.items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
          return `*#${shortId}* — ${items} (${o.status})`;
        })
        .join("\n");

      await composer.sendText(`Active orders:\n\n${summary}\n\nMark ready: *ready ORDER_ID*`);
      return;
    }

    const reply = await this.orderService.handleStaffCommand(text, restaurantId);
    await composer.sendText(reply);
  }

  private async sendAgentResponse(
    to: string,
    response: AgentChatResponse,
    restaurantId: string,
    whatsappPhoneNumberId?: string
  ): Promise<void> {
    const composer = this.createComposer(to, whatsappPhoneNumberId);
    const sessionWriter = new SessionWriter(to, restaurantId);

    if (response.status === "REQUIRES_APPROVAL") {
      await this.sendApprovalButtons(composer, response);
    } else {
      const text = response.text || "Done! Kuch aur chahiye?";
      await composer.sendText(text);
      await composer.sendButtons("Agla step?", [
        { id: "action_order", title: "Order" },
        { id: "action_menu", title: "Menu" },
        { id: "action_book", title: "Book Table" },
      ]);
      await sessionWriter.appendAssistantMessage("[Buttons: Order, Menu, Book Table]");
    }
  }

  private async sendApprovalButtons(
    composer: WhatsAppComposer,
    response: CustomToolApprovalResponse
  ): Promise<void> {
    const approvalText =
      response.toolCall.toolName === "placeOrderTool"
        ? "Order confirm karein?"
        : "Yeh action approve karein?";

    await composer.sendApproval(`${approvalText}\n\nProceed karna hai?`, response.approvalId);
  }

  private async handleApprovalResponse(
    to: string,
    buttonId: string,
    restaurantId: string,
    whatsappPhoneNumberId?: string
  ): Promise<void> {
    const separatorIndex = buttonId.indexOf("_");
    if (separatorIndex === -1) return;

    const action = buttonId.slice(0, separatorIndex);
    const approvalId = buttonId.slice(separatorIndex + 1);
    if (!approvalId) return;

    const approved = action === "approve";
    const sessionWriter = new SessionWriter(to, restaurantId);
    await sessionWriter.appendUserMessage(buttonId);

    const response = await this.agentService.respondToApproval(to, approvalId, approved, undefined, {
      restaurantId,
      phone: to,
    });

    await this.sendAgentResponse(to, response, restaurantId, whatsappPhoneNumberId);
  }

  private async postToWhatsApp(payload: object, whatsappPhoneNumberId?: string): Promise<void> {
    try {
      await axios.post(this.getBaseUrl(whatsappPhoneNumberId), payload, {
        headers: this.getHeaders(),
      });
    } catch (error: any) {
      console.error("[WHATSAPP SEND ERROR]", error.response?.data || error.message);
      throw error;
    }
  }
}
