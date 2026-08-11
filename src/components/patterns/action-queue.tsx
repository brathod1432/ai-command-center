"use client";

import { useState } from "react";
import { Check, ShieldAlert, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ActionStatus, ActionTier, ProposedAction, Role } from "@/lib/types";
import { canApprove } from "@/lib/rbac";
import { useActions, useApprove } from "@/hooks/use-governance";
import { toast } from "@/components/ui/toast";

const TIER_VARIANT: Record<ActionTier, BadgeProps["variant"]> = {
  T0: "secondary",
  T1: "info",
  T2: "warning",
  T3: "destructive",
};

const STATUS_VARIANT: Partial<Record<ActionStatus, BadgeProps["variant"]>> = {
  approved: "success",
  declined: "destructive",
  changes_requested: "warning",
};

function ActionItem({ action, role }: { action: ProposedAction; role: Role }) {
  const approve = useApprove();
  const allowed = canApprove(role);
  const decided = action.status !== "pending_approval" && action.status !== "proposed";
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");

  const needsReason = action.tier === "T3";

  function submit(decision: "approved" | "declined") {
    if ((decision === "declined" || needsReason) && !reason.trim()) {
      setShowReason(true);
      toast({ title: "A reason is required", description: "Declines and T3 approvals need a reason.", variant: "warning" });
      return;
    }
    approve.mutate(
      { actionId: action.id, decision, reason: reason.trim() || undefined },
      {
        onSuccess: (updated) =>
          toast({ title: `Action ${updated.status}`, description: action.title, variant: decision === "approved" ? "success" : "info" }),
        onError: (e) => toast({ title: "Decision failed", description: (e as Error).message, variant: "error" }),
      },
    );
  }

  return (
    <div className="rounded-md border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={TIER_VARIANT[action.tier]}>{action.tier}</Badge>
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {action.category.replace(/_/g, " ")}
        </span>
        {decided ? <Badge variant={STATUS_VARIANT[action.status] ?? "secondary"}>{action.status.replace(/_/g, " ")}</Badge> : null}
      </div>
      <p className="mt-2 font-medium">{action.title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
      <p className="mt-1 text-xs text-muted-foreground">Expected impact: {action.expectedImpact}</p>

      {!decided && (showReason || needsReason) ? (
        <div className="mt-3">
          <label htmlFor={`reason-${action.id}`} className="text-xs font-medium">
            Reason {needsReason ? "(required for T3)" : "(required to decline)"}
          </label>
          <textarea
            id={`reason-${action.id}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Add the rationale for the audit record…"
          />
        </div>
      ) : null}

      {!decided ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button size="sm" disabled={!allowed || approve.isPending} onClick={() => submit("approved")}>
            <Check className="h-4 w-4" aria-hidden="true" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!allowed || approve.isPending}
            onClick={() => (showReason ? submit("declined") : setShowReason(true))}
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Decline
          </Button>
          {!allowed ? (
            <span className="text-xs text-muted-foreground">
              Your role cannot approve — routed to {action.suggestedOwnerRole}.
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function ActionQueue({
  initialActions,
  role,
  agentId,
}: {
  initialActions: ProposedAction[];
  role: Role;
  agentId?: string;
}) {
  const { data = [] } = useActions(initialActions);
  const actions = agentId ? data.filter((a) => a.agentId === agentId) : data;
  const pending = actions.filter((a) => a.status === "pending_approval" || a.status === "proposed");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlert className="h-4 w-4 text-primary" aria-hidden="true" />
          Recommended actions — pending approval
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No actions to review.</p>
        ) : pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">All actions have been reviewed. See the audit trail for the record.</p>
        ) : (
          actions.map((a) => <ActionItem key={a.id} action={a} role={role} />)
        )}
      </CardContent>
    </Card>
  );
}
