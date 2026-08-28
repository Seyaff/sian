import { ModelMessage } from "ai";

const MAX_AGENT_MESSAGES = 8;

export function trimMessagesForAgent(messages: ModelMessage[]): ModelMessage[] {
  if (messages.length <= MAX_AGENT_MESSAGES) {
    return messages;
  }

  return messages.slice(-MAX_AGENT_MESSAGES);
}
