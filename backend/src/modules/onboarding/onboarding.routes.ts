import { Router } from "express";
import { onboardingController } from "./onboarding.controller";

const onboardingRoutes = Router();

onboardingRoutes.post("/cases", onboardingController.create);
onboardingRoutes.get("/cases", onboardingController.list);
onboardingRoutes.get("/cases/:id", onboardingController.get);
onboardingRoutes.patch("/cases/:id", onboardingController.update);
onboardingRoutes.get("/cases/:id/welcome-pack", onboardingController.welcomePack);
onboardingRoutes.post("/cases/:id/chat", onboardingController.chat);
onboardingRoutes.post("/cases/:id/provision", onboardingController.provision);

export default onboardingRoutes;
