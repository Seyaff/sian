import { Router } from "express";
import { restaurantController } from "./restaurant.module";

const restaurantRoutes = Router();

restaurantRoutes.post("/", restaurantController.create);
restaurantRoutes.get("/", restaurantController.list);
restaurantRoutes.get("/:id", restaurantController.getById);
restaurantRoutes.post("/:id/ingest", restaurantController.ingest);

export default restaurantRoutes;
