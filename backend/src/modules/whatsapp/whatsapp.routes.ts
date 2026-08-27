import { Router } from "express";
import { WhatsAppController } from "./whatsapp.controller";
import { AgentService } from "../agent/agent.service";

const whatsappRoutes = Router();
const agentService = new AgentService();
const whatsappController = new WhatsAppController(agentService);

whatsappRoutes.get("/webhook", whatsappController.verifyWebhook);
whatsappRoutes.post("/webhook", whatsappController.handleWebhook);

export default whatsappRoutes;