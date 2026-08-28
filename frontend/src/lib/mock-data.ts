import type {
  CampaignRow,
  ChartPoint,
  ConversationRow,
  CustomerRow,
  FunnelStep,
  InsightRow,
  KpiMetric,
  Order,
} from "@/types/dashboard";

export const overviewKpis: KpiMetric[] = [
  {
    id: "revenue",
    label: "Revenue today",
    value: 48250,
    format: "currency",
    change: 18.4,
    changeLabel: "vs yesterday",
    trend: [32, 38, 35, 42, 48, 45, 52],
  },
  {
    id: "orders",
    label: "Orders today",
    value: 23,
    format: "number",
    change: 12,
    changeLabel: "vs yesterday",
    trend: [14, 16, 15, 18, 20, 19, 23],
  },
  {
    id: "conversations",
    label: "WhatsApp chats",
    value: 67,
    format: "number",
    change: 34,
    changeLabel: "vs last week",
    trend: [40, 45, 42, 50, 55, 60, 67],
  },
  {
    id: "conversion",
    label: "Chat → order rate",
    value: 34,
    format: "percent",
    change: 5.2,
    changeLabel: "vs last week",
    trend: [26, 28, 29, 30, 31, 32, 34],
  },
  {
    id: "aov",
    label: "Avg order value",
    value: 2100,
    format: "currency",
    change: 8,
    changeLabel: "vs last week",
    trend: [1800, 1900, 1950, 2000, 2050, 2080, 2100],
  },
  {
    id: "response",
    label: "Avg response time",
    value: 4,
    format: "duration",
    change: -62,
    changeLabel: "vs before AI",
    trend: [12, 10, 8, 7, 6, 5, 4],
    invertChange: true,
  },
  {
    id: "returning",
    label: "Returning customers",
    value: 41,
    format: "percent",
    change: 6,
    changeLabel: "vs last month",
    trend: [32, 34, 35, 37, 38, 39, 41],
  },
  {
    id: "campaign-revenue",
    label: "Campaign revenue",
    value: 12400,
    format: "currency",
    change: 220,
    changeLabel: "vs last campaign",
    trend: [2000, 3500, 5000, 7000, 9000, 11000, 12400],
  },
];

export const revenueChartData: ChartPoint[] = [
  { label: "Mon", value: 32000, value2: 28000 },
  { label: "Tue", value: 38000, value2: 30000 },
  { label: "Wed", value: 35000, value2: 31000 },
  { label: "Thu", value: 42000, value2: 33000 },
  { label: "Fri", value: 55000, value2: 40000 },
  { label: "Sat", value: 62000, value2: 48000 },
  { label: "Sun", value: 48250, value2: 36000 },
];

export const ordersByHour: ChartPoint[] = [
  { label: "12pm", value: 2 },
  { label: "1pm", value: 5 },
  { label: "2pm", value: 3 },
  { label: "6pm", value: 4 },
  { label: "7pm", value: 8 },
  { label: "8pm", value: 12 },
  { label: "9pm", value: 9 },
  { label: "10pm", value: 5 },
];

export const conversationFunnel: FunnelStep[] = [
  { label: "Chats started", value: 67, percent: 100 },
  { label: "Menu viewed", value: 52, percent: 78 },
  { label: "Items discussed", value: 38, percent: 57 },
  { label: "Order placed", value: 23, percent: 34 },
  { label: "Completed", value: 21, percent: 31 },
];

export const topDishes = [
  { name: "Chicken Tikka", orders: 18, growth: 22 },
  { name: "Chicken Karahi", orders: 14, growth: 15 },
  { name: "Lamb Pulao", orders: 11, growth: 8 },
  { name: "Seekh Kebab", orders: 9, growth: 12 },
  { name: "Naan", orders: 28, growth: 5 },
];

export const conversationKpis: KpiMetric[] = [
  { id: "total", label: "Total conversations", value: 1247, format: "number", change: 28, changeLabel: "all time growth", trend: [] },
  { id: "today", label: "Today", value: 67, format: "number", change: 34, changeLabel: "vs yesterday", trend: [] },
  { id: "ai-resolved", label: "Resolved by AI", value: 89, format: "percent", change: 4, changeLabel: "vs last week", trend: [] },
  { id: "after-hours", label: "After-hours chats", value: 34, format: "percent", change: 12, changeLabel: "recovered revenue", trend: [] },
  { id: "avg-messages", label: "Avg messages / chat", value: 8.3, format: "decimal", change: -5, changeLabel: "more efficient", trend: [], invertChange: true },
  { id: "avg-duration", label: "Avg session length", value: 252, format: "duration", change: -8, changeLabel: "faster resolution", trend: [], invertChange: true },
];

