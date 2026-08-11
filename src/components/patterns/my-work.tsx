"use client";

import Link from "next/link";
import { CheckCircle2, ClipboardList, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { ActionTier, ProposedAction } from "@/lib/types";
import { canApprove } from "@/lib/rbac";
import { useActions } from "@/hooks/use-governance";
import { useSession } from "@/components/shell/session-context";

const TIER_VARIANT: Record<ActionTier, BadgeProps["variant"]> = {
  T0: "secondary",
  T1: "info",
  T2: "warning",
  T3: "destructive",
};

function ActionRow({ action }: { action: ProposedAction }) {
  return (
    <li>
      <Link
        href={`/agents/${action.agentId}`}
        className="flex items-start justify-between gap-3 rounded-md border p-3 transition-colors hover:border-primary/50"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant={TIER_VARIANT[action.tier]}>{action.tier}</Badge>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {action.category.replace(/_/g, " ")}
            </span>
          </div>
          <p className="mt-1 truncate font-medium">{action.title}</p>
          {action.owner ? (
            <p className="text-xs text-muted-foreground">
              Owner: {action.owner}
              {action.dueDate ? ` · due ${action.dueDate}` : ""}
            </p>
          ) : null}
        </div>
        <Badge variant="outline" className="shrink-0 capitalize">
          {action.status.replace(/_/g, " ")}
        </Badge>
      </Link>
    </li>
  );
}

function Section({
  title,
  icon: Icon,
  items,
  empty,
}: {
  title: string;
  icon: typeof Inbox;
  items: ProposedAction[];
  empty: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
          {title}
          <Badge variant="secondary" className="ml-1">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          <ul className="space-y-2">
            {items.map((a) => (
              <ActionRow key={a.id} action={a} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function MyWork({ initialActions }: { initialActions: ProposedAction[] }) {
  const { data: actions = [] } = useActions(initialActions);
  const { role, name } = useSession();

  const awaiting = actions.filter(
    (a) => (a.status === "pending_approval" || a.status === "proposed") && canApprove(role),
  );
  const assignedToMe = actions.filter((a) => a.owner === name && !a.completedAt);
  const completed = actions.filter((a) => Boolean(a.completedAt) || a.status === "closed");

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Section
        title="Awaiting your approval"
        icon={Inbox}
        items={awaiting}
        empty={canApprove(role) ? "Nothing needs your approval right now." : "Your role doesn't approve actions."}
      />
      <Section title="Assigned to you" icon={ClipboardList} items={assignedToMe} empty="No actions are assigned to you." />
      <Section title="Recently completed" icon={CheckCircle2} items={completed} empty="No completed actions yet." />
    </div>
  );
}
