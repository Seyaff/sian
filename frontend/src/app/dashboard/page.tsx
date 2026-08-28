import { KpiCard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { FunnelList } from "@/components/charts/funnel-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GrowthBadge } from "@/components/dashboard/growth-badge";
import {
  conversationFunnel,
  ordersByHour,
  overviewKpis,
  revenueChartData,
  topDishes,
} from "@/lib/mock-data";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Real-time performance across WhatsApp, orders, and campaigns."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewKpis.map((metric) => (
          <KpiCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart data={revenueChartData} />
        </div>
        <FunnelList steps={conversationFunnel} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <BarChartCard
          data={ordersByHour}
          title="Orders by hour"
          description="Peak lunch and dinner rush"
        />
        <Card>
          <CardHeader>
            <CardTitle>Top dishes today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topDishes.map((dish, index) => (
              <div key={dish.name} className="flex items-center justify-between text-sm">
                <span>
                  <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                  {dish.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums text-muted-foreground">{dish.orders} orders</span>
                  <GrowthBadge value={dish.growth} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
