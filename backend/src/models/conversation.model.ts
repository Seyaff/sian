import mongoose, { Document, Schema } from "mongoose";
import { ModelMessage } from "ai";
import { SessionState } from "../domain/types/session-state.types";
import { PendingApproval } from "../domain/types/pending-approval.types";

export interface IConversation extends Document {
  sessionId: string;
  restaurantId: string;
  platform: "whatsapp" | "api";
  userIdentifier: string;
  messages: ModelMessage[];
  sessionState?: SessionState;
  archived: boolean;
  pendingApproval?: PendingApproval;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<ModelMessage>(
  {
    role: { type: String, required: true },
    content: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const sessionStateSchema = new Schema(
  {
    currentIntent: { type: String, default: null },
    cartDraft: [{ name: String, quantity: Number, price: Number }],
    lastCategoryViewed: { type: String },
    qualifyingAnswers: {
      partySize: Number,
      spicy: Boolean,
      meatPreference: String,
    },
    languageStyle: { type: String, default: "mixed" },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const pendingApprovalSchema = new Schema(
  {
    approvalId: { type: String, required: true },
    toolCall: {
      toolCallId: { type: String, required: true },
      toolName: { type: String, required: true },
      input: { type: Schema.Types.Mixed, required: true },
    },
  },
  { _id: false }
);

const conversationSchema = new Schema<IConversation>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    restaurantId: { type: String, required: true, index: true },
    platform: { type: String, enum: ["whatsapp", "api"], required: true },
    userIdentifier: { type: String, required: true, index: true },
    messages: { type: [messageSchema], default: [] },
    sessionState: { type: sessionStateSchema, default: () => ({}) },
    archived: { type: Boolean, default: false },
    pendingApproval: { type: pendingApprovalSchema, required: false },
  },
  { timestamps: true }
);

conversationSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

const ConversationModel = mongoose.model<IConversation>("Conversation", conversationSchema);
export default ConversationModel;
