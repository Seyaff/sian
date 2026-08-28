import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { ModelMessage } from "ai";
import { CustomerRepository } from "../../repositories/customer/customer.repository";
import { CustomerEventRepository } from "../../repositories/customer-event/customer-event.repository";
import { ConversationRepository } from "../../repositories/conversation/conversation.repository";

function messagesToText(messages: ModelMessage[]): string {
  return messages
    .map((m) => {
      const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
      return `${m.role}: ${content}`;
    })
    .join("\n");
}

export class SummaryService {
  constructor(
    private customers = new CustomerRepository(),
    private events = new CustomerEventRepository(),
    private conversations = new ConversationRepository()
  ) {}

  async summarizeSession(
    phone: string,
    restaurantId: string,
    sessionId: string
  ): Promise<string | null> {
    const conv = await this.conversations.findBySessionId(sessionId);
    if (!conv || conv.messages.length < 4) return null;

    const recent = conv.messages.slice(-12);
    const transcript = messagesToText(recent);

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system:
        "Summarize this restaurant WhatsApp conversation in 2-4 short sentences. Include customer name if known, preferences, what they ordered or asked about, and language style. Be factual.",
      prompt: transcript,
    });

    const customer = await this.customers.findByPhoneAndRestaurant(phone, restaurantId);
    const merged = customer?.conversationSummary
      ? `${customer.conversationSummary} ${text}`.slice(-600)
      : text;

    await this.customers.updateProfile(phone, restaurantId, { conversationSummary: merged });

    await this.events.log({
      phone,
      restaurantId,
      type: "summary_updated",
      payload: { summary: merged },
    });

    return merged;
  }
}

export const summaryService = new SummaryService();
