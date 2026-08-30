import util from "util";
import { randomUUID } from "crypto";

import { ModelMessage } from "ai";
import { createRestaurantAgent } from "../../agents";
import { Env } from "../../config/app.config";
import { PendingApproval } from "../../domain/types/pending-approval.types";
import { CustomerService } from "../customer/customer.service";
import { trimMessagesForAgent, toStoredAssistantMessage, extractAgentReplyText } from "../../utils/message-trim";
import { memoryInjectorService } from "../../services/memory/memory-injector.service";
import { profileExtractorService } from "../../services/memory/profile-extractor.service";
import { toolApprovalService } from "../../services/approval/tool-approval.service";
import { CustomerEventRepository } from "../../repositories/customer-event/customer-event.repository";
import { SessionWriter } from "../../memory/session-writer";
import {
  getWhatsAppSession,
  setPendingApproval,
  appendMessages,
  clearWhatsAppSession,
} from "../../memory/whatsapp-session";

export interface AgentChatOptions {
  restaurantId?: string;
  phone?: string;
}

export interface CustomToolApprovalResponse {
  status: "REQUIRES_APPROVAL";
  approvalId: string;
  toolCall: {
    toolCallId: string;
    toolName: string;
  };
}

export interface AgentCompletedResponse {
  status: "COMPLETED";
  text: string;
}

export type AgentChatResponse = CustomToolApprovalResponse | AgentCompletedResponse;

interface ProposeOrderToolOutput {
  valid?: boolean;
  pendingApproval?: boolean;
  resolvedOrder?: Record<string, unknown>;
  itemSummary?: string;
}

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

  private findProposeOrderApproval(result: {
    content: Array<{ type: string; toolName?: string; toolCallId?: string; output?: unknown }>;
  }): { toolCallId: string; output: ProposeOrderToolOutput } | null {
    for (const part of result.content) {
      if (part.type !== "tool-result" || part.toolName !== "proposeOrderTool") continue;

      const output = part.output as ProposeOrderToolOutput;
      if (output?.valid && output.pendingApproval && output.resolvedOrder) {
        return { toolCallId: part.toolCallId ?? randomUUID(), output };
      }
    }
    return null;
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

    console.log(util.inspect(result, { depth: null, colors: true }));

    const proposal = this.findProposeOrderApproval(result);
    if (proposal) {
      const approvalId = `prop-${randomUUID()}`;
      const pendingApproval: PendingApproval = {
        approvalId,
        toolCall: {
          toolCallId: proposal.toolCallId,
          toolName: "placeOrderTool",
          input: proposal.output.resolvedOrder as Record<string, unknown>,
        },
      };

      await setPendingApproval(phone, restaurantId, pendingApproval);

      const writer = new SessionWriter(phone, restaurantId);
      const cartItems = (proposal.output.resolvedOrder as { items?: Array<{ name: string; quantity: number; price?: number }> })
        .items ?? [];
      await writer.updateSessionState({
        currentIntent: "ordering",
        cartDraft: cartItems.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          ...(i.price !== undefined ? { price: i.price } : {}),
        })),
      });

      const summary =
        proposal.output.itemSummary ??
        toolApprovalService.buildSummary(pendingApproval);

      await appendMessages(phone, restaurantId, [
        toStoredAssistantMessage(`Order pending confirmation: ${summary}`),
      ]);

      return {
        status: "REQUIRES_APPROVAL",
        approvalId,
        toolCall: {
          toolCallId: proposal.toolCallId,
          toolName: "placeOrderTool",
        },
      };
    }

    const replyText = extractAgentReplyText(result);
    await appendMessages(phone, restaurantId, [toStoredAssistantMessage(replyText)]);

    return {
      status: "COMPLETED",
      text: replyText,
    };
  };

  handleApprovalDecision = async (
    sessionId: string,
    approved: boolean,
    options: AgentChatOptions = {}
  ): Promise<AgentCompletedResponse> => {
    const restaurantId = this.resolveRestaurantId(options.restaurantId);
    const phone = options.phone ?? sessionId;
    const text = await toolApprovalService.handleDecision(phone, restaurantId, approved);

    return {
      status: "COMPLETED",
      text,
    };
  };

  getSession = async (phone: string, restaurantId?: string) =>
    getWhatsAppSession(phone, this.resolveRestaurantId(restaurantId));

  clearSession = async (phone: string, restaurantId?: string): Promise<void> => {
    await clearWhatsAppSession(phone, this.resolveRestaurantId(restaurantId));
  };
}
