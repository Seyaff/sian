import { tool } from "ai";
import { orderValidationService } from "../../services/order/order-validation.service";
import { cleanString } from "../../utils/zod-helpers";
import { proposeOrderInputSchema, restaurantContextSchema } from "../../validators/restaurant.validation";

export const proposeOrderTool = tool({
  contextSchema: restaurantContextSchema,
  description:
    "Propose a food order when items and pickup/delivery are clear. Validates items against the real menu. Customer must approve before it is placed. Never invent prices — only use item names from searchMenuTool or getMenuTool.",
  inputSchema: proposeOrderInputSchema,
  execute: async (input, { context }) => {
    const validation = await orderValidationService.validate(
      context.restaurantId,
      input.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        notes: cleanString(item.notes) ?? null,
      })),
      input.orderType,
      {
        ...(cleanString(input.deliveryAddress)
          ? { deliveryAddress: cleanString(input.deliveryAddress) }
          : {}),
        ...(cleanString(input.specialInstructions)
          ? { specialInstructions: cleanString(input.specialInstructions) }
          : {}),
        ...(input.estimatedPrepMinutes != null
          ? { estimatedPrepMinutes: input.estimatedPrepMinutes }
          : {}),
      }
    );

    if (!validation.valid || !validation.resolvedOrder) {
      return {
        valid: false,
        errors: validation.errors,
        message: `Order could not be validated: ${validation.errors.join("; ")}`,
      };
    }

    const itemSummary = validation.resolvedItems
      .map((i) => `${i.quantity}x ${i.name}${i.price ? ` (Rs ${i.price})` : ""}`)
      .join(", ");

    return {
      valid: true,
      pendingApproval: true,
      totalAmount: validation.totalAmount,
      itemSummary,
      resolvedOrder: validation.resolvedOrder,
      message: `Order validated and ready for customer approval: ${itemSummary}. Total: Rs ${validation.totalAmount}.`,
    };
  },
});
