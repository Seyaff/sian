import { ModelMessage } from "ai";
import { ConversationRepository, ConversationData } from "../repositories/conversation/conversation.repository";
import { buildSessionId } from "../utils/session";
import { SessionState, defaultSessionState, normalizeSessionState } from "../domain/types/session-state.types";
import { PendingApproval } from "../domain/types/pending-approval.types";

export interface WhatsAppSessionData {
  messages: ModelMessage[];
  restaurantId: string;
  sessionState?: SessionState;
  pendingApproval?: PendingApproval;
}

const conversationRepo = new ConversationRepository();
const memoryFallback = new Map<string, WhatsAppSessionData>();
const USE_DB = process.env.USE_DB_SESSIONS !== "false";

async function getFromDb(sessionId: string): Promise<WhatsAppSessionData | null> {
  if (!USE_DB) return null;
  try {
    const conv = await conversationRepo.findBySessionId(sessionId);
    if (!conv) return null;
    const result: WhatsAppSessionData = {
      messages: conv.messages,
      restaurantId: conv.restaurantId,
      sessionState: normalizeSessionState(conv.sessionState),
    };
    if (conv.pendingApproval?.toolCall?.input != null) {
      result.pendingApproval = {
        approvalId: conv.pendingApproval.approvalId,
        toolCall: {
          toolCallId: conv.pendingApproval.toolCall.toolCallId,
          toolName: conv.pendingApproval.toolCall.toolName,
          input: conv.pendingApproval.toolCall.input as Record<string, unknown>,
        },
      };
    }
    return result;
  } catch (error) {
    console.error("[SESSION DB ERROR] Falling back to memory:", error);
    return null;
  }
}

async function saveToDb(
  sessionId: string,
  data: WhatsAppSessionData,
  phone: string,
  platform: "whatsapp" | "api" = "whatsapp"
): Promise<void> {
  if (!USE_DB) return;
  try {
    const upsertData: ConversationData = {
      sessionId,
      restaurantId: data.restaurantId,
      platform,
      userIdentifier: phone,
      messages: data.messages,
    };
    if (data.sessionState) upsertData.sessionState = data.sessionState;
    if (data.pendingApproval) upsertData.pendingApproval = data.pendingApproval;
    await conversationRepo.upsert(upsertData);
  } catch (error) {
    console.error("[SESSION DB ERROR] Save failed:", error);
  }
}

async function deleteFromDb(sessionId: string): Promise<void> {
  if (!USE_DB) return;
  try {
    await conversationRepo.delete(sessionId);
  } catch (error) {
    console.error("[SESSION DB ERROR] Delete failed:", error);
  }
}

export async function getWhatsAppSession(
  phone: string,
  restaurantId: string
): Promise<WhatsAppSessionData> {
  const sessionId = buildSessionId(restaurantId, phone);
  const dbData = await getFromDb(sessionId);
  if (dbData) return dbData;

  if (!memoryFallback.has(sessionId)) {
    memoryFallback.set(sessionId, { messages: [], restaurantId, sessionState: defaultSessionState() });
  }
  return memoryFallback.get(sessionId)!;
}

export async function updateWhatsAppSession(
  phone: string,
  restaurantId: string,
  data: Partial<WhatsAppSessionData>,
  platform: "whatsapp" | "api" = "whatsapp"
): Promise<void> {
  const sessionId = buildSessionId(restaurantId, phone);
  const current = await getWhatsAppSession(phone, restaurantId);
  const updated = { ...current, ...data, restaurantId };

  if (USE_DB) {
    await saveToDb(sessionId, updated, phone, platform);
  } else {
    memoryFallback.set(sessionId, updated);
  }
}

export async function setPendingApproval(
  phone: string,
  restaurantId: string,
  pendingApproval: PendingApproval,
  platform: "whatsapp" | "api" = "whatsapp"
): Promise<void> {
  await updateWhatsAppSession(phone, restaurantId, { pendingApproval }, platform);
}

export async function clearPendingApproval(
  phone: string,
  restaurantId: string,
  platform: "whatsapp" | "api" = "whatsapp"
): Promise<void> {
  const sessionId = buildSessionId(restaurantId, phone);

  if (USE_DB) {
    await conversationRepo.clearPendingApproval(sessionId);
  }

  const current = memoryFallback.get(sessionId);
  if (current) {
    delete current.pendingApproval;
    memoryFallback.set(sessionId, current);
  }
}

export async function appendMessages(
  phone: string,
  restaurantId: string,
  messages: ModelMessage[],
  platform: "whatsapp" | "api" = "whatsapp"
): Promise<void> {
  const current = await getWhatsAppSession(phone, restaurantId);
  await updateWhatsAppSession(phone, restaurantId, { messages: [...current.messages, ...messages] }, platform);
}

export async function clearWhatsAppSession(phone: string, restaurantId: string): Promise<void> {
  const sessionId = buildSessionId(restaurantId, phone);
  await deleteFromDb(sessionId);
  memoryFallback.delete(sessionId);
}

export function getAllWhatsAppSessions(): Map<string, WhatsAppSessionData> {
  return memoryFallback;
}

export { conversationRepo };
