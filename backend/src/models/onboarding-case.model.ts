import mongoose, { Document, Schema } from "mongoose";
import {
  OnboardingChecklist,
  OnboardingPlan,
  OnboardingStage,
  defaultOnboardingChecklist,
} from "../domain/types/onboarding.types";

export interface IOnboardingCase extends Document {
  businessName: string;
  branchName?: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  dailyOrderVolume?: number;
  plan: OnboardingPlan;
  setupFee: number;
  monthlyFee: number;
  status: OnboardingStage;
  checklist: OnboardingChecklist;
  restaurantId?: string;
  restaurantSlug?: string;
  whatsappPhoneNumberId?: string;
  menuFilePath?: string;
  notes?: string;
  assignedTo?: string;
  targetGoLiveDate?: Date;
  messages: Array<{ role: "user" | "assistant"; content: string; at: Date }>;
  createdAt: Date;
  updatedAt: Date;
}

const checklistSchema = new Schema<OnboardingChecklist>(
  {
    owner_contacted: { type: Boolean, default: false },
    menu_pdf_received: { type: Boolean, default: false },
    whatsapp_access_confirmed: { type: Boolean, default: false },
    contract_agreed: { type: Boolean, default: false },
    setup_fee_paid: { type: Boolean, default: false },
    menu_ingested: { type: Boolean, default: false },
    test_order_completed: { type: Boolean, default: false },
    owner_trained: { type: Boolean, default: false },
  },
  { _id: false }
);

const messageSchema = new Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const onboardingCaseSchema = new Schema<IOnboardingCase>(
  {
    businessName: { type: String, required: true, trim: true },
    branchName: { type: String, trim: true },
    ownerName: { type: String, required: true, trim: true },
    ownerPhone: { type: String, required: true, trim: true, index: true },
    ownerEmail: { type: String, trim: true },
    dailyOrderVolume: { type: Number },
    plan: { type: String, enum: ["host", "sales", "multi"], default: "sales" },
    setupFee: { type: Number, required: true },
    monthlyFee: { type: Number, required: true },
    status: {
      type: String,
      enum: ["lead", "discovery", "agreement", "collecting_assets", "provisioning", "go_live", "completed", "stalled"],
      default: "lead",
    },
    checklist: { type: checklistSchema, default: defaultOnboardingChecklist },
    restaurantId: { type: String },
    restaurantSlug: { type: String },
    whatsappPhoneNumberId: { type: String },
    menuFilePath: { type: String },
    notes: { type: String },
    assignedTo: { type: String },
    targetGoLiveDate: { type: Date },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);

const OnboardingCaseModel = mongoose.model<IOnboardingCase>("OnboardingCase", onboardingCaseSchema);
export default OnboardingCaseModel;
