import { Router } from "express";
import { OrderController } from "./order.controller";

const orderController = new OrderController();
const orderRoutes = Router();

orderRoutes.get("/", orderController.listActive);
orderRoutes.get("/:id", orderController.getById);
orderRoutes.patch("/:id/preparing", orderController.markPreparing);
orderRoutes.patch("/:id/ready", orderController.markReady);

export default orderRoutes;
