export type OnboardingStage =
  | "lead"
  | "discovery"
  | "agreement"
  | "collecting_assets"
  | "provisioning"
  | "go_live"
  | "completed"
  | "stalled";

export type OnboardingPlan = "host" | "sales" | "multi";

export interface OnboardingChecklist {
  owner_contacted: boolean;
  menu_pdf_received: boolean;
  whatsapp_access_confirmed: boolean;
  contract_agreed: boolean;
  setup_fee_paid: boolean;
  menu_ingested: boolean;
  test_order_completed: boolean;
  owner_trained: boolean;
}

export const defaultOnboardingChecklist = (): OnboardingChecklist => ({
  owner_contacted: false,
  menu_pdf_received: false,
  whatsapp_access_confirmed: false,
  contract_agreed: false,
  setup_fee_paid: false,
  menu_ingested: false,
  test_order_completed: false,
  owner_trained: false,
});

export interface OnboardingCaseData {
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
}
