import { MenuRepository } from "../../repositories/menu/menu.repository";
import { PlaceOrderInput } from "./place-order.action";

export interface ResolvedOrderItem {
  name: string;
  quantity: number;
  price?: number;
  notes?: string;
  matchedMenuName: string;
  confidence: number;
}

export interface OrderValidationResult {
  valid: boolean;
  resolvedItems: ResolvedOrderItem[];
  errors: string[];
  totalAmount: number;
  resolvedOrder?: PlaceOrderInput;
}

export class OrderValidationService {
  constructor(private menuRepo = new MenuRepository()) {}

  async validate(
    restaurantId: string,
    items: Array<{ name: string; quantity: number; notes?: string | null | undefined }>,
    orderType: "pickup" | "delivery" = "pickup",
    extras?: {
      deliveryAddress?: string | null | undefined;
      specialInstructions?: string | null | undefined;
      estimatedPrepMinutes?: number | null | undefined;
    }
  ): Promise<OrderValidationResult> {
    const resolvedItems: ResolvedOrderItem[] = [];
    const errors: string[] = [];

    for (const item of items) {
      const match = await this.menuRepo.findByName(restaurantId, item.name, 0.45);

      if (!match) {
        errors.push(`"${item.name}" menu mein nahi mila`);
        continue;
      }

      resolvedItems.push({
        name: match.name,
        quantity: item.quantity,
        matchedMenuName: match.name,
        confidence: match.confidence,
        ...(match.price !== undefined ? { price: match.price } : {}),
        ...(item.notes ? { notes: item.notes } : {}),
      });
    }

    if (errors.length > 0) {
      return { valid: false, resolvedItems, errors, totalAmount: 0 };
    }

    const totalAmount = resolvedItems.reduce(
      (sum, item) => sum + (item.price ?? 0) * item.quantity,
      0
    );

    const resolvedOrder: PlaceOrderInput = {
      items: resolvedItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        ...(item.price !== undefined ? { price: item.price } : {}),
        ...(item.notes ? { notes: item.notes } : {}),
      })),
      orderType,
      ...(extras?.deliveryAddress ? { deliveryAddress: extras.deliveryAddress } : {}),
      ...(extras?.specialInstructions ? { specialInstructions: extras.specialInstructions } : {}),
      ...(extras?.estimatedPrepMinutes ? { estimatedPrepMinutes: extras.estimatedPrepMinutes } : {}),
    };

    return {
      valid: true,
      resolvedItems,
      errors: [],
      totalAmount,
      resolvedOrder,
    };
  }
}

export const orderValidationService = new OrderValidationService();
