"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import { ALL_NAV_ITEMS } from "@/components/shell/nav";
import { useSession } from "@/components/shell/session-context";
import { can } from "@/lib/rbac";
import { Button } from "@/components/ui/button";

/** ⌘K / Ctrl+K command palette for fast navigation. */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { role } = useSession();
  const items = ALL_NAV_ITEMS.filter((i) => !i.permission || can(role, i.permission));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-muted-foreground"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Search…</span>
        <kbd className="ml-1 hidden rounded border bg-muted px-1.5 font-mono text-[10px] sm:inline">⌘K</kbd>
      </Button>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Command palette"
        className="fixed left-1/2 top-24 z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg"
      >
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Command.Input
            placeholder="Go to…"
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="px-2 py-4 text-sm text-muted-foreground">No results.</Command.Empty>
          <Command.Group heading="Navigate" className="text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1">
            {items.map((item) => (
              <Command.Item
                key={item.href}
                value={item.label}
                onSelect={() => go(item.href)}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command.Dialog>
    </>
  );
}
