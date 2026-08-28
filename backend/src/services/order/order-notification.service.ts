import { IOrder } from "../../models/order.model";
import { Env } from "../../config/app.config";
import { whatsAppOutbound } from "../whatsapp/whatsapp-outbound.service";

function formatOrderItems(order: IOrder): string {
  return order.items
    .map((item) => `• ${item.quantity}x ${item.name}${item.price ? ` (Rs ${item.price})` : ""}`)
    .join("\n");
}

function formatReadyTime(order: IOrder): string {
  return order.estimatedReadyAt.toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export class OrderNotificationService {
  async notifyOwnerNewOrder(order: IOrder): Promise<void> {
    const ownerPhone = Env.OWNER_WHATSAPP_PHONE;
    if (!ownerPhone) {
      console.warn("[ORDER] OWNER_WHATSAPP_PHONE not set — skipping owner notification");
      return;
    }

    const shortId = String(order._id).slice(-6).toUpperCase();
    const body = [
      `🆕 *New Order #${shortId}*`,
      "",
      formatOrderItems(order),
      "",
      `Type: *${order.orderType}*`,
      order.deliveryAddress ? `Address: ${order.deliveryAddress}` : "",
      order.specialInstructions ? `Notes: ${order.specialInstructions}` : "",
      `Customer: ${order.customerPhone}`,
      `Ready by: *~${formatReadyTime(order)}* (${order.estimatedPrepMinutes} min)`,
      "",
      `Mark ready: reply *ready ${order._id}*`,
    ]
      .filter(Boolean)
      .join("\n");

    await whatsAppOutbound.sendText(ownerPhone, body);
  }

  async notifyCustomerOrderConfirmed(order: IOrder): Promise<void> {
    const shortId = String(order._id).slice(-6).toUpperCase();
    const body = [
      `✅ Order confirmed! #${shortId}`,
      "",
      formatOrderItems(order),
      "",
      `Estimated ready: *~${formatReadyTime(order)}* (${order.estimatedPrepMinutes} min) 🕐`,
      order.orderType === "pickup"
        ? "We'll message you when it's ready for pickup!"
        : "We'll message you when it's out for delivery!",
    ].join("\n");

    await whatsAppOutbound.sendText(order.customerPhone, body);
  }

  async notifyCustomerOrderReady(order: IOrder): Promise<void> {
    const shortId = String(order._id).slice(-6).toUpperCase();
    const body =
      order.orderType === "pickup"
        ? `🎉 Order #${shortId} is *ready for pickup*! Aap aa sakte hain.`
        : `🎉 Order #${shortId} is *ready* and on its way!`;

    await whatsAppOutbound.sendText(order.customerPhone, body);
  }
}

export const orderNotificationService = new OrderNotificationService();
