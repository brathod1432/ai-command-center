"use client";

import { useState } from "react";
import { Check, CheckCheck, MessageSquare, ShieldAlert, UserPlus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionStatus, ActionTier, ProposedAction, Role } from "@/lib/types";
import { canApprove } from "@/lib/rbac";
import { useActionUpdate, useActions, useApprove, useComments } from "@/hooks/use-governance";
import { useSession } from "@/components/shell/session-context";
import { toast } from "@/components/ui/toast";
import { timeAgo } from "@/lib/utils";

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
  closed: "secondary",
};

function CommentThread({ actionId }: { actionId: string }) {
  const { data: comments = [], isLoading } = useComments(actionId, true);
  const update = useActionUpdate();
  const [body, setBody] = useState("");

  function add() {
    if (!body.trim()) return;
    update.mutate(
      { op: "comment", actionId, body: body.trim() },
      {
        onSuccess: () => setBody(""),
        onError: (e) => toast({ title: "Comment failed", description: (e as Error).message, variant: "error" }),
      },
    );
  }

  return (
    <div className="mt-3 rounded-md border bg-muted/30 p-3">
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="text-sm">
              <span className="font-medium capitalize">{c.authorRole}</span>{" "}
              <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
              <p className="text-muted-foreground">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex gap-2">
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment…"
          aria-label="Add a comment"
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
        />
        <Button size="sm" onClick={add} disabled={update.isPending || !body.trim()}>
          Post
        </Button>
      </div>
    </div>
  );
}

function ActionItem({ action, role }: { action: ProposedAction; role: Role }) {
  const approve = useApprove();
  const update = useActionUpdate();
  const { name } = useSession();
  const allowed = canApprove(role);
  const isPendingReview = action.status === "pending_approval" || action.status === "proposed";
  const isApproved = action.status === "approved";
  const isClosed = action.status === "closed" || Boolean(action.completedAt);
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [owner, setOwner] = useState(name);
  const [dueDate, setDueDate] = useState("");

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

  function assign() {
    if (!owner.trim()) return;
    update.mutate(
      { op: "assign", actionId: action.id, owner: owner.trim(), dueDate: dueDate || undefined },
      {
        onSuccess: () => toast({ title: "Owner assigned", description: `${action.title} → ${owner}`, variant: "success" }),
        onError: (e) => toast({ title: "Assign failed", description: (e as Error).message, variant: "error" }),
      },
    );
  }

  function complete() {
    update.mutate(
      { op: "complete", actionId: action.id },
      {
        onSuccess: () => toast({ title: "Marked complete", description: action.title, variant: "success" }),
        onError: (e) => toast({ title: "Complete failed", description: (e as Error).message, variant: "error" }),
      },
    );
  }

  return (
    <div className="rounded-md border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={TIER_VARIANT[action.tier]}>{action.tier}</Badge>
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{action.category.replace(/_/g, " ")}</span>
        {!isPendingReview ? <Badge variant={STATUS_VARIANT[action.status] ?? "secondary"}>{action.status.replace(/_/g, " ")}</Badge> : null}
        {action.completedAt ? <Badge variant="success">completed</Badge> : null}
      </div>
      <p className="mt-2 font-medium">{action.title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
      <p className="mt-1 text-xs text-muted-foreground">Expected impact: {action.expectedImpact}</p>

      {action.owner ? (
        <p className="mt-2 text-xs">
          <span className="text-muted-foreground">Owner:</span> <span className="font-medium">{action.owner}</span>
          {action.dueDate ? <span className="text-muted-foreground"> · due {action.dueDate}</span> : null}
        </p>
      ) : null}

      {/* Pending review: approve / decline */}
      {isPendingReview ? (
        <>
          {showReason || needsReason ? (
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
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" disabled={!allowed || approve.isPending} onClick={() => submit("approved")}>
              <Check className="h-4 w-4" aria-hidden="true" /> Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!allowed || approve.isPending}
              onClick={() => (showReason ? submit("declined") : setShowReason(true))}
            >
              <X className="h-4 w-4" aria-hidden="true" /> Decline
            </Button>
            {!allowed ? (
              <span className="text-xs text-muted-foreground">Your role cannot approve — routed to {action.suggestedOwnerRole}.</span>
            ) : null}
          </div>
        </>
      ) : null}

      {/* Approved: follow-through (assign owner + mark complete) */}
      {isApproved && !isClosed && allowed ? (
        <div className="mt-3 space-y-2 rounded-md border border-dashed p-3">
          <p className="text-xs font-medium">Follow-through</p>
          <div className="flex flex-wrap items-center gap-2">
            <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Owner" aria-label="Owner" className="h-8 max-w-[160px]" />
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} aria-label="Due date" className="h-8 max-w-[150px]" />
            <Button size="sm" variant="outline" onClick={assign} disabled={update.isPending}>
              <UserPlus className="h-4 w-4" aria-hidden="true" /> Assign
            </Button>
            <Button size="sm" onClick={complete} disabled={update.isPending}>
              <CheckCheck className="h-4 w-4" aria-hidden="true" /> Mark complete
            </Button>
          </div>
        </div>
      ) : null}

      {/* Comments (everyone can view/add) */}
      <div className="mt-3">
        <Button size="sm" variant="ghost" onClick={() => setShowComments((s) => !s)} aria-expanded={showComments}>
          <MessageSquare className="h-4 w-4" aria-hidden="true" /> {showComments ? "Hide" : "Comments"}
        </Button>
        {showComments ? <CommentThread actionId={action.id} /> : null}
      </div>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlert className="h-4 w-4 text-primary" aria-hidden="true" />
          Recommended actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No actions to review.</p>
        ) : (
          actions.map((a) => <ActionItem key={a.id} action={a} role={role} />)
        )}
      </CardContent>
    </Card>
  );
}
