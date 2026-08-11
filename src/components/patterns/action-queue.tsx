"use client";

import { useState } from "react";
import { Check, ShieldAlert, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ActionTier, ProposedAction, Role } from "@/lib/types";
import { canApprove } from "@/lib/rbac";

const TIER_VARIANT: Record<ActionTier, BadgeProps["variant"]> = {
  T0: "secondary",
  T1: "info",
  T2: "warning",
  T3: "destructive",
};

type Decision = "approved" | "declined";

/**
 * Approval queue. Renders governance gates for consequential actions.
 * Approve/Decline is disabled for roles without approval authority
 * (see docs/governance.md & docs/security-model.md). This demo records the
 * decision locally; in production it posts to a governed, audited API.
 */
export function ActionQueue({ actions, role }: { actions: ProposedAction[]; role: Role }) {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const allowed = canApprove(role);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlert className="h-4 w-4 text-primary" aria-hidden="true" />
          Recommended actions — pending approval
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((a) => {
          const decision = decisions[a.id];
          return (
            <div key={a.id} className="rounded-md border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={TIER_VARIANT[a.tier]}>{a.tier}</Badge>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {a.category.replace(/_/g, " ")}
                </span>
                {decision ? (
                  <Badge variant={decision === "approved" ? "success" : "destructive"}>
                    {decision}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-2 font-medium">{a.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">Expected impact: {a.expectedImpact}</p>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  disabled={!allowed || !!decision}
                  onClick={() => setDecisions((d) => ({ ...d, [a.id]: "approved" }))}
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!allowed || !!decision}
                  onClick={() => setDecisions((d) => ({ ...d, [a.id]: "declined" }))}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Decline
                </Button>
                {!allowed ? (
                  <span className="text-xs text-muted-foreground">
                    Your role cannot approve — routed to {a.suggestedOwnerRole}.
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
