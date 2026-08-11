"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { SidebarContent } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { ShortcutsHelp } from "@/components/shell/shortcuts-help";
import { IdleLogout } from "@/components/shell/idle-logout";
import { SessionProvider, type SessionInfo } from "@/components/shell/session-context";
import { Toaster } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

export function AppShell({ session, children }: { session: SessionInfo; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SessionProvider value={session}>
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
          <div className="sticky top-0 h-screen">
            <SidebarContent />
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute left-0 top-0 h-full w-64 border-r bg-card shadow-xl">
              <div className="flex justify-end p-2">
                <Button variant="ghost" size="icon" aria-label="Close navigation" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenMenu={() => setMobileOpen(true)} />
          <div className="flex-1">{children}</div>
        </div>
      </div>
      <Toaster />
      <ShortcutsHelp />
      <IdleLogout />
    </SessionProvider>
  );
}
