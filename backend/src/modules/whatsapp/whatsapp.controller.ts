import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../../config/http.config";
import { Env } from "../../config/app.config";
import { whatsappService } from "./whatsapp.module";

export class WhatsappController {
  test = asyncHandler(async (_req: Request, res: Response) => {
    return res.status(HTTPSTATUS.OK).json({
      message: "This was a test",
    });
  });

  verifyWebhook = asyncHandler(async (req: Request, res: Response) => {
    const mode = Array.isArray(req.query["hub.mode"])
      ? req.query["hub.mode"][0]
      : req.query["hub.mode"];

    const token = Array.isArray(req.query["hub.verify_token"])
      ? req.query["hub.verify_token"][0]
      : req.query["hub.verify_token"];

    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === Env.WHATSAPP_VERIFY_TOKEN) {
      console.log("[WHATSAPP VERIFY SUCCESS] Returning challenge back to Meta:", challenge);
      return res.status(HTTPSTATUS.OK).send(challenge);
    }

    console.error("[WHATSAPP VERIFY FAILED] Mismatch detected. Sending 403.");
    return res.sendStatus(403);
  });

  handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    try {
      const entry = req.body?.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;
      const whatsappPhoneNumberId = value?.metadata?.phone_number_id;

      if (messages && messages.length > 0) {
        const message = messages[0];
        const from = message.from;
        const messageId = message.id;

        if (message.type === "interactive") {
          if (message.interactive?.type === "button_reply") {
            const buttonId = message.interactive.button_reply.id;
            console.log("[WHATSAPP BUTTON REPLY]", { from, buttonId, whatsappPhoneNumberId });
            await whatsappService.handleInboundMessage(from, buttonId, {
              whatsappPhoneNumberId,
              messageId,
              isInteractive: true,
            });
          } else if (message.interactive?.type === "list_reply") {
            const listId = message.interactive.list_reply.id;
            console.log("[WHATSAPP LIST REPLY]", { from, listId, whatsappPhoneNumberId });
            await whatsappService.handleInboundMessage(from, listId, {
              whatsappPhoneNumberId,
              messageId,
              isInteractive: true,
            });
          }
        } else if (message.type === "text") {
          const messageBody = message.text?.body;

          if (from && messageBody) {
            console.log("[WHATSAPP TEXT MESSAGE]", { from, messageBody, whatsappPhoneNumberId });
            await whatsappService.handleInboundMessage(from, messageBody, {
              whatsappPhoneNumberId,
              messageId,
            });
          }
        }
      }
    } catch (error) {
      console.error("[WHATSAPP HANDLE ERROR]", error);
    }

    return res.status(HTTPSTATUS.OK).send("EVENT_RECEIVED");
  });
}
