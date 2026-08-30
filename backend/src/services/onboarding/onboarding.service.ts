import path from "path";
import { OnboardingRepository, CreateOnboardingCaseInput } from "../../repositories/onboarding/onboarding.repository";
import { RestaurantService } from "../../modules/restaurant/restaurant.service";
import { buildWelcomePack } from "./onboarding-documents.service";
import { OnboardingChecklist, OnboardingStage } from "../../domain/types/onboarding.types";
import { updateOnboardingCaseSchema } from "../../validators/onboarding.validation";
import { z } from "zod";

type UpdateOnboardingCaseInput = z.infer<typeof updateOnboardingCaseSchema>;
import { BadRequestError, NotFoundError } from "../../utils/appError";
import { IOnboardingCase } from "../../models/onboarding-case.model";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export class OnboardingService {
  constructor(
    private repo = new OnboardingRepository(),
    private restaurantService = new RestaurantService()
  ) {}

  createCase(input: CreateOnboardingCaseInput) {
    return this.repo.create(input);
  }

  listCases() {
    return this.repo.findAll();
  }

  async getCase(id: string) {
    const onboardingCase = await this.repo.findById(id);
    if (!onboardingCase) throw new NotFoundError("Onboarding case not found");
    return onboardingCase;
  }

  async updateCase(id: string, data: UpdateOnboardingCaseInput) {
    const updated = await this.repo.update(id, data);
    if (!updated) throw new NotFoundError("Onboarding case not found");
    return updated;
  }

  getWelcomePack(id: string) {
    return this.getCase(id).then(buildWelcomePack);
  }

  async appendChatMessage(id: string, role: "user" | "assistant", content: string) {
    const updated = await this.repo.appendMessage(id, role, content);
    if (!updated) throw new NotFoundError("Onboarding case not found");
    return updated;
  }

  getChatHistory(onboardingCase: IOnboardingCase) {
    return onboardingCase.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
  }

  async provision(id: string, options: { ingestMenu?: boolean } = {}) {
    const onboardingCase = await this.getCase(id);

    if (!onboardingCase.whatsappPhoneNumberId) {
      throw new BadRequestError("whatsappPhoneNumberId is required before provisioning");
    }

    const baseSlug = slugify(onboardingCase.businessName);
    const slug = onboardingCase.branchName
      ? `${baseSlug}-${slugify(onboardingCase.branchName)}`
      : baseSlug;

    const restaurant = await this.restaurantService.createRestaurant({
      name: onboardingCase.branchName
        ? `${onboardingCase.businessName} — ${onboardingCase.branchName}`
        : onboardingCase.businessName,
      slug,
      whatsappPhoneNumberId: onboardingCase.whatsappPhoneNumberId,
      pineconeNamespace: slug,
      greetingMessage: `Assalam o Alaikum! Welcome to ${onboardingCase.businessName}.`,
      isActive: true,
    });

    let ingestResult = null;
    if (options.ingestMenu && onboardingCase.menuFilePath) {
      const resolved = path.resolve(onboardingCase.menuFilePath);
      ingestResult = await this.restaurantService.ingestKnowledgeBase(String(restaurant._id), resolved);
      await this.repo.update(id, {
        checklist: { menu_ingested: true },
        status: "go_live",
      });
    } else {
      await this.repo.update(id, { status: "provisioning" });
    }

    await this.repo.update(id, {
      restaurantId: String(restaurant._id),
      restaurantSlug: slug,
      checklist: { whatsapp_access_confirmed: true },
    });

    const final = await this.getCase(id);
    return {
      restaurant,
      ingestResult,
      onboardingCase: final,
    };
  }
}

export const onboardingService = new OnboardingService();
