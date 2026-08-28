import { RestaurantController } from "./restaurant.controller";
import { RestaurantService } from "./restaurant.service";

const restaurantService = new RestaurantService();
const restaurantController = new RestaurantController(restaurantService);

export { restaurantController, restaurantService };
