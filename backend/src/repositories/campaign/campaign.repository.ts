import CampaignModel, { ICampaign, ICampaignSegment } from "../../models/campaign.model";
import CampaignRecipientModel from "../../models/campaign-recipient.model";

export class CampaignRepository {
  async create(data: Partial<ICampaign>): Promise<ICampaign> {
    const campaign = new CampaignModel(data);
    return campaign.save();
  }

  async findById(id: string): Promise<ICampaign | null> {
    return CampaignModel.findById(id).lean();
  }

  async updateStatus(
    id: string,
    status: ICampaign["status"],
    extra: Partial<ICampaign> = {}
  ): Promise<ICampaign | null> {
    return CampaignModel.findByIdAndUpdate(id, { $set: { status, ...extra } }, { returnDocument: "after" as const }).lean();
  }

  async updateStats(
    id: string,
    stats: Partial<ICampaign["stats"]>
  ): Promise<void> {
    const campaign = await CampaignModel.findById(id);
    if (!campaign) return;
    campaign.stats = { ...campaign.stats, ...stats };
    await campaign.save();
  }

  async createRecipients(
    campaignId: string,
    recipients: Array<{ customerPhone: string; customerName?: string; templateParams: string[] }>
  ): Promise<number> {
    const docs = recipients.map((r) => ({
      campaignId,
      customerPhone: r.customerPhone,
      customerName: r.customerName,
      templateParams: r.templateParams,
      status: "pending" as const,
    }));
    await CampaignRecipientModel.insertMany(docs, { ordered: false });
    return docs.length;
  }

  async getPendingRecipients(campaignId: string, limit = 50) {
    return CampaignRecipientModel.find({ campaignId, status: "pending" }).limit(limit).lean();
  }

  async markRecipientSent(id: string): Promise<void> {
    await CampaignRecipientModel.findByIdAndUpdate(id, {
      $set: { status: "sent", sentAt: new Date() },
    });
  }

  async markRecipientFailed(id: string, error: string): Promise<void> {
    await CampaignRecipientModel.findByIdAndUpdate(id, {
      $set: { status: "failed", error },
    });
  }

  async getStats(campaignId: string) {
    const [sent, failed, pending] = await Promise.all([
      CampaignRecipientModel.countDocuments({ campaignId, status: "sent" }),
      CampaignRecipientModel.countDocuments({ campaignId, status: "failed" }),
      CampaignRecipientModel.countDocuments({ campaignId, status: "pending" }),
    ]);
    return { sent, failed, pending, total: sent + failed + pending };
  }

  async findScheduledDue(): Promise<ICampaign[]> {
    return CampaignModel.find({
      status: "scheduled",
      scheduledAt: { $lte: new Date() },
    }).lean();
  }
}

export type { ICampaignSegment };
