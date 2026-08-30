import { z } from "zod";
import { CustomerService } from "../../modules/customer/customer.service";
import { OrderService } from "../../services/order/order.service";
import { cleanString } from "../../utils/zod-helpers";
import { placeOrderInputSchema } from "../../validators/restaurant.validation";

const customerService = new CustomerService();
const orderService = new OrderService();

export type PlaceOrderInput = z.infer<typeof placeOrderInputSchema>;

export interface PlaceOrderContext {
  restaurantId: string;
  customerPhone: string;
}

export interface PlaceOrderResult {
  success: true;
  orderId: string;
  status: string;
  estimatedPrepMinutes: number;
  estimatedReadyAt: string;
  message: string;
}

export async function placeOrderAction(
  rawInput: unknown,
  context: PlaceOrderContext
): Promise<PlaceOrderResult> {
  const input = placeOrderInputSchema.parse(rawInput);
  const deliveryAddress = cleanString(input.deliveryAddress);
  const specialInstructions = cleanString(input.specialInstructions);

  const totalAmount = input.items.reduce(
    (sum, item) => sum + (item.price ?? 0) * item.quantity,
    0
  );

  const order = await orderService.createAndNotify({
    restaurantId: context.restaurantId,
    customerPhone: context.customerPhone,
    items: input.items.map((item) => {
      const notes = cleanString(item.notes);
      return {
        name: item.name,
        quantity: item.quantity,
        ...(item.price !== undefined && item.price !== null ? { price: item.price } : {}),
        ...(notes ? { notes } : {}),
      };
    }),
    orderType: input.orderType,
    ...(deliveryAddress ? { deliveryAddress } : {}),
    ...(specialInstructions ? { specialInstructions } : {}),
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
}
