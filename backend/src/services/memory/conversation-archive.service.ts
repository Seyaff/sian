import { ConversationRepository } from "../../repositories/conversation/conversation.repository";
import { SummaryService } from "./summary.service";
import { buildSessionId } from "../../utils/session";

export class ConversationArchiveService {
  constructor(
    private conversations = new ConversationRepository(),
    private summaryService = new SummaryService()
  ) {}

  async archiveIdleSessions(idleMinutes = 30): Promise<number> {
    const idle = await this.conversations.findIdleSessions(idleMinutes);
    let archived = 0;

    for (const conv of idle) {
      const sessionId = conv.sessionId;
      const phone = conv.userIdentifier;
      const restaurantId = conv.restaurantId;

      await this.summaryService.summarizeSession(phone, restaurantId, sessionId);
      await this.conversations.archiveSession(sessionId);
      archived++;
    }

    return archived;
  }

  getSessionId(restaurantId: string, phone: string) {
    return buildSessionId(restaurantId, phone);
  }
}

export const conversationArchiveService = new ConversationArchiveService();
