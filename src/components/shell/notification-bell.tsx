"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActivity } from "@/hooks/use-governance";
import { timeAgo } from "@/lib/utils";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: items = [] } = useActivity();
  const recent = items.slice(0, 8);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Activity feed, ${recent.length} recent events`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="relative">
          <Bell className="h-4 w-4" />
          {recent.length > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
          ) : null}
        </span>
      </Button>

      {open ? (
        <>
          <div className="fixed inset-0 z-30" aria-hidden="true" onClick={() => setOpen(false)} />
          <div
            role="menu"
            aria-label="Recent activity"
            className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg"
          >
            <div className="border-b px-3 py-2 text-sm font-medium">Recent activity</div>
            {recent.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {recent.map((it) => (
                  <li key={it.id} className="border-b px-3 py-2 text-sm last:border-0">
                    <p className="truncate">{it.action}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="capitalize">{it.actorRole}</span> · {it.outcome} · {timeAgo(it.timestamp)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
