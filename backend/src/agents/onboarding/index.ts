import { ToolLoopAgent, isStepCount } from "ai";
import { resolveAgentModel } from "../resolve-model";
import { OnboardingSystemPrompt } from "../prompts/onboarding.prompt";
import {
  updateOnboardingInfoTool,
  updateOnboardingChecklistTool,
  getOnboardingStatusTool,
  generateWelcomePackTool,
} from "../../tools/onboarding/onboarding.tools";

export interface OnboardingAgentOptions {
  caseId: string;
  caseSummary?: string;
}

export function createOnboardingAgent(options: OnboardingAgentOptions) {
  const instructions = [OnboardingSystemPrompt, options.caseSummary].filter(Boolean).join("\n\n");

  return new ToolLoopAgent({
    model: resolveAgentModel(),
    instructions,
    stopWhen: isStepCount(5),
    tools: {
      updateOnboardingInfoTool,
      updateOnboardingChecklistTool,
      getOnboardingStatusTool,
      generateWelcomePackTool,
    },
    toolsContext: {
      updateOnboardingInfoTool: { caseId: options.caseId },
      updateOnboardingChecklistTool: { caseId: options.caseId },
      getOnboardingStatusTool: { caseId: options.caseId },
      generateWelcomePackTool: { caseId: options.caseId },
    },
  });
}
