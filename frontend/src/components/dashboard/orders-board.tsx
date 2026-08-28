"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchActiveOrders, markOrderPreparing, markOrderReady } from "@/lib/api/orders";
import { formatCurrency, shortOrderId } from "@/lib/format";
import type { Order } from "@/types/dashboard";

const statusColors: Record<Order["status"], string> = {
  pending: "secondary",
  confirmed: "outline",
  preparing: "default",
  ready: "secondary",
  cancelled: "destructive",
};

export function OrdersBoard() {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchActiveOrders,
    refetchInterval: 5000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["orders"] });

  const preparingMutation = useMutation({
    mutationFn: markOrderPreparing,
    onSuccess: invalidate,
  });

  const readyMutation = useMutation({
    mutationFn: markOrderReady,
    onSuccess: invalidate,
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading orders...</p>;
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No active orders right now.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {orders.map((order) => (
        <OrderCard
          key={order._id}
          order={order}
          onPreparing={() => preparingMutation.mutate(order._id)}
          onReady={() => readyMutation.mutate(order._id)}
        />
      ))}
    </div>
  );
}

function OrderCard({
  order,
  onPreparing,
  onReady,
}: {
  order: Order;
  onPreparing: () => void;
  onReady: () => void;
}) {
  const items = order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ");

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base">#{shortOrderId(order._id)}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {order.customerName ?? order.customerPhone}
          </p>
        </div>
        <Badge variant={statusColors[order.status] as "default"}>{order.status}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{items}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="capitalize">{order.orderType}</span>
          {order.totalAmount && <span className="font-medium text-foreground">{formatCurrency(order.totalAmount)}</span>}
        </div>
        <p className="text-xs text-muted-foreground">~{order.estimatedPrepMinutes} min prep</p>
        <div className="flex gap-2">
          {order.status === "confirmed" && (
            <Button size="sm" variant="outline" onClick={onPreparing}>
              Preparing
            </Button>
          )}
          {(order.status === "confirmed" || order.status === "preparing") && (
            <Button size="sm" onClick={onReady}>
              Mark ready
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
