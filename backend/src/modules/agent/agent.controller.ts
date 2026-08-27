import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../../config/http.config";
import { AgentService } from "./agent.service";

export class AgentController {
  constructor(private agentService: AgentService) { }



  chat = asyncHandler(async (req: Request, res: Response) => {
    const { query } = req.body;


    const response = await this.agentService.chat(query);
console.log("Response from controller : " , response)

    return res.status(HTTPSTATUS.OK).json({
      message: response.status === "REQUIRES_APPROVAL"
        ? "Action requires manual approval"
        : "Operation completed",
      data: response,
    });
  });

  handleApproval = asyncHandler(async (req: Request, res: Response) => {
    const { approvalId, approved, reason } = req.body;

    const response = await this.agentService.respondToApproval(approvalId, approved, reason);

    return res.status(HTTPSTATUS.OK).json({
      message: "Approval processed",
      data: response,
    });
  });
}