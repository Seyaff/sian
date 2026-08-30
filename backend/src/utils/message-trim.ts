import { ModelMessage } from "ai";

const MAX_AGENT_MESSAGES = 8;

function extractText(message: ModelMessage): string | null {
  if (message.role === "user") {
    return typeof message.content === "string" ? message.content.trim() : null;
  }

  if (message.role === "assistant") {
    if (typeof message.content === "string") {
      return message.content.trim() || null;
    }

    if (Array.isArray(message.content)) {
      const text = message.content
        .filter((part) => part && typeof part === "object" && (part as { type?: string }).type === "text")
        .map((part) => String((part as { text?: string }).text ?? ""))
        .join("\n")
        .trim();
      return text || null;
    }
  }

  return null;
}

/**
 * Groq (gpt-oss) cannot replay raw tool-call / tool-result blobs from session history.
 * Persist and send only plain user/assistant text turns.
 */
export function sanitizeMessagesForAgent(messages: ModelMessage[]): ModelMessage[] {
  const textOnly: ModelMessage[] = [];

  for (const message of messages) {
    if (message.role !== "user" && message.role !== "assistant") continue;

    const text = extractText(message);
    if (!text) continue;

    const last = textOnly[textOnly.length - 1];
    if (last && last.role === message.role) {
      last.content = `${last.content}\n${text}`;
      continue;
    }

    textOnly.push({ role: message.role, content: text });
  }

  return textOnly;
}

export function trimMessagesForAgent(messages: ModelMessage[]): ModelMessage[] {
  const sanitized = sanitizeMessagesForAgent(messages);

  if (sanitized.length <= MAX_AGENT_MESSAGES) {
    return sanitized;
  }

  return sanitized.slice(-MAX_AGENT_MESSAGES);
}

export function toStoredAssistantMessage(text: string): ModelMessage {
  return { role: "assistant", content: text.trim() };
}

export function extractAgentReplyText(result: {
  text: string;
  content: Array<{ type: string; text?: string }>;
}): string {
  if (result.text?.trim()) {
    return result.text.trim();
  }

  for (const part of result.content) {
    if (part.type === "text" && part.text?.trim()) {
      return part.text.trim();
    }
  }

  return "Theek hai! Aur kuch chahiye to likh dein 😊";
}
