import { groq } from "@ai-sdk/groq";
import { google } from "@ai-sdk/google";
import { Env } from "../config/app.config";

export function resolveAgentModel() {
  const modelId = Env.AGENT_MODEL;

  if (modelId.startsWith("gemini")) {
    return google(modelId);
  }

  return groq(modelId);
}
