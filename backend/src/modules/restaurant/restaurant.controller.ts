import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../../config/http.config";
import { RestaurantService } from "./restaurant.service";
import { createRestaurantSchema, ingestRestaurantSchema } from "../../validators/restaurant.validation";

export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createRestaurantSchema.parse(req.body);
    const restaurant = await this.restaurantService.createRestaurant({
      name: parsed.name,
      slug: parsed.slug,
      whatsappPhoneNumberId: parsed.whatsappPhoneNumberId,
      pineconeNamespace: parsed.pineconeNamespace,
      isActive: parsed.isActive,
      ...(parsed.greetingMessage ? { greetingMessage: parsed.greetingMessage } : {}),
    });

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Restaurant created successfully",
      data: restaurant,
    });
  });

  list = asyncHandler(async (_req: Request, res: Response) => {
    const restaurants = await this.restaurantService.listRestaurants();

    return res.status(HTTPSTATUS.OK).json({
      message: "Restaurants fetched successfully",
      data: restaurants,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const restaurant = await this.restaurantService.getRestaurantById(id);

    return res.status(HTTPSTATUS.OK).json({
      message: "Restaurant fetched successfully",
      data: restaurant,
    });
  });

  ingest = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const { filePath } = ingestRestaurantSchema.parse(req.body);
    const result = await this.restaurantService.ingestKnowledgeBase(id, filePath);

    return res.status(HTTPSTATUS.OK).json({
      message: "Knowledge base ingested successfully",
      data: result,
    });
  });
}
