import { ArrowDown, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

interface GrowthBadgeProps {
  value: number;
  invert?: boolean;
}

export function GrowthBadge({ value, invert = false }: GrowthBadgeProps) {
  const isPositive = invert ? value < 0 : value > 0;
  const isNeutral = value === 0;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-0.5 font-medium tabular-nums",
        isNeutral && "text-muted-foreground",
        isPositive && "border-emerald-200 bg-emerald-50 text-emerald-700",
        !isPositive && !isNeutral && "border-red-200 bg-red-50 text-red-700"
      )}
    >
      {!isNeutral && (isPositive ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
      {formatPercent(value)}
    </Badge>
  );
}
