"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RESTAURANT_NAME, NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800 p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-amber-400">
          Restaurant AI
        </p>
        <h2 className="mt-1 text-lg font-bold">{RESTAURANT_NAME}</h2>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-amber-500/15 text-amber-300"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {"badge" in item && item.badge && (
                <Badge className="bg-amber-500 text-zinc-950">{item.badge}</Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-4 text-xs text-zinc-500">
        WhatsApp Agent Dashboard
      </div>
    </aside>
  );
}
