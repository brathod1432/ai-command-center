"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Rocket, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "helm_onboarding_dismissed";

const STEPS = [
  { href: "/agents", label: "Review an agent's insight", detail: "See what the agents surfaced, with evidence and confidence." },
  { href: "/my-work", label: "Approve or decline an action", detail: "Act on what's on your plate — every decision is governed." },
  { href: "/audit", label: "Check the audit trail", detail: "Confirm the tamper-evident record of your decision." },
  { href: "/team", label: "Review team & permissions", detail: "See who can approve what (access review)." },
];

/** Dismissible first-run guide. Preference remembered in localStorage. */
export function OnboardingChecklist() {
  // Start hidden so server and first client render match (avoids hydration flash).
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setHidden(false);
    }
  }, []);

  if (hidden) return null;

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setHidden(true);
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Rocket className="h-4 w-4 text-primary" aria-hidden="true" />
            Get started with Helm
          </CardTitle>
          <Button variant="ghost" size="icon" aria-label="Dismiss getting started" onClick={dismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-2 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="flex items-start gap-3 rounded-md border bg-background p-3 transition-colors hover:border-primary/50"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 font-medium">
                    {s.label}
                    <ArrowRight className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                  </span>
                  <span className="block text-xs text-muted-foreground">{s.detail}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
