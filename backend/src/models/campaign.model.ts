import mongoose, { Document, Schema } from "mongoose";

export type CampaignType = "event" | "promo" | "reorder_nudge";
export type CampaignStatus = "draft" | "scheduled" | "sending" | "completed" | "failed";

export interface ICampaignSegment {
  type: string;
  itemName?: string;
  minOrders?: number;
  inactiveDays?: number;
}

export interface ICampaign extends Document {
  restaurantId: string;
  name: string;
  type: CampaignType;
  templateName: string;
  templateLanguage: string;
  segment: ICampaignSegment;
  status: CampaignStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  stats: {
    targeted: number;
    sent: number;
    failed: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>(
  {
    restaurantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["event", "promo", "reorder_nudge"], required: true },
    templateName: { type: String, required: true },
    templateLanguage: { type: String, default: "en" },
    segment: {
      type: { type: String, required: true },
      itemName: String,
      minOrders: Number,
      inactiveDays: Number,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "completed", "failed"],
      default: "draft",
    },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    stats: {
      targeted: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const CampaignModel = mongoose.model<ICampaign>("Campaign", campaignSchema);
export default CampaignModel;
