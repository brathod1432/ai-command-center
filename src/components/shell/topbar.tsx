"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/shell/command-palette";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { NotificationBell } from "@/components/shell/notification-bell";
import { useSession } from "@/components/shell/session-context";
import { roleLabel } from "@/lib/rbac";
import { toast } from "@/components/ui/toast";

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { name, role, tenantName } = useSession();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", headers: { "content-type": "application/json" } });
      router.push("/login");
      router.refresh();
    } catch {
      toast({ title: "Could not sign out", variant: "error" });
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={onOpenMenu}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden text-sm text-muted-foreground sm:block">{tenantName}</div>

      <div className="ml-auto flex items-center gap-2">
        <CommandPalette />
        <NotificationBell />
        <ThemeToggle />
        <div className="hidden items-center gap-2 border-l pl-3 sm:flex">
          <div className="text-right leading-tight">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{roleLabel(role)}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" aria-label="Sign out" onClick={logout} disabled={loggingOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
