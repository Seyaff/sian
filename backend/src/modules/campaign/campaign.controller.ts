import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../../config/http.config";
import { CampaignService } from "../../services/marketing/campaign.service";
import { Env } from "../../config/app.config";
import { z } from "zod";

const createCampaignSchema = z.object({
  restaurantId: z.string().optional(),
  name: z.string().min(1),
  type: z.enum(["event", "promo", "reorder_nudge"]),
  templateName: z.string().min(1),
  templateLanguage: z.string().optional(),
  segment: z.object({
    type: z.string(),
    itemName: z.string().optional(),
    minOrders: z.number().optional(),
    inactiveDays: z.number().optional(),
  }),
  promoText: z.string().min(1),
  discount: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
});

export class CampaignController {
  constructor(private campaignService = new CampaignService()) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createCampaignSchema.parse(req.body);
    const segment = {
      type: parsed.segment.type,
      ...(parsed.segment.itemName ? { itemName: parsed.segment.itemName } : {}),
      ...(parsed.segment.minOrders !== undefined ? { minOrders: parsed.segment.minOrders } : {}),
      ...(parsed.segment.inactiveDays !== undefined ? { inactiveDays: parsed.segment.inactiveDays } : {}),
    };
    const campaign = await this.campaignService.create({
      restaurantId: parsed.restaurantId || Env.DEFAULT_RESTAURANT_ID,
      name: parsed.name,
      type: parsed.type,
      templateName: parsed.templateName,
      segment,
      promoText: parsed.promoText,
      ...(parsed.templateLanguage ? { templateLanguage: parsed.templateLanguage } : {}),
      ...(parsed.discount ? { discount: parsed.discount } : {}),
      ...(parsed.scheduledAt ? { scheduledAt: new Date(parsed.scheduledAt) } : {}),
    });

    return res.status(HTTPSTATUS.CREATED).json({ message: "Campaign created", data: campaign });
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const restaurantId = String(req.query.restaurantId || Env.DEFAULT_RESTAURANT_ID);
    const campaigns = await this.campaignService.list(restaurantId);
    return res.status(HTTPSTATUS.OK).json({ message: "Campaigns fetched", data: campaigns });
  });

  send = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.campaignService.send(String(req.params.id));
    return res.status(HTTPSTATUS.OK).json({ message: "Campaign sent", data: result });
  });

  stats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.campaignService.getStats(String(req.params.id));
    return res.status(HTTPSTATUS.OK).json({ message: "Campaign stats", data: stats });
  });

  optOut = asyncHandler(async (req: Request, res: Response) => {
    const { phone, restaurantId } = req.body;
    await this.campaignService.optOut(phone, restaurantId || Env.DEFAULT_RESTAURANT_ID);
    return res.status(HTTPSTATUS.OK).json({ message: "Customer opted out of marketing" });
  });
}
