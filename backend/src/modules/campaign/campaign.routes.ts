import { Router } from "express";
import { CampaignController } from "./campaign.controller";

const campaignController = new CampaignController();
const campaignRoutes = Router();

campaignRoutes.post("/", campaignController.create);
campaignRoutes.get("/", campaignController.list);
campaignRoutes.post("/:id/send", campaignController.send);
campaignRoutes.get("/:id/stats", campaignController.stats);
campaignRoutes.post("/opt-out", campaignController.optOut);

export default campaignRoutes;
