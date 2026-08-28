import util from "util";

import { ModelMessage, ToolApprovalResponse } from "ai";
import { createRestaurantAgent } from "../../agents";
import { Env } from "../../config/app.config";
import { CustomerService } from "../customer/customer.service";
import { trimMessagesForAgent } from "../../utils/message-trim";
import { memoryInjectorService } from "../../services/memory/memory-injector.service";
import { profileExtractorService } from "../../services/memory/profile-extractor.service";
import { CustomerEventRepository } from "../../repositories/customer-event/customer-event.repository";
import {
  getWhatsAppSession,
  setPendingApproval,
  clearPendingApproval,
  appendMessages,
  clearWhatsAppSession,
} from "../../memory/whatsapp-session";
import { SessionWriter } from "../../memory/session-writer";

export interface AgentChatOptions {
  restaurantId?: string;
  phone?: string;
}

export interface CustomToolApprovalResponse extends ToolApprovalResponse {
  status: "REQUIRES_APPROVAL";
  text?: string;
  approvalId: string;
  toolCall: {
    toolCallId: string;
    toolName: string;
  };
}

export interface AgentCompletedResponse {
  status: "COMPLETED";
  text: string;
  approvalId?: never;
}

export type AgentChatResponse = CustomToolApprovalResponse | AgentCompletedResponse;

export class AgentService {
  constructor(
    private customerService = new CustomerService(),
    private events = new CustomerEventRepository()
  ) {}

  private resolveRestaurantId(restaurantId?: string) {
    return restaurantId || Env.DEFAULT_RESTAURANT_ID;
  }

  private async buildAgent(restaurantId: string, phone?: string) {
    if (phone) {
      const { customer, isNew } = await this.customerService.findOrCreate(phone, restaurantId);
      const session = await getWhatsAppSession(phone, restaurantId);
      const memoryBlock = memoryInjectorService.buildMemoryBlock(
        customer,
        session.sessionState,
        isNew
      );
      const customerContext = this.customerService.toAgentContext(customer, isNew);

      return createRestaurantAgent({
        restaurantId,
        memoryBlock,
        customer: {
          phone: customerContext.phone,
          isReturning: customerContext.isReturning,
          ...(customerContext.name ? { name: customerContext.name } : {}),
          ...(customerContext.preferences ? { preferences: customerContext.preferences } : {}),
        },
      });
    }

    return createRestaurantAgent({ restaurantId });
  }

  private async postTurnMemoryUpdate(phone: string, restaurantId: string, text: string) {
    await profileExtractorService.extractFromMessage(phone, restaurantId, text);

    const qualifying = profileExtractorService.extractQualifyingAnswers(text);
    if (Object.keys(qualifying).length > 0) {
      const writer = new SessionWriter(phone, restaurantId);
      const current = await writer.getSessionState();
      await writer.updateSessionState({
        qualifyingAnswers: { ...current.qualifyingAnswers, ...qualifying },
      });
    }
  }

  chat = async (
    sessionId: string,
    query: string,
    options: AgentChatOptions = {}
  ): Promise<AgentChatResponse> => {
    const restaurantId = this.resolveRestaurantId(options.restaurantId);
    const phone = options.phone ?? sessionId;
    const session = await getWhatsAppSession(phone, restaurantId);
    const userMessage: ModelMessage = { role: "user", content: query };
    const messagesWithUser = trimMessagesForAgent([...session.messages, userMessage]);

    await appendMessages(phone, restaurantId, [userMessage]);
    await this.postTurnMemoryUpdate(phone, restaurantId, query);

    const agent = await this.buildAgent(restaurantId, phone);
    const result = await agent.generate({ messages: messagesWithUser });

    await appendMessages(phone, restaurantId, result.responseMessages);
    console.log(util.inspect(result, { depth: null, colors: true }));

    for (const part of result.content) {
      if (part.type === "tool-approval-request" && !part.isAutomatic) {
        const response: CustomToolApprovalResponse = {
          status: "REQUIRES_APPROVAL",
          type: "tool-approval-response",
          approvalId: part.approvalId,
          approved: false,
          reason: "User will allow or deny the request",
          toolCall: part.toolCall,
        };

        await setPendingApproval(phone, restaurantId, part.approvalId, part.toolCall);
        await appendMessages(phone, restaurantId, [{ role: "tool", content: [response] }]);

        return response;
      }
    }

    return {
      status: "COMPLETED",
      text: result.text,
    };
  };

  respondToApproval = async (
    sessionId: string,
    approvalId: string,
    approved: boolean,
    reason?: string,
    options: AgentChatOptions = {}
  ): Promise<AgentCompletedResponse> => {
    const restaurantId = this.resolveRestaurantId(options.restaurantId);
    const phone = options.phone ?? sessionId;

    const approvalPayload: ToolApprovalResponse[] = [
      {
        type: "tool-approval-response",
        approvalId,
        approved,
        reason: reason || (approved ? "Approved via WhatsApp" : "Denied by user"),
      },
    ];

    await appendMessages(phone, restaurantId, [{ role: "tool", content: approvalPayload }]);
    await clearPendingApproval(phone, restaurantId);

    const updatedSession = await getWhatsAppSession(phone, restaurantId);
    const agent = await this.buildAgent(restaurantId, phone);
    const result = await agent.generate({
      messages: trimMessagesForAgent(updatedSession.messages),
    });

    await appendMessages(phone, restaurantId, result.responseMessages);

    if (approved && result.text) {
      const writer = new SessionWriter(phone, restaurantId);
      await writer.updateSessionState({ currentIntent: null, cartDraft: [] });
    }

    return {
      status: "COMPLETED",
      text: result.text,
    };
  };

  getSession = async (phone: string, restaurantId?: string) =>
    getWhatsAppSession(phone, this.resolveRestaurantId(restaurantId));

  clearSession = async (phone: string, restaurantId?: string): Promise<void> => {
    await clearWhatsAppSession(phone, this.resolveRestaurantId(restaurantId));
  };
}
