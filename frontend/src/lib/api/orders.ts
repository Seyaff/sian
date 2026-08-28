import { API_URL, RESTAURANT_ID } from "@/lib/constants";
import type { Order } from "@/types/dashboard";
import { mockOrders } from "@/lib/mock-data";

interface ApiResponse<T> {
  data: T;
  message: string;
}

export async function fetchActiveOrders(): Promise<Order[]> {
  try {
    const res = await fetch(
      `${API_URL}/orders?restaurantId=${RESTAURANT_ID}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Failed to fetch orders");

    const json: ApiResponse<Order[]> = await res.json();
    return json.data.length > 0 ? json.data : mockOrders;
  } catch {
    return mockOrders;
  }
}

export async function markOrderPreparing(orderId: string): Promise<void> {
  await fetch(`${API_URL}/orders/${orderId}/preparing`, { method: "PATCH" });
}

export async function markOrderReady(orderId: string): Promise<void> {
  await fetch(`${API_URL}/orders/${orderId}/ready`, { method: "PATCH" });
}
