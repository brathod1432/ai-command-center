"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ActionComment, ActionUpdateInput, ApprovalDecision, AuditRecord, ProposedAction } from "@/lib/types";

export interface ActivityItem {
  id: string;
  timestamp: string;
  actorRole: string;
  action: string;
  outcome: string;
  tier: string;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "content-type": "application/json" } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data as T;
}

export function useActions(initial?: ProposedAction[]) {
  return useQuery({
    queryKey: ["actions"],
    queryFn: () => getJson<{ actions: ProposedAction[] }>("/api/actions").then((d) => d.actions),
    initialData: initial,
  });
}

export function useAudit(initial?: AuditRecord[]) {
  return useQuery({
    queryKey: ["audit"],
    queryFn: () => getJson<{ records: AuditRecord[] }>("/api/audit").then((d) => d.records),
    initialData: initial,
  });
}

export interface ApprovalInputClient {
  actionId: string;
  decision: ApprovalDecision;
  reason?: string;
}

export function useApprove() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ApprovalInputClient): Promise<ProposedAction> => {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      return data.action as ProposedAction;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["actions"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
    },
  });
}

export function useActivity() {
  return useQuery({
    queryKey: ["activity"],
    queryFn: () => getJson<{ items: ActivityItem[] }>("/api/activity").then((d) => d.items),
    refetchInterval: 30_000,
  });
}

export function useComments(actionId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["comments", actionId],
    queryFn: () => getJson<{ comments: ActionComment[] }>(`/api/actions/${actionId}/comments`).then((d) => d.comments),
    enabled,
  });
}

/** Assign / complete / comment on an action. */
export function useActionUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ActionUpdateInput) => {
      const res = await fetch("/api/actions/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      return data as { action?: ProposedAction; comment?: ActionComment };
    },
    onSuccess: (_data, input) => {
      qc.invalidateQueries({ queryKey: ["actions"] });
      qc.invalidateQueries({ queryKey: ["audit"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
      qc.invalidateQueries({ queryKey: ["comments", input.actionId] });
    },
  });
}
