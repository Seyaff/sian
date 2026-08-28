import OrderModel, { IOrder, IOrderItem, OrderStatus } from "../../models/order.model";
import { Env } from "../../config/app.config";

export interface CreateOrderInput {
  restaurantId: string;
  customerPhone: string;
  customerName?: string;
  items: IOrderItem[];
  orderType: "pickup" | "delivery";
  deliveryAddress?: string;
  specialInstructions?: string;
  totalAmount?: number;
  estimatedPrepMinutes?: number;
}

export class OrderRepository {
  async create(data: CreateOrderInput): Promise<IOrder> {
    const prepMinutes = data.estimatedPrepMinutes ?? Number(Env.DEFAULT_PREP_MINUTES);
    const estimatedReadyAt = new Date(Date.now() + prepMinutes * 60 * 1000);

    const order = new OrderModel({
      ...data,
      status: "confirmed",
      estimatedPrepMinutes: prepMinutes,
      estimatedReadyAt,
    });
    return order.save();
  }

  async findById(orderId: string): Promise<IOrder | null> {
    return OrderModel.findById(orderId).lean();
  }

  async findByCustomer(phone: string, restaurantId: string): Promise<IOrder[]> {
    return OrderModel.find({ customerPhone: phone, restaurantId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
  }

  async findActiveByRestaurant(restaurantId: string): Promise<IOrder[]> {
    return OrderModel.find({
      restaurantId,
      status: { $in: ["confirmed", "preparing"] },
    })
      .sort({ createdAt: 1 })
      .lean();
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    extra: { readyAt?: Date } = {}
  ): Promise<IOrder | null> {
    return OrderModel.findByIdAndUpdate(
      orderId,
      { $set: { status, ...extra } },
      { new: true }
    ).lean();
  }
}
