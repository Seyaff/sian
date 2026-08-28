import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GrowthBadge } from "@/components/dashboard/growth-badge";
import { Sparkline } from "@/components/charts/sparkline";
import { formatKpiValue } from "@/lib/format";
import type { KpiMetric } from "@/types/dashboard";

interface KpiCardProps {
  metric: KpiMetric;
}

export function KpiCard({ metric }: KpiCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {metric.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between gap-2">
          <p className="text-3xl font-bold tabular-nums tracking-tight">
            {formatKpiValue(metric.value, metric.format)}
          </p>
          <GrowthBadge value={metric.change} invert={metric.invertChange} />
        </div>
        {metric.trend.length > 0 && <Sparkline data={metric.trend} />}
        <p className="text-xs text-muted-foreground">{metric.changeLabel}</p>
      </CardContent>
    </Card>
  );
}
