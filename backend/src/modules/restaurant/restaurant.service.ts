import path from "path";
import { RestaurantRepository } from "../../repositories/restaurant/restaurant.repository";
import { ingestPdfToPinecone } from "../../services/rag/ingestion.service";
import { BadRequestError, NotFoundError } from "../../utils/appError";
import { CreateRestaurantInput } from "../../repositories/restaurant/restaurant.repository";

export class RestaurantService {
  constructor(private restaurantRepo = new RestaurantRepository()) {}

  async createRestaurant(data: CreateRestaurantInput) {
    const existingSlug = await this.restaurantRepo.findBySlug(data.slug);
    if (existingSlug) {
      throw new BadRequestError(`Restaurant with slug "${data.slug}" already exists`);
    }

    const existingPhone = await this.restaurantRepo.findByWhatsAppPhoneNumberId(data.whatsappPhoneNumberId);
    if (existingPhone) {
      throw new BadRequestError("WhatsApp phone number ID is already registered");
    }

    return this.restaurantRepo.create(data);
  }

  async getRestaurantById(id: string) {
    const restaurant = await this.restaurantRepo.findById(id);
    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }
    return restaurant;
  }

  async getRestaurantByWhatsAppPhoneNumberId(phoneNumberId: string) {
    return this.restaurantRepo.findByWhatsAppPhoneNumberId(phoneNumberId);
  }

  async listRestaurants() {
    return this.restaurantRepo.findAll();
  }

  async ingestKnowledgeBase(restaurantId: string, filePath: string) {
    const restaurant = await this.restaurantRepo.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    const resolvedPath = path.resolve(filePath);
    return ingestPdfToPinecone(resolvedPath, restaurant.pineconeNamespace);
  }
}
