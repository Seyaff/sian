import { ModelMessage } from "ai";
import ConversationModel, { IConversation } from "../../models/conversation.model";
import { SessionState } from "../../domain/types/session-state.types";

export interface ConversationData {
  sessionId: string;
  restaurantId: string;
  platform: "whatsapp" | "api";
  userIdentifier: string;
  messages: ModelMessage[];
  sessionState?: SessionState;
  archived?: boolean;
  pendingApproval?: {
    approvalId: string;
    toolCall: { toolCallId: string; toolName: string };
  };
}

export class ConversationRepository {
  async findBySessionId(sessionId: string): Promise<IConversation | null> {
    return ConversationModel.findOne({ sessionId }).lean();
  }

  async findByUserIdentifier(userIdentifier: string, platform: "whatsapp" | "api"): Promise<IConversation[]> {
    return ConversationModel.find({ userIdentifier, platform }).sort({ updatedAt: -1 }).lean();
  }

  async create(data: ConversationData): Promise<IConversation> {
    const conversation = new ConversationModel(data);
    return conversation.save();
  }

  async updateMessages(sessionId: string, messages: ModelMessage[]): Promise<IConversation | null> {
    return ConversationModel.findOneAndUpdate(
      { sessionId },
      { $set: { messages, updatedAt: new Date() } },
      { new: true }
    ).lean();
  }

  async updatePendingApproval(
    sessionId: string,
    pendingApproval: ConversationData["pendingApproval"]
  ): Promise<IConversation | null> {
    return ConversationModel.findOneAndUpdate(
      { sessionId },
      { $set: { pendingApproval, updatedAt: new Date() } },
      { new: true }
    ).lean();
  }

  async clearPendingApproval(sessionId: string): Promise<IConversation | null> {
    return ConversationModel.findOneAndUpdate(
      { sessionId },
      { $unset: { pendingApproval: "" }, $set: { updatedAt: new Date() } },
      { new: true }
    ).lean();
  }

  async upsert(data: ConversationData): Promise<IConversation> {
    return ConversationModel.findOneAndUpdate(
      { sessionId: data.sessionId },
      { $set: { ...data, updatedAt: new Date() } },
      { upsert: true, new: true }
    ).lean();
  }

  async delete(sessionId: string): Promise<void> {
    await ConversationModel.deleteOne({ sessionId });
  }

  async archiveSession(sessionId: string): Promise<IConversation | null> {
    return ConversationModel.findOneAndUpdate(
      { sessionId },
      { $set: { archived: true, messages: [], updatedAt: new Date() } },
      { new: true }
    ).lean();
  }

  async findIdleSessions(idleMinutes: number): Promise<IConversation[]> {
    const cutoff = new Date(Date.now() - idleMinutes * 60 * 1000);
    return ConversationModel.find({
      archived: false,
      "sessionState.lastActivityAt": { $lt: cutoff },
      messages: { $exists: true, $not: { $size: 0 } },
    }).lean();
  }

  async deleteOldSessions(olderThanDays: number = 90): Promise<number> {
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const result = await ConversationModel.deleteMany({ updatedAt: { $lt: cutoff } });
    return result.deletedCount;
  }
}