export const intentBreakdown = [
  { label: "Menu", value: 42 },
  { label: "Order", value: 31 },
  { label: "Hours", value: 12 },
  { label: "Booking", value: 8 },
  { label: "Other", value: 7 },
];

export const languageBreakdown = [
  { label: "Roman Urdu", value: 58 },
  { label: "English", value: 32 },
  { label: "Mixed", value: 10 },
];

export const mockConversations: ConversationRow[] = [
  { id: "1", customer: "Ahmed", phone: "923001234567", lastMessage: "2 chicken tikka takeaway", intent: "Order", status: "resolved", duration: "3m 20s", messages: 7, time: "2 min ago" },
  { id: "2", customer: "Sara", phone: "923009876543", lastMessage: "BBQ menu dikhao", intent: "Menu", status: "active", duration: "1m 45s", messages: 4, time: "5 min ago" },
  { id: "3", customer: "Hassan", phone: "923005551234", lastMessage: "Table book karna hai kal 8pm", intent: "Booking", status: "resolved", duration: "5m 10s", messages: 9, time: "12 min ago" },
  { id: "4", customer: "Fatima", phone: "923007778899", lastMessage: "Kitne baje band hota hai?", intent: "Hours", status: "resolved", duration: "45s", messages: 3, time: "18 min ago" },
  { id: "5", customer: "Unknown", phone: "923003334455", lastMessage: "Manager se baat karni hai", intent: "Escalation", status: "escalated", duration: "8m 30s", messages: 12, time: "25 min ago" },
  { id: "6", customer: "Usman", phone: "923006667788", lastMessage: "Karahi mild wali 1 plate", intent: "Order", status: "resolved", duration: "4m 05s", messages: 6, time: "32 min ago" },
];

export const customerKpis: KpiMetric[] = [
  { id: "total", label: "Total customers", value: 892, format: "number", change: 5.6, changeLabel: "this month", trend: [] },
  { id: "new", label: "New this week", value: 47, format: "number", change: 12, changeLabel: "vs last week", trend: [] },
  { id: "returning", label: "Returning rate", value: 41, format: "percent", change: 6, changeLabel: "vs last month", trend: [] },
  { id: "vip", label: "VIP customers", value: 63, format: "number", change: 8, changeLabel: "5+ orders", trend: [] },
  { id: "at-risk", label: "At-risk (30d inactive)", value: 128, format: "number", change: -3, changeLabel: "improving", trend: [], invertChange: true },
  { id: "ltv", label: "Avg lifetime value", value: 8400, format: "currency", change: 14, changeLabel: "vs last quarter", trend: [] },
];

export const mockCustomers: CustomerRow[] = [
  { id: "1", name: "Ahmed", phone: "923001234567", orders: 5, ltv: 14200, lastOrder: "2x Chicken Tikka (3 days ago)", favorites: "Chicken Karahi", tags: ["vip", "weekend_regular"], returning: true },
  { id: "2", name: "Sara", phone: "923009876543", orders: 3, ltv: 6800, lastOrder: "Lamb Pulao (1 week ago)", favorites: "BBQ Platter", tags: ["biryani_lover"], returning: true },
  { id: "3", name: "Hassan", phone: "923005551234", orders: 8, ltv: 22400, lastOrder: "Family Karahi (yesterday)", favorites: "Seekh Kebab", tags: ["vip"], returning: true },
  { id: "4", name: "Fatima", phone: "923007778899", orders: 1, ltv: 1800, lastOrder: "Naan + Raita (2 weeks ago)", favorites: "—", tags: [], returning: false },
  { id: "5", name: "Usman", phone: "923006667788", orders: 6, ltv: 15600, lastOrder: "Chicken Tikka (5 days ago)", favorites: "Chicken Tikka", tags: ["vip"], returning: true },
];

export const campaignKpis: KpiMetric[] = [
  { id: "sent", label: "Campaigns sent", value: 12, format: "number", change: 20, changeLabel: "this quarter", trend: [] },
  { id: "delivered", label: "Messages delivered", value: 4820, format: "number", change: 45, changeLabel: "vs last quarter", trend: [] },
  { id: "open-rate", label: "Open rate", value: 68, format: "percent", change: 8, changeLabel: "vs industry avg", trend: [] },
  { id: "reply-rate", label: "Reply rate", value: 22, format: "percent", change: 5, changeLabel: "vs last campaign", trend: [] },
  { id: "converted", label: "Orders from campaigns", value: 89, format: "number", change: 34, changeLabel: "vs last quarter", trend: [] },
  { id: "roi", label: "Campaign ROI", value: 340, format: "percent", change: 120, changeLabel: "vs last quarter", trend: [] },
];

