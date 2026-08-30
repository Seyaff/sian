import { IOnboardingCase } from "../../models/onboarding-case.model";

function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-PK")}`;
}

function formatDate(date = new Date()): string {
  return date.toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" });
}

export function buildWelcomeMessage(onboardingCase: IOnboardingCase): string {
  const branch = onboardingCase.branchName ? ` (${onboardingCase.branchName})` : "";
  return (
    `Assalam o Alaikum ${onboardingCase.ownerName}! 👋\n\n` +
    `Welcome to Siyaf WhatsApp Order Desk.\n\n` +
    `We're excited to onboard *${onboardingCase.businessName}*${branch}.\n\n` +
    `*What happens next:*\n` +
    `1. Review service agreement & setup invoice\n` +
    `2. Share your menu (PDF or clear photos with prices)\n` +
    `3. WhatsApp Business access (or we use a pilot number)\n` +
    `4. We configure your bot — target go-live in *48 hours*\n` +
    `5. Short training for your staff on order approvals\n\n` +
    `You mentioned ~${onboardingCase.dailyOrderVolume ?? "—"} orders/day — we'll help capture more of those on WhatsApp with correct prices.\n\n` +
    `Reply with your menu when ready, or call us with any questions.`
  );
}

export function buildChecklistText(onboardingCase: IOnboardingCase): string {
  const items = [
    ["Owner contacted", onboardingCase.checklist.owner_contacted],
    ["Menu PDF received", onboardingCase.checklist.menu_pdf_received],
    ["WhatsApp access confirmed", onboardingCase.checklist.whatsapp_access_confirmed],
    ["Service agreement agreed", onboardingCase.checklist.contract_agreed],
    ["Setup fee paid", onboardingCase.checklist.setup_fee_paid],
    ["Menu ingested to system", onboardingCase.checklist.menu_ingested],
    ["Test order completed", onboardingCase.checklist.test_order_completed],
    ["Staff trained", onboardingCase.checklist.owner_trained],
  ];

  return items
    .map(([label, done]) => `${done ? "✅" : "⬜"} ${label}`)
    .join("\n");
}

export function buildServiceAgreement(onboardingCase: IOnboardingCase): string {
  const planLabel =
    onboardingCase.plan === "host"
      ? "WhatsApp Host"
      : onboardingCase.plan === "multi"
        ? "Multi-Branch"
        : "WhatsApp Sales";

  return (
    `SERVICE AGREEMENT (DRAFT)\n` +
    `Date: ${formatDate()}\n\n` +
    `Provider: Siyaf / Dev Siyaf\n` +
    `Client: ${onboardingCase.businessName}\n` +
    `Branch: ${onboardingCase.branchName ?? "Primary"}\n` +
    `Contact: ${onboardingCase.ownerName} — ${onboardingCase.ownerPhone}\n\n` +
    `PLAN: ${planLabel}\n` +
    `Setup fee (one-time): ${formatCurrency(onboardingCase.setupFee)}\n` +
    `Monthly fee: ${formatCurrency(onboardingCase.monthlyFee)}/month\n\n` +
    `SCOPE:\n` +
    `- WhatsApp customer support bot (menu, hours, location, orders)\n` +
    `- Order confirmation flow before kitchen receives order\n` +
    `- Owner notifications for new orders\n` +
    `- Customer memory and basic reporting (per plan)\n\n` +
    `CLIENT RESPONSIBILITIES:\n` +
    `- Provide accurate menu with prices\n` +
    `- Maintain WhatsApp Business API access (or approve pilot number)\n` +
    `- Approve/deny orders during pilot\n` +
    `- Pay setup and monthly fees as agreed\n\n` +
    `NOTES:\n` +
    `- Service depends on Meta WhatsApp platform availability\n` +
    `- Menu prices are sourced from client-provided menu; client responsible for accuracy\n` +
    `- This is a draft for discussion; final terms to be confirmed in writing\n\n` +
    `Accepted by: _____________________  Date: __________`
  );
}

export function buildSetupInvoice(onboardingCase: IOnboardingCase): string {
  const invoiceNo = `INV-${String(onboardingCase._id).slice(-6).toUpperCase()}`;
  return (
    `SETUP INVOICE\n` +
    `Invoice #: ${invoiceNo}\n` +
    `Date: ${formatDate()}\n\n` +
    `Bill to:\n` +
    `${onboardingCase.businessName}\n` +
    `${onboardingCase.ownerName}\n` +
    `${onboardingCase.ownerPhone}\n` +
    `${onboardingCase.ownerEmail ?? ""}\n\n` +
    `Description: WhatsApp Order Desk — setup & configuration\n` +
    `Plan: ${onboardingCase.plan}\n` +
    `Amount: ${formatCurrency(onboardingCase.setupFee)}\n\n` +
    `Monthly fee (starting after go-live): ${formatCurrency(onboardingCase.monthlyFee)}/month\n\n` +
    `Payment: Bank transfer / JazzCash (details to be shared)\n` +
    `Payment due: Within 7 days of signing\n\n` +
    `Thank you for your business.`
  );
}

export function buildWelcomePack(onboardingCase: IOnboardingCase) {
  return {
    welcomeMessage: buildWelcomeMessage(onboardingCase),
    checklist: buildChecklistText(onboardingCase),
    serviceAgreement: buildServiceAgreement(onboardingCase),
    setupInvoice: buildSetupInvoice(onboardingCase),
    status: onboardingCase.status,
    caseId: String(onboardingCase._id),
  };
}
