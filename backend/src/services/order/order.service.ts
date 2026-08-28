import { OrderRepository } from "../../repositories/order/order.repository";
import { orderNotificationService } from "./order-notification.service";
import { NotFoundError, BadRequestError } from "../../utils/appError";
import { IOrder, OrderStatus } from "../../models/order.model";

export class OrderService {
  constructor(private orderRepo = new OrderRepository()) {}

  async createAndNotify(data: Parameters<OrderRepository["create"]>[0]): Promise<IOrder> {
    const order = await this.orderRepo.create(data);

    await Promise.allSettled([
      orderNotificationService.notifyOwnerNewOrder(order),
      orderNotificationService.notifyCustomerOrderConfirmed(order),
    ]);

    return order;
  }

  async markPreparing(orderId: string): Promise<IOrder> {
    const order = await this.orderRepo.updateStatus(orderId, "preparing");
    if (!order) throw new NotFoundError("Order not found");
    return order;
  }

  async markReady(orderId: string): Promise<IOrder> {
    const existing = await this.orderRepo.findById(orderId);
    if (!existing) throw new NotFoundError("Order not found");

    if (existing.status === "ready") {
      throw new BadRequestError("Order is already marked ready");
    }

    const order = await this.orderRepo.updateStatus(orderId, "ready", { readyAt: new Date() });
    if (!order) throw new NotFoundError("Order not found");

    await orderNotificationService.notifyCustomerOrderReady(order);
    return order;
  }

  async getActiveOrders(restaurantId: string): Promise<IOrder[]> {
    return this.orderRepo.findActiveByRestaurant(restaurantId);
  }

  async getOrder(orderId: string): Promise<IOrder> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new NotFoundError("Order not found");
    return order;
  }

  async markReadyByPartialId(partialId: string, restaurantId: string): Promise<IOrder> {
    const active = await this.orderRepo.findActiveByRestaurant(restaurantId);
    const match = active.find(
      (o) =>
        String(o._id).slice(-6).toLowerCase() === partialId.toLowerCase() ||
        String(o._id).toLowerCase().includes(partialId.toLowerCase())
    );

    if (!match) {
      throw new NotFoundError(`No active order matching "${partialId}"`);
    }

    return this.markReady(String(match._id));
  }

  /**
   * Staff can text: "ready <orderId>", "ready ABC123" (last 6 chars), or "<orderId> tayyar"
   */
  parseStaffReadyCommand(text: string): { orderId?: string; partialId?: string } | null {
    const trimmed = text.trim();

    const fullIdMatch = trimmed.match(/(?:order\s+)?ready\s+([a-f0-9]{24})/i)
      || trimmed.match(/([a-f0-9]{24})\s+(?:ready|tayyar|tayar)/i)
      || trimmed.match(/tayyar\s+([a-f0-9]{24})/i);

    if (fullIdMatch?.[1]) {
      return { orderId: fullIdMatch[1] };
    }

    const shortIdMatch = trimmed.match(/(?:order\s+)?ready\s+#?([a-f0-9]{6})/i)
      || trimmed.match(/#?([a-f0-9]{6})\s+(?:ready|tayyar|tayar)/i);

    if (shortIdMatch?.[1]) {
      return { partialId: shortIdMatch[1] };
    }

    return null;
  }

  async handleStaffCommand(text: string, restaurantId: string): Promise<string> {
    const parsed = this.parseStaffReadyCommand(text);
    if (!parsed) {
      return "Command samajh nahi aaya. Try: *ready ORDER_ID* ya *ready ABC123*";
    }

    if (parsed.orderId) {
      const order = await this.markReady(parsed.orderId);
      const shortId = String(order._id).slice(-6).toUpperCase();
      return `✅ Order #${shortId} marked ready — customer notified!`;
    }

    if (parsed.partialId) {
      const order = await this.markReadyByPartialId(parsed.partialId, restaurantId);
      const shortId = String(order._id).slice(-6).toUpperCase();
      return `✅ Order #${shortId} marked ready — customer notified!`;
    }

    return "Order not found.";
  }
}
