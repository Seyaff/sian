import mongoose, { Document, Schema, Types } from "mongoose";

export type RecipientStatus = "pending" | "sent" | "failed" | "skipped";

export interface ICampaignRecipient extends Document {
  campaignId: Types.ObjectId;
  customerPhone: string;
  customerName?: string;
  templateParams: string[];
  status: RecipientStatus;
  error?: string;
  sentAt?: Date;
  createdAt: Date;
}

const campaignRecipientSchema = new Schema<ICampaignRecipient>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true, index: true },
    customerPhone: { type: String, required: true },
    customerName: { type: String },
    templateParams: [{ type: String }],
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "skipped"],
      default: "pending",
    },
    error: { type: String },
    sentAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

campaignRecipientSchema.index({ campaignId: 1, customerPhone: 1 }, { unique: true });

const CampaignRecipientModel = mongoose.model<ICampaignRecipient>(
  "CampaignRecipient",
  campaignRecipientSchema
);
export default CampaignRecipientModel;
