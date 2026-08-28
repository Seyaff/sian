import { CampaignRepository } from "../../repositories/campaign/campaign.repository";
import { CustomerRepository } from "../../repositories/customer/customer.repository";
import { CustomerEventRepository } from "../../repositories/customer-event/customer-event.repository";
import { SegmentService } from "./segment.service";
import { whatsAppOutbound } from "../whatsapp/whatsapp-outbound.service";
import { BadRequestError, NotFoundError } from "../../utils/appError";
import { ICampaign, ICampaignSegment } from "../../models/campaign.model";

const CAMPAIGN_COOLDOWN_DAYS = 7;
const BATCH_SIZE = 20;
const BATCH_DELAY_MS = 1000;

export interface CreateCampaignInput {
  restaurantId: string;
  name: string;
  type: ICampaign["type"];
  templateName: string;
  templateLanguage?: string;
  segment: ICampaignSegment;
  promoText: string;
  discount?: string;
  scheduledAt?: Date;
}

export class CampaignService {
  constructor(
    private campaigns = new CampaignRepository(),
    private customers = new CustomerRepository(),
    private events = new CustomerEventRepository(),
    private segments = new SegmentService()
  ) {}

  async create(input: CreateCampaignInput): Promise<ICampaign> {
    const customers = await this.segments.resolve(input.restaurantId, input.segment);

    const campaign = await this.campaigns.create({
      restaurantId: input.restaurantId,
      name: input.name,
      type: input.type,
      templateName: input.templateName,
      templateLanguage: input.templateLanguage ?? "en",
      segment: input.segment,
      status: input.scheduledAt ? "scheduled" : "draft",
      ...(input.scheduledAt ? { scheduledAt: input.scheduledAt } : {}),
      stats: { targeted: customers.length, sent: 0, failed: 0 },
    });

    const eligible: Array<{ customerPhone: string; customerName?: string; templateParams: string[] }> = [];
    for (const customer of customers) {
      const recentlySent = await this.events.wasRecentlySentCampaign(
        customer.phone,
        input.restaurantId,
        CAMPAIGN_COOLDOWN_DAYS
      );
      if (!recentlySent && customer.marketingOptIn) {
        eligible.push({
          customerPhone: customer.phone,
          ...(customer.name ? { customerName: customer.name } : {}),
          templateParams: this.segments.buildTemplateParams(customer, input.promoText, input.discount),
        });
      }
    }

    await this.campaigns.createRecipients(String(campaign._id), eligible);
    await this.campaigns.updateStats(String(campaign._id), { targeted: eligible.length });

    return (await this.campaigns.findById(String(campaign._id)))!;
  }

  async send(campaignId: string): Promise<{ sent: number; failed: number }> {
    const campaign = await this.campaigns.findById(campaignId);
    if (!campaign) throw new NotFoundError("Campaign not found");
    if (campaign.status === "completed") throw new BadRequestError("Campaign already completed");

    await this.campaigns.updateStatus(campaignId, "sending");

    let sent = 0;
    let failed = 0;

    while (true) {
      const batch = await this.campaigns.getPendingRecipients(campaignId, BATCH_SIZE);
      if (batch.length === 0) break;

      for (const recipient of batch) {
        try {
          await whatsAppOutbound.sendTemplate(
            recipient.customerPhone,
            campaign.templateName,
            campaign.templateLanguage,
            recipient.templateParams
          );

          await this.campaigns.markRecipientSent(String(recipient._id));
          await this.customers.updateLastCampaignAt(recipient.customerPhone, campaign.restaurantId);
          await this.events.log({
            phone: recipient.customerPhone,
            restaurantId: campaign.restaurantId,
            type: "campaign_sent",
            payload: { campaignId, templateName: campaign.templateName },
          });
          sent++;
        } catch (error: any) {
          await this.campaigns.markRecipientFailed(String(recipient._id), error.message || "Send failed");
          failed++;
        }
      }

      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }

    await this.campaigns.updateStatus(campaignId, "completed", { sentAt: new Date() });
    await this.campaigns.updateStats(campaignId, { sent, failed });

    return { sent, failed };
  }

  async getStats(campaignId: string) {
    const campaign = await this.campaigns.findById(campaignId);
    if (!campaign) throw new NotFoundError("Campaign not found");
    const recipientStats = await this.campaigns.getStats(campaignId);
    return { campaign, recipientStats };
  }

  async list(restaurantId: string) {
    const CampaignModel = (await import("../../models/campaign.model")).default;
    return CampaignModel.find({ restaurantId }).sort({ createdAt: -1 }).lean();
  }

  async optOut(phone: string, restaurantId: string): Promise<void> {
    await this.customers.setMarketingOptIn(phone, restaurantId, false);
    await this.events.log({ phone, restaurantId, type: "opted_out" });
  }

  async processScheduled(): Promise<number> {
    const due = await this.campaigns.findScheduledDue();
    for (const campaign of due) {
      await this.send(String(campaign._id));
    }
    return due.length;
  }
}

export const campaignService = new CampaignService();
