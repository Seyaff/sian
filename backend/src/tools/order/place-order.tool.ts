import { tool } from "ai";
import { CustomerService } from "../../modules/customer/customer.service";
import { OrderService } from "../../services/order/order.service";
import { placeOrderInputSchema, restaurantContextSchema } from "../../validators/restaurant.validation";

const customerService = new CustomerService();
const orderService = new OrderService();

export const placeOrderTool = tool({
  contextSchema: restaurantContextSchema,
  description:
    "Place a food order. Collect items and pickup/delivery first. Set estimatedPrepMinutes: 30 default, karahi/BBQ 35-45.",
  inputSchema: placeOrderInputSchema,
  execute: async (input, { context }) => {
    const totalAmount = input.items.reduce(
      (sum, item) => sum + (item.price ?? 0) * item.quantity,
      0
    );

    const order = await orderService.createAndNotify({
      restaurantId: context.restaurantId,
      customerPhone: context.customerPhone,
      items: input.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        ...(item.price !== undefined ? { price: item.price } : {}),
        ...(item.notes ? { notes: item.notes } : {}),
      })),
      orderType: input.orderType,
      ...(input.deliveryAddress ? { deliveryAddress: input.deliveryAddress } : {}),
      ...(input.specialInstructions ? { specialInstructions: input.specialInstructions } : {}),
      ...(totalAmount > 0 ? { totalAmount } : {}),
      ...(input.estimatedPrepMinutes ? { estimatedPrepMinutes: input.estimatedPrepMinutes } : {}),
    });

    await customerService.recordOrder(
      context.customerPhone,
      context.restaurantId,
      String(order._id),
      input.items.map((i) => ({ name: i.name, quantity: i.quantity })),
      totalAmount
    );

    const readyTime = order.estimatedReadyAt.toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return {
      success: true,
      orderId: String(order._id),
      status: order.status,
      estimatedPrepMinutes: order.estimatedPrepMinutes,
      estimatedReadyAt: readyTime,
      message: `Order placed. Ready in ~${order.estimatedPrepMinutes} min (around ${readyTime}). Owner and customer notified.`,
    };
  },
});
