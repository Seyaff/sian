import {
  BarChart3,
  LayoutDashboard,
  MessageSquare,
  ShoppingBag,
  Users,
  Megaphone,
  Lightbulb,
} from "lucide-react";

export const RESTAURANT_NAME = "Da Pakhtun Dera";
export const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID ?? "da-pakhtun-dera";
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag, badge: 3 },
  { href: "/dashboard/conversations", label: "Conversations", icon: MessageSquare },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/insights", label: "Insights", icon: Lightbulb, badge: 5 },
] as const;

export const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
] as const;
