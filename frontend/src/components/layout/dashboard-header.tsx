import { LiveDot } from "@/components/dashboard/live-dot";
import { RESTAURANT_NAME } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <LiveDot />
        <div>
          <p className="text-sm font-medium">Live dashboard</p>
          <p className="text-xs text-muted-foreground">{RESTAURANT_NAME}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">Owner</p>
          <p className="text-xs text-muted-foreground">Today&apos;s overview</p>
        </div>
        <Avatar>
          <AvatarFallback className="bg-amber-100 text-amber-800">DP</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
