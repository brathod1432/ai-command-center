import type {
  ActionCategory,
  ActionTier,
  ApprovalDecision,
  AuditRecord,
  ProposedAction,
  Role,
} from "@/lib/types";
import { canApprove } from "@/lib/rbac";

/**
 * Governance domain logic. Enforces the hard invariant that consequential
 * actions require a human approval record. See docs/governance.md & ai-safety.md.
 */

/** Map an action category to its governance risk tier. */
export function classifyTier(category: ActionCategory): ActionTier {
  switch (category) {
    case "informational":
      return "T0";
    case "roadmap":
    case "resourcing":
      return "T1";
    case "customer_messaging":
    case "data":
    case "deployment":
      return "T2";
    case "financial":
    case "legal":
    case "access":
      return "T3";
    default:
      return "T2";
  }
}

/** T1+ actions are consequential and require approval. */
export function requiresApproval(tier: ActionTier): boolean {
  return tier !== "T0";
}

export class ApprovalError extends Error {}

export interface ApprovalResult {
  action: ProposedAction;
  audit: AuditRecord;
}

/**
 * Apply a human approval decision to a proposed action.
 * INVARIANT: a consequential action can only reach "approved" via this path,
 * by a role with approval authority, and it always emits an audit record.
 */
export function decide(params: {
  action: ProposedAction;
  decision: ApprovalDecision;
  actorId: string;
  actorRole: Role;
  reason?: string;
  now?: Date;
}): ApprovalResult {
  const { action, decision, actorId, actorRole, reason } = params;
  const now = params.now ?? new Date();

  if (requiresApproval(action.tier) && !canApprove(actorRole)) {
    throw new ApprovalError(`Role "${actorRole}" is not permitted to approve actions`);
  }
  if ((decision === "declined" || action.tier === "T3") && !reason?.trim()) {
    throw new ApprovalError("A reason is required for declines and T3 approvals");
  }

  const nextStatus =
    decision === "approved" ? "approved" : decision === "declined" ? "declined" : "changes_requested";

  const updated: ProposedAction = { ...action, status: nextStatus };

  const audit: AuditRecord = {
    id: `aud_${action.id}_${now.getTime()}`,
    tenantId: action.tenantId,
    timestamp: now.toISOString(),
    actorId,
    actorRole,
    category: "approval",
    action: `${decision}:${action.title}`,
    tier: action.tier,
    outcome: decision,
    reason: reason?.trim() || undefined,
    insightId: action.insightId,
  };

  return { action: updated, audit };
}
