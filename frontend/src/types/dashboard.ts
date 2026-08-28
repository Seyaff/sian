export type Period = "today" | "7d" | "30d" | "90d";

export interface KpiMetric {
  id: string;
  label: string;
  value: number;
  format: "currency" | "percent" | "number" | "duration" | "decimal";
  change: number;
  changeLabel: string;
  trend: number[];
  invertChange?: boolean;
}

export interface ChartPoint {
  label: string;
  value: number;
  value2?: number;
}

export interface FunnelStep {
  label: string;
  value: number;
  percent: number;
}

export interface ConversationRow {
  id: string;
  customer: string;
  phone: string;
  lastMessage: string;
  intent: string;
  status: "resolved" | "active" | "escalated";
  duration: string;
  messages: number;
  time: string;
}

export interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  orders: number;
  ltv: number;
  lastOrder: string;
  favorites: string;
  tags: string[];
  returning: boolean;
}

export interface CampaignRow {
  id: string;
  name: string;
  segment: string;
  sent: number;
  opened: number;
  replied: number;
  converted: number;
  revenue: number;
  status: "completed" | "draft" | "scheduled" | "sending";
}

export interface InsightRow {
  id: string;
  title: string;
  description: string;
  impact: number;
  severity: "high" | "medium" | "low";
  action: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price?: number;
}

export interface Order {
  _id: string;
  restaurantId: string;
  customerPhone: string;
  customerName?: string;
  items: OrderItem[];
  orderType: "pickup" | "delivery";
  status: "pending" | "confirmed" | "preparing" | "ready" | "cancelled";
  totalAmount?: number;
  estimatedPrepMinutes: number;
  estimatedReadyAt: string;
  createdAt: string;
}
