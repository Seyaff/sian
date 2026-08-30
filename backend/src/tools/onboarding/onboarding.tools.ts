import { z } from "zod";
import { tool } from "ai";
import { onboardingService } from "../../services/onboarding/onboarding.service";
import {
  onboardingContextSchema,
  updateOnboardingInfoSchema,
  updateOnboardingChecklistSchema,
} from "../../validators/onboarding.validation";
import { cleanString } from "../../utils/zod-helpers";
import { OnboardingChecklist } from "../../domain/types/onboarding.types";

function toChecklistPatch(input: z.infer<typeof updateOnboardingChecklistSchema>): Partial<OnboardingChecklist> {
  const patch: Partial<OnboardingChecklist> = {};
  for (const [key, value] of Object.entries(input) as [keyof OnboardingChecklist, boolean | undefined][]) {
    if (value !== undefined) patch[key] = value;
  }
  return patch;
}

export const updateOnboardingInfoTool = tool({
  contextSchema: onboardingContextSchema,
  description: "Save or update business details collected from the restaurant owner during onboarding.",
  inputSchema: updateOnboardingInfoSchema,
  execute: async (input, { context }) => {
    const payload: Record<string, unknown> = {};

    if (cleanString(input.businessName)) payload.businessName = cleanString(input.businessName);
    if (cleanString(input.branchName)) payload.branchName = cleanString(input.branchName);
    if (cleanString(input.ownerName)) payload.ownerName = cleanString(input.ownerName);
    if (cleanString(input.ownerPhone)) payload.ownerPhone = cleanString(input.ownerPhone);
    if (cleanString(input.ownerEmail)) payload.ownerEmail = cleanString(input.ownerEmail);
    if (input.dailyOrderVolume != null) payload.dailyOrderVolume = input.dailyOrderVolume;
    if (cleanString(input.whatsappPhoneNumberId))
      payload.whatsappPhoneNumberId = cleanString(input.whatsappPhoneNumberId);
    if (cleanString(input.menuFilePath)) payload.menuFilePath = cleanString(input.menuFilePath);
    if (cleanString(input.notes)) payload.notes = cleanString(input.notes);
    if (input.status) payload.status = input.status;

    const updated = await onboardingService.updateCase(context.caseId, payload);
    return { success: true, caseId: context.caseId, status: updated.status };
  },
});

export const updateOnboardingChecklistTool = tool({
  contextSchema: onboardingContextSchema,
  description: "Mark onboarding checklist items as complete or incomplete.",
  inputSchema: updateOnboardingChecklistSchema,
  execute: async (input, { context }) => {
    const updated = await onboardingService.updateCase(context.caseId, { checklist: toChecklistPatch(input) });
    return {
      success: true,
      checklist: updated.checklist,
      status: updated.status,
    };
  },
});

export const getOnboardingStatusTool = tool({
  contextSchema: onboardingContextSchema,
  description: "Get current onboarding status, checklist progress, and what is still missing before go-live.",
  inputSchema: z.object({}),
  execute: async (_input, { context }) => {
    const onboardingCase = await onboardingService.getCase(context.caseId);
    const missing: string[] = [];

    if (!onboardingCase.checklist.menu_pdf_received) missing.push("Menu PDF");
    if (!onboardingCase.whatsappPhoneNumberId) missing.push("WhatsApp phone number ID");
    if (!onboardingCase.checklist.contract_agreed) missing.push("Service agreement");
    if (!onboardingCase.checklist.setup_fee_paid) missing.push("Setup fee payment");

    return {
      caseId: context.caseId,
      businessName: onboardingCase.businessName,
      status: onboardingCase.status,
      checklist: onboardingCase.checklist,
      missingForGoLive: missing,
      restaurantId: onboardingCase.restaurantId ?? null,
    };
  },
});

export const generateWelcomePackTool = tool({
  contextSchema: onboardingContextSchema,
  description:
    "Generate welcome message, checklist, service agreement draft, and setup invoice for the owner. Send these via WhatsApp or email.",
  inputSchema: z.object({}),
  execute: async (_input, { context }) => {
    const pack = await onboardingService.getWelcomePack(context.caseId);
    await onboardingService.updateCase(context.caseId, {
      status: "agreement",
      checklist: { owner_contacted: true },
    });
    return { success: true, ...pack };
  },
});
