import { z } from "zod";
import { nullableString } from "../utils/zod-helpers";

export const onboardingContextSchema = z.object({
  caseId: z.string().trim().min(1),
});

export const createOnboardingCaseSchema = z.object({
  businessName: z.string().trim().min(1),
  branchName: nullableString(),
  ownerName: z.string().trim().min(1),
  ownerPhone: z.string().trim().min(1),
  ownerEmail: nullableString(),
  dailyOrderVolume: z.number().int().positive().optional(),
  plan: z.enum(["host", "sales", "multi"]).optional().default("sales"),
  setupFee: z.number().nonnegative(),
  monthlyFee: z.number().nonnegative(),
  notes: nullableString(),
  assignedTo: nullableString(),
});

export const updateOnboardingCaseSchema = z.object({
  businessName: z.string().trim().min(1).optional(),
  branchName: nullableString(),
  ownerName: z.string().trim().min(1).optional(),
  ownerPhone: z.string().trim().min(1).optional(),
  ownerEmail: nullableString(),
  dailyOrderVolume: z.number().int().positive().optional(),
  whatsappPhoneNumberId: nullableString(),
  menuFilePath: nullableString(),
  notes: nullableString(),
  status: z
    .enum(["lead", "discovery", "agreement", "collecting_assets", "provisioning", "go_live", "completed", "stalled"])
    .optional(),
  checklist: z
    .object({
      owner_contacted: z.boolean().optional(),
      menu_pdf_received: z.boolean().optional(),
      whatsapp_access_confirmed: z.boolean().optional(),
      contract_agreed: z.boolean().optional(),
      setup_fee_paid: z.boolean().optional(),
      menu_ingested: z.boolean().optional(),
      test_order_completed: z.boolean().optional(),
      owner_trained: z.boolean().optional(),
    })
    .optional(),
});

export const onboardingChatSchema = z.object({
  message: z.string().trim().min(1),
});

export const provisionOnboardingSchema = z.object({
  ingestMenu: z.boolean().optional().default(false),
});

export const updateOnboardingInfoSchema = z.object({
  businessName: nullableString(),
  branchName: nullableString(),
  ownerName: nullableString(),
  ownerPhone: nullableString(),
  ownerEmail: nullableString(),
  dailyOrderVolume: z.union([z.number().int().positive(), z.null()]).optional(),
  whatsappPhoneNumberId: nullableString(),
  menuFilePath: nullableString(),
  notes: nullableString(),
  status: z
    .enum(["lead", "discovery", "agreement", "collecting_assets", "provisioning", "go_live", "completed", "stalled"])
    .optional(),
});

export const updateOnboardingChecklistSchema = z.object({
  owner_contacted: z.boolean().optional(),
  menu_pdf_received: z.boolean().optional(),
  whatsapp_access_confirmed: z.boolean().optional(),
  contract_agreed: z.boolean().optional(),
  setup_fee_paid: z.boolean().optional(),
  menu_ingested: z.boolean().optional(),
  test_order_completed: z.boolean().optional(),
  owner_trained: z.boolean().optional(),
});
