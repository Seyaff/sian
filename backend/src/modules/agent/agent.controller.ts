import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../../config/http.config";
import { AgentService } from "./agent.service";

export class AgentController {
  constructor(private agentService: AgentService) { }


  chat = asyncHandler(async (req: Request, res: Response) => {
    const { query, sessionId = "default", restaurantId, phone } = req.body;

    const response = await this.agentService.chat(sessionId, query, {
      restaurantId,
      phone,
    });


    return res.status(HTTPSTATUS.OK).json({
      message: response.status === "REQUIRES_APPROVAL"
        ? "Action requires manual approval"
        : "Operation completed",
      data: response,
    });
  });

  handleApproval = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId = "default", approved, restaurantId, phone } = req.body;

    const response = await this.agentService.handleApprovalDecision(sessionId, Boolean(approved), {
      restaurantId,
      phone,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Approval processed",
      data: response,
    });
  });
}