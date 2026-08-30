export interface PendingToolCall {
  toolCallId: string;
  toolName: string;
  input: Record<string, unknown>;
}

export interface PendingApproval {
  approvalId: string;
  toolCall: PendingToolCall;
}
