import { placeOrderAction } from "../order/place-order.action";
import { orderValidationService } from "../order/order-validation.service";
import { PendingApproval } from "../../domain/types/pending-approval.types";
import { placeOrderInputSchema } from "../../validators/restaurant.validation";
import { toStoredAssistantMessage } from "../../utils/message-trim";
import {
  appendMessages,
  clearPendingApproval,
  getWhatsAppSession,
} from "../../memory/whatsapp-session";
import { SessionWriter } from "../../memory/session-writer";

export class ToolApprovalService {
  buildSummary(pending: PendingApproval): string {
    if (pending.toolCall.toolName === "placeOrderTool") {
      const input = pending.toolCall.input as {
        items?: Array<{ name: string; quantity: number; price?: number }>;
        orderType?: string;
      };
      const items = (input.items ?? [])
        .map((item) => {
          const price = item.price ? ` @ Rs ${item.price}` : "";
          return `${item.quantity}x ${item.name}${price}`;
        })
        .join(", ");
      const orderType = input.orderType === "delivery" ? "delivery" : "pickup";
      return `${items} (${orderType})`;
    }

    return "Action pending confirmation.";
  }

  formatOrderConfirmation(result: Awaited<ReturnType<typeof placeOrderAction>>): string {
    const shortId = result.orderId.slice(-6).toUpperCase();
    return (
      `Order confirm ho gaya! ✅\n\n` +
      `Order #${shortId}\n` +
      `Tayyar hone mein ~${result.estimatedPrepMinutes} min (around ${result.estimatedReadyAt}).\n\n` +
      `Shukriya — jald milte hain! 😊`
    );
  }

  async handleDecision(
    phone: string,
    restaurantId: string,
    approved: boolean
  ): Promise<string> {
    const session = await getWhatsAppSession(phone, restaurantId);
    const pending = session.pendingApproval;

    if (!pending) {
      return "Koi pending order nahi mila. Naya order ke liye items likh dein.";
    }

    await clearPendingApproval(phone, restaurantId);

    if (!approved) {
      const text = "Theek hai, order cancel kar diya. Kuch aur chahiye to likh dein 😊";
      await appendMessages(phone, restaurantId, [toStoredAssistantMessage(text)]);
      return text;
    }

    if (pending.toolCall.toolName !== "placeOrderTool") {
      const text = "Yeh action abhi support nahi hai. Staff se rabta karein.";
      await appendMessages(phone, restaurantId, [toStoredAssistantMessage(text)]);
      return text;
    }

    const parsed = placeOrderInputSchema.safeParse(pending.toolCall.input);
    if (!parsed.success) {
      const text = "Order data invalid hai. Dobara items likh dein.";
      await appendMessages(phone, restaurantId, [toStoredAssistantMessage(text)]);
      return text;
    }

    const validation = await orderValidationService.validate(
      restaurantId,
      parsed.data.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        notes: item.notes ?? null,
      })),
      parsed.data.orderType,
      {
        ...(parsed.data.deliveryAddress != null ? { deliveryAddress: parsed.data.deliveryAddress } : {}),
        ...(parsed.data.specialInstructions != null
          ? { specialInstructions: parsed.data.specialInstructions }
          : {}),
        ...(parsed.data.estimatedPrepMinutes != null
          ? { estimatedPrepMinutes: parsed.data.estimatedPrepMinutes }
          : {}),
      }
    );

    if (!validation.valid || !validation.resolvedOrder) {
      const text = `Order place nahi ho saka:\n${validation.errors.map((e) => `• ${e}`).join("\n")}\n\nDobara sahi items likh dein.`;
      await appendMessages(phone, restaurantId, [toStoredAssistantMessage(text)]);
      return text;
    }

    const result = await placeOrderAction(validation.resolvedOrder, {
      restaurantId,
      customerPhone: phone,
    });

    const text = this.formatOrderConfirmation(result);
    await appendMessages(phone, restaurantId, [toStoredAssistantMessage(text)]);

    const writer = new SessionWriter(phone, restaurantId);
    await writer.updateSessionState({ currentIntent: null, cartDraft: [] });

    return text;
  }
}

export const toolApprovalService = new ToolApprovalService();
