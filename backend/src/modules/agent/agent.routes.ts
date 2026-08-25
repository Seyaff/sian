import { Router } from "express";
import { agentController } from "./agent.module";

const agentRoutes = Router()



agentRoutes.post("/chat" , agentController.chat)
agentRoutes.post("/approval" , agentController.handleApproval)

export default agentRoutes