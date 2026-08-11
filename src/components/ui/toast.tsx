"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) =>
    set((s) => ({ toasts: [...s.toasts, { ...t, id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

/** Imperative helper: `toast({ title, variant })`. */
export function toast(t: { title: string; description?: string; variant?: ToastVariant }) {
  useToastStore.getState().push({ title: t.title, description: t.description, variant: t.variant ?? "info" });
}

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: TriangleAlert,
  info: Info,
} as const;

const STYLES: Record<ToastVariant, string> = {
  success: "border-success/40",
  error: "border-destructive/40",
  warning: "border-warning/40",
  info: "border-info/40",
};

function ToastItem({ t }: { t: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const Icon = ICONS[t.variant];
  useEffect(() => {
    const timer = setTimeout(() => dismiss(t.id), 5000);
    return () => clearTimeout(timer);
  }, [t.id, dismiss]);

  return (
    <div className={cn("flex items-start gap-3 rounded-md border bg-card p-3 shadow-md", STYLES[t.variant])}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="flex-1">
        <p className="text-sm font-medium">{t.title}</p>
        {t.description ? <p className="text-xs text-muted-foreground">{t.description}</p> : null}
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => dismiss(t.id)}
        className="text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem t={t} />
        </div>
      ))}
    </div>
  );
}
