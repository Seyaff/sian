import { KpiCard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GrowthBadge } from "@/components/dashboard/growth-badge";
import { formatCurrency } from "@/lib/format";
import { analyticsKpis, categoryGrowth, weeklyComparison } from "@/lib/mock-data";

const profitStats = [
  { label: "Gross revenue (30d)", value: formatCurrency(1240000) },
  { label: "Est. food cost (38%)", value: formatCurrency(471200) },
  { label: "Est. gross profit", value: formatCurrency(768800) },
  { label: "Revenue per conversation", value: formatCurrency(720) },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Growth trends, profit estimates, and category performance."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {analyticsKpis.map((metric) => (
          <KpiCard key={metric.id} metric={metric} />
        ))}
      </div>

      <RevenueChart
        data={weeklyComparison}
        title="This week vs last week"
        description="Revenue comparison by day"
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profit snapshot (estimated)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profitStats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{stat.label}</span>
                <span className="font-semibold tabular-nums">{stat.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <BarChartCard
          data={categoryGrowth.map((c) => ({ label: c.label, value: c.value }))}
          title="Category growth %"
          description="Month over month by menu category"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key insights</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="text-sm font-medium">Golden hour</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tuesday 8–9 PM drives highest order volume
            </p>
            <div className="mt-2">
              <GrowthBadge value={32} />
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm font-medium">Campaign impact</p>
            <p className="mt-1 text-sm text-muted-foreground">
              BBQ orders up 45% after Eid campaign
            </p>
            <div className="mt-2">
              <GrowthBadge value={45} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
