"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { Search } from "lucide-react";
import { ALL_NAV_ITEMS } from "@/components/shell/nav";
import { useSession } from "@/components/shell/session-context";
import { can } from "@/lib/rbac";
import { AGENTS } from "@/lib/agents/registry";
import { KNOWLEDGE_DOCS } from "@/lib/data/catalog";
import { INSIGHTS } from "@/lib/data/mock";
import { useActions } from "@/hooks/use-governance";
import { Button } from "@/components/ui/button";

const GROUP_CLASS =
  "text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1";
const ITEM_CLASS =
  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground aria-selected:bg-accent aria-selected:text-accent-foreground";

/** ⌘K / Ctrl+K command palette for fast navigation and search. */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { role } = useSession();
  const items = ALL_NAV_ITEMS.filter((i) => !i.permission || can(role, i.permission));
  const { data: actions = [] } = useActions();
  const canReadInsights = can(role, "insight:read");

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

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-24 z-50 w-[92vw] max-w-lg -translate-x-1/2 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
            <Dialog.Title className="sr-only">Command palette</Dialog.Title>
            <Dialog.Description className="sr-only">Search and navigate the platform.</Dialog.Description>
            <Command label="Command palette" loop>
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Command.Input
                  autoFocus
                  placeholder="Go to…"
                  className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="px-2 py-4 text-sm text-muted-foreground">No results.</Command.Empty>

                <Command.Group heading="Navigate" className={GROUP_CLASS}>
                  {items.map((item) => (
                    <Command.Item key={item.href} value={`nav ${item.label}`} onSelect={() => go(item.href)} className={ITEM_CLASS}>
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </Command.Item>
                  ))}
                </Command.Group>

                {can(role, "agent:read") ? (
                  <Command.Group heading="Agents" className={GROUP_CLASS}>
                    {AGENTS.map((a) => (
                      <Command.Item key={a.id} value={`agent ${a.name} ${a.domain}`} onSelect={() => go(`/agents/${a.id}`)} className={ITEM_CLASS}>
                        {a.name}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ) : null}

                {canReadInsights ? (
                  <Command.Group heading="Insights" className={GROUP_CLASS}>
                    {INSIGHTS.map((i) => (
                      <Command.Item key={i.id} value={`insight ${i.title} ${i.domain}`} onSelect={() => go(`/agents/${i.agentId}`)} className={ITEM_CLASS}>
                        {i.title}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ) : null}

                {canReadInsights && actions.length > 0 ? (
                  <Command.Group heading="Actions" className={GROUP_CLASS}>
                    {actions.map((a) => (
                      <Command.Item key={a.id} value={`action ${a.title} ${a.category}`} onSelect={() => go(`/agents/${a.agentId}`)} className={ITEM_CLASS}>
                        {a.title}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ) : null}

                {can(role, "knowledge:read") ? (
                  <Command.Group heading="Knowledge" className={GROUP_CLASS}>
                    {KNOWLEDGE_DOCS.map((d) => (
                      <Command.Item key={d.id} value={`doc ${d.title} ${d.tags.join(" ")}`} onSelect={() => go("/knowledge")} className={ITEM_CLASS}>
                        {d.title}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ) : null}
              </Command.List>
            </Command>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
