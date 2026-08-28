import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { InsightRow } from "@/types/dashboard";

interface InsightCardProps {
  insight: InsightRow;
}

const severityStyles = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
} as const;

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">{insight.title}</CardTitle>
            <Badge variant={severityStyles[insight.severity]}>{insight.severity}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{insight.description}</p>
        </div>
        <p className="shrink-0 text-lg font-bold text-amber-600 tabular-nums">
          {formatCurrency(insight.impact)}
        </p>
      </CardHeader>
      <CardContent>
        <Button size="sm" variant="outline">
          {insight.action}
        </Button>
      </CardContent>
    </Card>
  );
}
