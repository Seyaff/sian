import { PageHeader } from "@/components/dashboard/page-header";
import { OrdersBoard } from "@/components/dashboard/orders-board";
import { KpiCard } from "@/components/dashboard/kpi-card";

const orderKpis = [
  { id: "active", label: "Active orders", value: 3, format: "number" as const, change: 50, changeLabel: "vs avg", trend: [] },
  { id: "completed", label: "Completed today", value: 20, format: "number" as const, change: 11, changeLabel: "vs yesterday", trend: [] },
  { id: "cancel", label: "Cancel rate", value: 2, format: "percent" as const, change: -1, changeLabel: "improving", trend: [], invertChange: true },
  { id: "prep", label: "Avg prep time", value: 28, format: "duration" as const, change: -5, changeLabel: "faster", trend: [], invertChange: true },
];

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Live order board — mark preparing or ready to notify customers on WhatsApp."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {orderKpis.map((metric) => (
          <KpiCard key={metric.id} metric={metric} />
        ))}
      </div>

      <OrdersBoard />
    </div>
  );
}
