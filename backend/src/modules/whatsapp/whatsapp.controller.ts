import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../../config/http.config";
import { Env } from "../../config/app.config";
import { AgentService } from "../agent/agent.service";

export class WhatsAppController {
  constructor(private agentService: AgentService) {}

  // 1. GET: Webhook Verification
  verifyWebhook = asyncHandler(async (req: Request, res: Response) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === Env.WHATSAPP_VERIFY_TOKEN) {
      console.log("[WHATSAPP] Webhook verified successfully.");
      return res.status(HTTPSTATUS.OK).send(challenge);
    }

    return res.sendStatus(403);
  });

  // 2. POST: Inbound Message Handling
  handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    // CRITICAL: Acknowledge Meta within 3 seconds to avoid retries
    res.status(HTTPSTATUS.OK).send("EVENT_RECEIVED");

    const body = req.body;

    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0]?.value;
      const message = change?.messages?.[0];

      if (message && message.type === "text") {
        const from = message.from; // Phone number sending the message
        const userQuery = message.text.body;

        console.log(`[WHATSAPP INBOUND] From: ${from} | Query: ${userQuery}`);

        // Async dispatch to Agent logic
        this.processUserQuery(from, userQuery).catch((err) =>
          console.error("[WHATSAPP AGENT ERROR]", err)
        );
      }
    }
  });

  private processUserQuery = async (from: string, query: string) => {
    // Bridge inbound message to AgentService
    const agentResponse = await this.agentService.chat(query);

    let replyText = agentResponse.text;

    // Handle tool approval fallback if an action requires manual review
    if (agentResponse.status === "REQUIRES_APPROVAL") {
      replyText = "Your request requires agent approval. Reference ID: " + agentResponse.approvalId;
    }

    if (replyText) {
      await this.sendWhatsAppMessage(from, replyText);
    }
  };

  private sendWhatsAppMessage = async (to: string, text: string) => {
    const url = `https://graph.facebook.com/v20.0/${Env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body: text },
      }),
    });
  };
}