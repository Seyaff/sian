import RestaurantModel, { IRestaurant } from "../../models/restaurant.model";

export interface CreateRestaurantInput {
  name: string;
  slug: string;
  whatsappPhoneNumberId: string;
  pineconeNamespace: string;
  greetingMessage?: string;
  isActive?: boolean;
}

export class RestaurantRepository {
  async create(data: CreateRestaurantInput): Promise<IRestaurant> {
    const restaurant = new RestaurantModel(data);
    return restaurant.save();
  }

  async findBySlug(slug: string): Promise<IRestaurant | null> {
    return RestaurantModel.findOne({ slug }).lean();
  }

  async findByWhatsAppPhoneNumberId(phoneNumberId: string): Promise<IRestaurant | null> {
    return RestaurantModel.findOne({ whatsappPhoneNumberId: phoneNumberId, isActive: true }).lean();
  }

  async findById(id: string): Promise<IRestaurant | null> {
    return RestaurantModel.findById(id).lean();
  }

  async findAll(): Promise<IRestaurant[]> {
    return RestaurantModel.find().sort({ createdAt: -1 }).lean();
  }
}
