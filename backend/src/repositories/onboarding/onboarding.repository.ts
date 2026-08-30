import OnboardingCaseModel, { IOnboardingCase } from "../../models/onboarding-case.model";
import { OnboardingChecklist, OnboardingStage } from "../../domain/types/onboarding.types";
import { updateOnboardingCaseSchema } from "../../validators/onboarding.validation";
import { z } from "zod";

type UpdateOnboardingCaseInput = z.infer<typeof updateOnboardingCaseSchema>;

export interface CreateOnboardingCaseInput {
  businessName: string;
  branchName?: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  dailyOrderVolume?: number;
  plan?: "host" | "sales" | "multi";
  setupFee: number;
  monthlyFee: number;
  notes?: string;
  assignedTo?: string;
  targetGoLiveDate?: Date;
}

export class OnboardingRepository {
  async create(data: CreateOnboardingCaseInput): Promise<IOnboardingCase> {
    const doc = new OnboardingCaseModel({
      ...data,
      plan: data.plan ?? "sales",
      status: "lead",
    });
    return doc.save();
  }

  async findById(id: string): Promise<IOnboardingCase | null> {
    return OnboardingCaseModel.findById(id).lean();
  }

  async findAll(): Promise<IOnboardingCase[]> {
    return OnboardingCaseModel.find().sort({ createdAt: -1 }).lean();
  }

  async update(
    id: string,
    data: UpdateOnboardingCaseInput & Partial<{
      restaurantId: string;
      restaurantSlug: string;
      plan: string;
      setupFee: number;
      monthlyFee: number;
      targetGoLiveDate: Date;
    }>
  ): Promise<IOnboardingCase | null> {
    const update: Record<string, unknown> = { ...data };

    if (data.checklist) {
      for (const [key, value] of Object.entries(data.checklist)) {
        update[`checklist.${key}`] = value;
      }
      delete update.checklist;
    }

    return OnboardingCaseModel.findByIdAndUpdate(id, { $set: update }, { returnDocument: "after" }).lean();
  }

  async appendMessage(
    id: string,
    role: "user" | "assistant",
    content: string
  ): Promise<IOnboardingCase | null> {
    return OnboardingCaseModel.findByIdAndUpdate(
      id,
      { $push: { messages: { role, content, at: new Date() } } },
      { returnDocument: "after" }
    ).lean();
  }
}
