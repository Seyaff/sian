import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { FunnelStep } from "@/types/dashboard";

interface FunnelListProps {
  steps: FunnelStep[];
  title?: string;
  description?: string;
}

export function FunnelList({
  steps,
  title = "Conversion funnel",
  description = "Chat to completed order",
}: FunnelListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step) => (
          <div key={step.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{step.label}</span>
              <span className="font-medium tabular-nums">
                {step.value} <span className="text-muted-foreground">({step.percent}%)</span>
              </span>
            </div>
            <Progress value={step.percent} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
