import type { ApprovalDecision, AuditRecord, ProposedAction, Role } from "@/lib/types";
import { decide } from "@/lib/governance";
import { ACTIONS, INSIGHTS, KPIS } from "@/lib/data/mock";
import { logger } from "@/lib/observability/logger";

/**
 * In-memory datastore for the reference build. Persisted on globalThis so it
 * survives module reloads in dev. Swap for a real DB + service layer in
 * production (the interface is the seam). All access is tenant-scoped.
 */

interface StoreState {
  actions: ProposedAction[];
  audit: AuditRecord[];
}

function seed(): StoreState {
  return {
    actions: ACTIONS.map((a) => ({ ...a })),
    audit: [
      {
        id: "aud_seed_login",
        tenantId: "acme",
        timestamp: "2026-08-11T07:55:00.000Z",
        actorId: "u_founder",
        actorRole: "executive",
        category: "auth",
        action: "login",
        tier: "T0",
        outcome: "info",
      },
    ],
  };
}

const g = globalThis as unknown as { __helmStore?: StoreState };
if (!g.__helmStore) g.__helmStore = seed();
const state = g.__helmStore;

export const store = {
  listActions(tenantId: string): ProposedAction[] {
    return state.actions.filter((a) => a.tenantId === tenantId);
  },

  getAction(tenantId: string, id: string): ProposedAction | undefined {
    return state.actions.find((a) => a.tenantId === tenantId && a.id === id);
  },

  listAudit(tenantId: string): AuditRecord[] {
    return state.audit
      .filter((a) => a.tenantId === tenantId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  addAudit(record: AuditRecord): AuditRecord {
    state.audit.push(record);
    return record;
  },

  /**
   * Apply a human approval decision. Enforces the governance invariant via
   * lib/governance.decide (authorized role + reason rules) and always writes an
   * immutable audit record. See docs/governance.md.
   */
  applyDecision(params: {
    tenantId: string;
    actionId: string;
    decision: ApprovalDecision;
    actorId: string;
    actorRole: Role;
    reason?: string;
  }): { action: ProposedAction; audit: AuditRecord } {
    const action = this.getAction(params.tenantId, params.actionId);
    if (!action) throw new Error("Action not found");

    const result = decide({
      action,
      decision: params.decision,
      actorId: params.actorId,
      actorRole: params.actorRole,
      reason: params.reason,
    });

    const idx = state.actions.findIndex((a) => a.id === action.id && a.tenantId === params.tenantId);
    if (idx >= 0) state.actions[idx] = result.action;
    this.addAudit(result.audit);
    logger.info("governance.decision", {
      tenantId: params.tenantId,
      actionId: params.actionId,
      decision: params.decision,
      actorRole: params.actorRole,
    });
    return result;
  },
};

export { KPIS, INSIGHTS };
