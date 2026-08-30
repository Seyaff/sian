import { ModelMessage } from "ai";
import { createOnboardingAgent } from "../../agents/onboarding";
import { onboardingService } from "./onboarding.service";
import { extractAgentReplyText, sanitizeMessagesForAgent } from "../../utils/message-trim";

function buildCaseSummary(onboardingCase: Awaited<ReturnType<typeof onboardingService.getCase>>) {
  return [
    "CURRENT ONBOARDING CASE:",
    `- Business: ${onboardingCase.businessName}${onboardingCase.branchName ? ` (${onboardingCase.branchName})` : ""}`,
    `- Owner: ${onboardingCase.ownerName} — ${onboardingCase.ownerPhone}`,
    `- Daily orders: ${onboardingCase.dailyOrderVolume ?? "unknown"}`,
    `- Plan: ${onboardingCase.plan} | Setup: Rs ${onboardingCase.setupFee} | Monthly: Rs ${onboardingCase.monthlyFee}`,
    `- Status: ${onboardingCase.status}`,
    `- Checklist: ${JSON.stringify(onboardingCase.checklist)}`,
    onboardingCase.notes ? `- Notes: ${onboardingCase.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export class OnboardingAgentService {
  async chat(caseId: string, message: string) {
    const onboardingCase = await onboardingService.getCase(caseId);
    await onboardingService.appendChatMessage(caseId, "user", message);

    const history = onboardingCase.messages.map(
      (m): ModelMessage => ({ role: m.role, content: m.content })
    );
    const messages = sanitizeMessagesForAgent([...history, { role: "user", content: message }]);

    const agent = createOnboardingAgent({
      caseId,
      caseSummary: buildCaseSummary(onboardingCase),
    });

    const result = await agent.generate({ messages });
    const replyText = extractAgentReplyText(result);

    await onboardingService.appendChatMessage(caseId, "assistant", replyText);

    return {
      text: replyText,
      caseId,
      status: (await onboardingService.getCase(caseId)).status,
    };
  }
}

export const onboardingAgentService = new OnboardingAgentService();
