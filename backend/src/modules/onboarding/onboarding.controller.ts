import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../../config/http.config";
import { onboardingService } from "../../services/onboarding/onboarding.service";
import { onboardingAgentService } from "../../services/onboarding/onboarding-agent.service";
import {
  createOnboardingCaseSchema,
  updateOnboardingCaseSchema,
  onboardingChatSchema,
  provisionOnboardingSchema,
} from "../../validators/onboarding.validation";

export class OnboardingController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createOnboardingCaseSchema.parse(req.body);
    const onboardingCase = await onboardingService.createCase({
      businessName: parsed.businessName,
      ownerName: parsed.ownerName,
      ownerPhone: parsed.ownerPhone,
      setupFee: parsed.setupFee,
      monthlyFee: parsed.monthlyFee,
      ...(parsed.branchName ? { branchName: parsed.branchName } : {}),
      ...(parsed.ownerEmail ? { ownerEmail: parsed.ownerEmail } : {}),
      ...(parsed.dailyOrderVolume ? { dailyOrderVolume: parsed.dailyOrderVolume } : {}),
      ...(parsed.plan ? { plan: parsed.plan } : {}),
      ...(parsed.notes ? { notes: parsed.notes } : {}),
      ...(parsed.assignedTo ? { assignedTo: parsed.assignedTo } : {}),
    });

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Onboarding case created",
      data: onboardingCase,
    });
  });

  list = asyncHandler(async (_req: Request, res: Response) => {
    const cases = await onboardingService.listCases();
    return res.status(HTTPSTATUS.OK).json({ data: cases });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const onboardingCase = await onboardingService.getCase(id);
    return res.status(HTTPSTATUS.OK).json({ data: onboardingCase });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const parsed = updateOnboardingCaseSchema.parse(req.body);
    const onboardingCase = await onboardingService.updateCase(id, parsed);
    return res.status(HTTPSTATUS.OK).json({
      message: "Onboarding case updated",
      data: onboardingCase,
    });
  });

  welcomePack = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const pack = await onboardingService.getWelcomePack(id);
    return res.status(HTTPSTATUS.OK).json({ data: pack });
  });

  chat = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const { message } = onboardingChatSchema.parse(req.body);
    const result = await onboardingAgentService.chat(id, message);
    return res.status(HTTPSTATUS.OK).json({
      message: "Onboarding agent replied",
      data: result,
    });
  });

  provision = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const { ingestMenu } = provisionOnboardingSchema.parse(req.body);
    const result = await onboardingService.provision(id, { ingestMenu });
    return res.status(HTTPSTATUS.OK).json({
      message: "Restaurant provisioned",
      data: result,
    });
  });
}

export const onboardingController = new OnboardingController();
