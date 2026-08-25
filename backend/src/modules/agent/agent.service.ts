import { InvalidToolApprovalSignatureError, ModelMessage, ToolApprovalResponse } from "ai";
import createUserAgent from "../../agents";

interface CustomToolApprovalResponse extends ToolApprovalResponse {
  status : string
  toolCall : {
    toolCallId : string,
    toolName : string,
   
  }
}

// NOTE: In production, load/persist these messages in Redis or your DB per conversation session.
const messages: ModelMessage[] = [];

export class AgentService {
  
  // Turn 1: Process initial query
  chat = async (query: string) => {
    messages.push({ role: "user", content: query });

    const result = await createUserAgent.generate({ messages });
    

    const approvals :CustomToolApprovalResponse[] = []
   
    messages.push(...result.responseMessages);

    for(const part of result.content) {
      console.log("Result Context is this", part)

      if(part.type === "tool-approval-request" && !part.isAutomatic) {

        
        const response : CustomToolApprovalResponse = {
          status : "REQUIRES_APPROVAL",
          type : "tool-approval-response",
          approvalId : part.approvalId,
          approved : false,
          reason : "User will allow or deny the request",
          toolCall : part.toolCall
        }

        approvals.push(response)

        
        messages.push({ role: 'tool', content: approvals });

        return response

      }
    }



   
   

    return {
      status: "COMPLETED",
      text: result.text,
      result : result
    };
  };

  // Turn 2: Process Postman decision (Approve / Deny)
  respondToApproval = async (approvalId: string, approved: boolean, reason?: string) => {
    const approvalPayload: ToolApprovalResponse[] = [
      {
        type: "tool-approval-response",
        approvalId,
        approved,
        reason: reason || (approved ? "Approved via API" : "Denied by user"),
      },
    ];

    // Push tool approval decision to conversation history
    messages.push({ role: "tool", content: approvalPayload });

    // Re-run the agent with the updated history
    const result = await createUserAgent.generate({ messages });

    // Append final execution history
    messages.push(...result.responseMessages);

    return {
      status: "COMPLETED",
      text: result.text,
    };
  };
}