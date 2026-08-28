import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../../config/http.config";
import { OrderService } from "../../services/order/order.service";
import { Env } from "../../config/app.config";

export class OrderController {
  constructor(private orderService = new OrderService()) {}

  listActive = asyncHandler(async (req: Request, res: Response) => {
    const restaurantId = String(req.query.restaurantId || Env.DEFAULT_RESTAURANT_ID);
    const orders = await this.orderService.getActiveOrders(restaurantId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Active orders fetched",
      data: orders,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const order = await this.orderService.getOrder(String(req.params.id));

    return res.status(HTTPSTATUS.OK).json({
      message: "Order fetched",
      data: order,
    });
  });

  markPreparing = asyncHandler(async (req: Request, res: Response) => {
    const order = await this.orderService.markPreparing(String(req.params.id));

    return res.status(HTTPSTATUS.OK).json({
      message: "Order marked as preparing",
      data: order,
    });
  });

  markReady = asyncHandler(async (req: Request, res: Response) => {
    const order = await this.orderService.markReady(String(req.params.id));

    return res.status(HTTPSTATUS.OK).json({
      message: "Order marked as ready — customer notified",
      data: order,
    });
  });
}
