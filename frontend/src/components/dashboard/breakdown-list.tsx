import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BreakdownListProps {
  title: string;
  items: { label: string; value: number }[];
}

export function BreakdownList({ title, items }: BreakdownListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{item.label}</span>
              <span className="font-medium tabular-nums">{item.value}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-amber-500"
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
