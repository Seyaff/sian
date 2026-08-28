import { KpiCard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { BreakdownList } from "@/components/dashboard/breakdown-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  conversationKpis,
  intentBreakdown,
  languageBreakdown,
  mockConversations,
} from "@/lib/mock-data";

const statusVariant = {
  resolved: "secondary",
  active: "default",
  escalated: "destructive",
} as const;

export default function ConversationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Conversations"
        description="Every WhatsApp chat tracked — AI resolution, intents, and after-hours recovery."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {conversationKpis.map((metric) => (
          <KpiCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <BreakdownList title="Intent breakdown" items={intentBreakdown} />
        <BreakdownList title="Language split" items={languageBreakdown} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Last message</TableHead>
                <TableHead>Intent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Msgs</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockConversations.map((chat) => (
                <TableRow key={chat.id}>
                  <TableCell className="font-medium">{chat.customer}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{chat.lastMessage}</TableCell>
                  <TableCell>{chat.intent}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[chat.status]}>{chat.status}</Badge>
                  </TableCell>
                  <TableCell>{chat.duration}</TableCell>
                  <TableCell>{chat.messages}</TableCell>
                  <TableCell className="text-muted-foreground">{chat.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
