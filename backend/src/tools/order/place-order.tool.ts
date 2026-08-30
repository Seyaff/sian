import { tool } from "ai";
import { placeOrderAction } from "../../services/order/place-order.action";
import { placeOrderInputSchema, restaurantContextSchema } from "../../validators/restaurant.validation";

export const placeOrderTool = tool({
  contextSchema: restaurantContextSchema,
  description:
    "Place a food order. Collect items and pickup/delivery first. Set estimatedPrepMinutes: 30 default, karahi/BBQ 35-45.",
  inputSchema: placeOrderInputSchema,
  execute: async (input, { context }) => placeOrderAction(input, context),
});