export const mockCampaigns: CampaignRow[] = [
  { id: "1", name: "Eid BBQ Special", segment: "Inactive 7+ days", sent: 120, opened: 82, replied: 28, converted: 18, revenue: 42000, status: "completed" },
  { id: "2", name: "Weekend Karahi Promo", segment: "VIP customers", sent: 63, opened: 48, replied: 15, converted: 11, revenue: 28500, status: "completed" },
  { id: "3", name: "We Miss You", segment: "Inactive 30+ days", sent: 95, opened: 55, replied: 12, converted: 6, revenue: 14200, status: "completed" },
  { id: "4", name: "Ramadan Iftar Deal", segment: "All past customers", sent: 0, opened: 0, replied: 0, converted: 0, revenue: 0, status: "scheduled" },
];

export const analyticsKpis: KpiMetric[] = [
  { id: "mom-revenue", label: "MoM revenue growth", value: 24, format: "percent", change: 24, changeLabel: "vs last month", trend: [] },
  { id: "mom-customers", label: "Customer growth", value: 18, format: "percent", change: 18, changeLabel: "vs last month", trend: [] },
  { id: "margin", label: "Est. gross margin", value: 62, format: "percent", change: 3, changeLabel: "vs last month", trend: [] },
  { id: "rpc", label: "Revenue per chat", value: 720, format: "currency", change: 15, changeLabel: "vs last month", trend: [] },
];

export const weeklyComparison: ChartPoint[] = [
  { label: "Mon", value: 32000, value2: 28000 },
  { label: "Tue", value: 38000, value2: 30000 },
  { label: "Wed", value: 35000, value2: 31000 },
  { label: "Thu", value: 42000, value2: 33000 },
  { label: "Fri", value: 55000, value2: 40000 },
  { label: "Sat", value: 62000, value2: 48000 },
  { label: "Sun", value: 48250, value2: 36000 },
];

export const categoryGrowth = [
  { label: "BBQ", value: 45 },
  { label: "Karahi", value: 22 },
  { label: "Biryani", value: 18 },
  { label: "Beverages", value: 35 },
  { label: "Naan/Bread", value: 8 },
];

export const mockInsights: InsightRow[] = [
  { id: "1", title: "Unanswered chats (before AI)", description: "23 chats last month had no reply within 30 minutes.", impact: 28000, severity: "high", action: "AI now handles 89% automatically" },
  { id: "2", title: "Lost conversions", description: "18 people viewed menu but didn't place an order.", impact: 36000, severity: "high", action: "Send reorder nudge campaign" },
  { id: "3", title: "Churn risk", description: "128 customers haven't ordered in 30+ days.", impact: 96000, severity: "medium", action: "Launch 'We Miss You' campaign" },
  { id: "4", title: "Upsell opportunity", description: "12 orders had no drink or side suggested.", impact: 8400, severity: "low", action: "Enable upsell prompts in agent" },
  { id: "5", title: "Peak overload", description: "Saturday 8–9 PM had 8 concurrent chats.", impact: 15000, severity: "medium", action: "Alert staff during peak hours" },
  { id: "6", title: "No promo in 21 days", description: "Last campaign was 3 weeks ago. Competitors are active.", impact: 45000, severity: "medium", action: "Schedule weekend promo" },
];

export const mockOrders: Order[] = [
  {
    _id: "ord_a3f291",
    restaurantId: "da-pakhtun-dera",
    customerPhone: "923001234567",
    customerName: "Ahmed",
    items: [{ name: "Chicken Tikka", quantity: 2, price: 1200 }, { name: "Naan", quantity: 2, price: 80 }],
    orderType: "pickup",
    status: "preparing",
    totalAmount: 2560,
    estimatedPrepMinutes: 25,
    estimatedReadyAt: new Date(Date.now() + 25 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    _id: "ord_b891cd",
    restaurantId: "da-pakhtun-dera",
    customerPhone: "923009876543",
    customerName: "Sara",
    items: [{ name: "Chicken Karahi", quantity: 1, price: 1800 }],
    orderType: "delivery",
    status: "confirmed",
    totalAmount: 1800,
    estimatedPrepMinutes: 35,
    estimatedReadyAt: new Date(Date.now() + 35 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    _id: "ord_c452ef",
    restaurantId: "da-pakhtun-dera",
    customerPhone: "923005551234",
    customerName: "Hassan",
    items: [{ name: "Seekh Kebab", quantity: 4, price: 400 }, { name: "Raita", quantity: 1, price: 150 }],
    orderType: "pickup",
    status: "confirmed",
    totalAmount: 1750,
    estimatedPrepMinutes: 30,
    estimatedReadyAt: new Date(Date.now() + 30 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
  },
];
