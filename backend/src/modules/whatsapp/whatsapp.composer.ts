import { splitWhatsAppMessage } from "../../utils/whatsapp-formatting";

export interface QuickReplyButton {
  id: string;
  title: string;
}

export interface ListRow {
  id: string;
  title: string;
  description?: string;
}

export interface ListSection {
  title: string;
  rows: ListRow[];
}

export type WhatsAppSendFn = (payload: object) => Promise<void>;

export class WhatsAppComposer {
  constructor(
    private readonly send: WhatsAppSendFn,
    private readonly to: string
  ) {}

  async sendText(text: string): Promise<void> {
    const messages = splitWhatsAppMessage(text);
    for (const body of messages) {
      await this.send({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: this.to,
        type: "text",
        text: { preview_url: false, body },
      });
    }
  }

  async sendButtons(body: string, buttons: QuickReplyButton[]): Promise<void> {
    await this.send({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: this.to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: body },
        action: {
          buttons: buttons.slice(0, 3).map((btn) => ({
            type: "reply",
            reply: { id: btn.id, title: btn.title.slice(0, 20) },
          })),
        },
      },
    });
  }

  async sendList(body: string, buttonLabel: string, sections: ListSection[]): Promise<void> {
    await this.send({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: this.to,
      type: "interactive",
      interactive: {
        type: "list",
        body: { text: body },
        action: {
          button: buttonLabel.slice(0, 20),
          sections: sections.map((section) => ({
            title: section.title.slice(0, 24),
            rows: section.rows.slice(0, 10).map((row) => ({
              id: row.id,
              title: row.title.slice(0, 24),
              ...(row.description ? { description: row.description.slice(0, 72) } : {}),
            })),
          })),
        },
      },
    });
  }

  async sendApproval(body: string, approvalId: string): Promise<void> {
    await this.sendButtons(body, [
      { id: `approve_${approvalId}`, title: "Approve" },
      { id: `deny_${approvalId}`, title: "Deny" },
    ]);
  }

  async sendImage(imageUrl: string, caption?: string): Promise<void> {
    await this.send({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: this.to,
      type: "image",
      image: {
        link: imageUrl,
        ...(caption ? { caption: caption.slice(0, 1024) } : {}),
      },
    });
  }
}
