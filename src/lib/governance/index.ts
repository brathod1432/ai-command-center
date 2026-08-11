import type {
  ActionCategory,
  ActionTier,
  ApprovalDecision,
  AuditRecord,
  ProposedAction,
  Role,
} from "@/lib/types";
import { requiredApprovals } from "@/lib/types";
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

  const needed = requiredApprovals(action.tier);
  const existing = action.approvals ?? [];

  let updated: ProposedAction;
  let auditAction: string;
  let outcome: AuditRecord["outcome"];

  if (decision === "approved") {
    // Dual-control: a single user cannot supply two of the required approvals.
    if (existing.includes(actorId)) {
      throw new ApprovalError("You have already approved this action; a second, different approver is required");
    }
    const approvals = [...existing, actorId];
    const finalized = approvals.length >= needed;
    updated = { ...action, approvals, status: finalized ? "approved" : "pending_approval" };
    // Partial (first-of-two) approvals are informational; only the finalizing one is "approved".
    outcome = finalized ? "approved" : "info";
    auditAction = needed > 1 ? `approve(${approvals.length}/${needed}):${action.title}` : `approve:${action.title}`;
  } else if (decision === "declined") {
    updated = { ...action, status: "declined" };
    outcome = "declined";
    auditAction = `decline:${action.title}`;
  } else {
    updated = { ...action, status: "changes_requested" };
    outcome = "changes_requested";
    auditAction = `changes_requested:${action.title}`;
  }

  const audit: AuditRecord = {
    id: `aud_${action.id}_${now.getTime()}`,
    tenantId: action.tenantId,
    timestamp: now.toISOString(),
    actorId,
    actorRole,
    category: "approval",
    action: auditAction,
    tier: action.tier,
    outcome,
    reason: reason?.trim() || undefined,
    insightId: action.insightId,
  };

  return { action: updated, audit };
}
