import axios from "axios";
import { Env } from "../../config/app.config";

export class WhatsAppOutboundService {
  private getHeaders() {
    return {
      Authorization: `Bearer ${Env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    };
  }

  private getBaseUrl(phoneNumberId?: string) {
    const id = phoneNumberId || Env.WHATSAPP_PHONE_NUMBER_ID;
    return `https://graph.facebook.com/v20.0/${id}/messages`;
  }

  async sendText(to: string, body: string, whatsappPhoneNumberId?: string): Promise<void> {
    await axios.post(
      this.getBaseUrl(whatsappPhoneNumberId),
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body },
      },
      { headers: this.getHeaders() }
    );
  }

  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    parameters: string[],
    whatsappPhoneNumberId?: string
  ): Promise<void> {
    await axios.post(
      this.getBaseUrl(whatsappPhoneNumberId),
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components: parameters.length
            ? [
                {
                  type: "body",
                  parameters: parameters.map((text) => ({
                    type: "text",
                    text,
                  })),
                },
              ]
            : [],
        },
      },
      { headers: this.getHeaders() }
    );
  }
}

export const whatsAppOutbound = new WhatsAppOutboundService();
