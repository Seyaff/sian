import { PageHeader } from "@/components/dashboard/page-header";
import { InsightCard } from "@/components/dashboard/insight-card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { formatCurrency } from "@/lib/format";
import { mockInsights } from "@/lib/mock-data";

const insightKpis = [
  {
    id: "total-impact",
    label: "Total recoverable value",
    value: 217400,
    format: "currency" as const,
    change: 0,
    changeLabel: "across all insights",
    trend: [],
  },
  {
    id: "high",
    label: "High priority",
    value: 2,
    format: "number" as const,
    change: 0,
    changeLabel: "needs action",
    trend: [],
  },
  {
    id: "recovered",
    label: "Already recovered",
    value: 89000,
    format: "currency" as const,
    change: 34,
    changeLabel: "via AI this month",
    trend: [],
  },
];

export default function InsightsPage() {
  const totalImpact = mockInsights.reduce((sum, i) => sum + i.impact, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights"
        description={`Missed opportunities and revenue leaks — ${formatCurrency(totalImpact)} total impact identified.`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {insightKpis.map((metric) => (
          <KpiCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid gap-4">
        {mockInsights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
}
