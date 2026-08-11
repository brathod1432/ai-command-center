"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const SHORTCUTS: Array<[string, string]> = [
  ["⌘K / Ctrl+K", "Open the command palette (search & navigate)"],
  ["?", "Show this shortcuts help"],
  ["Esc", "Close dialogs, menus, and the palette"],
];

/** Press "?" (outside inputs) to open a keyboard-shortcuts dialog. */
export function ShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (e.key === "?" && !typing) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" onClick={() => setOpen(false)} />
      <div role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" className="relative w-full max-w-sm rounded-lg border bg-card p-5 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Keyboard shortcuts</h2>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ul className="space-y-2">
          {SHORTCUTS.map(([keys, desc]) => (
            <li key={keys} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground">{desc}</span>
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">{keys}</kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
