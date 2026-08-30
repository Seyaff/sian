import { ModelMessage } from "ai";
import {
  appendMessages,
  getWhatsAppSession,
  updateWhatsAppSession,
} from "./whatsapp-session";
import { SessionState, defaultSessionState, normalizeSessionState } from "../domain/types/session-state.types";

export class SessionWriter {
  constructor(
    private readonly phone: string,
    private readonly restaurantId: string
  ) {}

  async appendUserMessage(text: string): Promise<void> {
    const userMessage: ModelMessage = { role: "user", content: text };
    await appendMessages(this.phone, this.restaurantId, [userMessage]);
    await this.touchActivity();
  }

  async appendAssistantMessage(text: string): Promise<void> {
    if (!text.trim()) return;
    const assistantMessage: ModelMessage = { role: "assistant", content: text };
    await appendMessages(this.phone, this.restaurantId, [assistantMessage]);
    await this.touchActivity();
  }

  async updateSessionState(partial: Partial<SessionState>): Promise<void> {
    const session = await getWhatsAppSession(this.phone, this.restaurantId);
    const current = normalizeSessionState(session.sessionState);
    await updateWhatsAppSession(this.phone, this.restaurantId, {
      sessionState: {
        ...current,
        ...partial,
        qualifyingAnswers: {
          ...current.qualifyingAnswers,
          ...(partial.qualifyingAnswers ?? {}),
        },
        lastActivityAt: new Date(),
      },
    });
  }

  async getSessionState(): Promise<SessionState> {
    const session = await getWhatsAppSession(this.phone, this.restaurantId);
    return normalizeSessionState(session.sessionState);
  }

  private async touchActivity(): Promise<void> {
    const session = await getWhatsAppSession(this.phone, this.restaurantId);
    const current = normalizeSessionState(session.sessionState);
    await updateWhatsAppSession(this.phone, this.restaurantId, {
      sessionState: { ...current, lastActivityAt: new Date() },
    });
  }
}
