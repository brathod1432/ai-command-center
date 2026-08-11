"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass } from "lucide-react";
import { NAV_SECTIONS } from "@/components/shell/nav";
import { useSession } from "@/components/shell/session-context";
import { can } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { role } = useSession();

  return (
    <nav aria-label="Primary" className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      <Link href="/dashboard" className="flex items-center gap-2 px-2" onClick={onNavigate}>
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Compass className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="text-lg font-semibold tracking-tight">Helm</span>
      </Link>

      {NAV_SECTIONS.map((section) => {
        const items = section.items.filter((i) => !i.permission || can(role, i.permission));
        if (items.length === 0) return null;
        return (
          <div key={section.heading}>
            <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {section.heading}
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-accent font-medium text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
