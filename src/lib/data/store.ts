import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ActionComment, ApprovalDecision, AuditRecord, ProposedAction, Role } from "@/lib/types";
import { decide } from "@/lib/governance";
import { computeHash, GENESIS_HASH, verifyChain, type ChainStatus } from "@/lib/governance/audit-chain";
import { ACTIONS, INSIGHTS, KPIS } from "@/lib/data/mock";
import { logger } from "@/lib/observability/logger";

/**
 * In-memory datastore for the reference build. Persisted on globalThis so it
 * survives module reloads in dev. Swap for a real DB + service layer in
 * production (the interface is the seam). All access is tenant-scoped.
 */

interface StoreState {
  actions: ProposedAction[];
  audit: AuditRecord[]; // insertion order (chronological) — do not reorder in place
  comments: ActionComment[];
}

/** Append an audit record, extending the tamper-evident hash chain. */
function appendAudit(state: StoreState, record: Omit<AuditRecord, "hash" | "prevHash">): AuditRecord {
  // Strip any incoming chain fields so the hashed field-set is deterministic.
  const { hash: _h, prevHash: _p, ...clean } = record as AuditRecord;
  const prevHash = [...state.audit].reverse().find((a) => a.tenantId === clean.tenantId)?.hash ?? GENESIS_HASH;
  const withPrev = { ...clean, prevHash };
  const hash = computeHash(withPrev);
  const full: AuditRecord = { ...withPrev, hash };
  state.audit.push(full);
  return full;
}

function seed(): StoreState {
  const state: StoreState = { actions: ACTIONS.map((a) => ({ ...a })), audit: [], comments: [] };
  appendAudit(state, {
    id: "aud_seed_login",
    tenantId: "acme",
    timestamp: "2026-08-11T07:55:00.000Z",
    actorId: "u_founder",
    actorRole: "executive",
    category: "auth",
    action: "login",
    tier: "T0",
    outcome: "info",
  });
  return state;
}

/**
 * Best-effort file persistence so decisions/comments/audit survive a restart.
 * Fail-safe: any I/O error silently falls back to in-memory. Disabled under
 * test and when HELM_PERSIST=off. See docs/improvements-v3.md §2 (U5).
 */
const DATA_DIR = join(process.cwd(), ".data");
const DATA_FILE = join(DATA_DIR, "helm-store.json");
const PERSIST = process.env.NODE_ENV !== "test" && process.env.HELM_PERSIST !== "off";

function loadFromDisk(): StoreState | null {
  if (!PERSIST) return null;
  try {
    if (existsSync(DATA_FILE)) return JSON.parse(readFileSync(DATA_FILE, "utf8")) as StoreState;
  } catch {
    /* corrupt or unreadable — fall back to seed */
  }
  return null;
}

function persist(current: StoreState): void {
  if (!PERSIST) return;
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DATA_FILE, JSON.stringify(current));
  } catch {
    /* read-only FS or other error — keep working in memory */
  }
}

const g = globalThis as unknown as { __helmStore?: StoreState };
if (!g.__helmStore) g.__helmStore = loadFromDisk() ?? seed();
const state = g.__helmStore;

export interface ActivityItem {
  id: string;
  timestamp: string;
  actorRole: Role;
  action: string;
  outcome: AuditRecord["outcome"];
  tier: AuditRecord["tier"];
}

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

  /** Verify the tamper-evident chain for a tenant (uses chronological order). */
  verifyAudit(tenantId: string): ChainStatus {
    return verifyChain(state.audit.filter((a) => a.tenantId === tenantId));
  },

  addAudit(record: Omit<AuditRecord, "hash" | "prevHash">): AuditRecord {
    const r = appendAudit(state, record);
    persist(state);
    return r;
  },

  /** Record a denied authorization attempt (security monitoring). */
  recordDenied(params: { tenantId: string; actorId: string; actorRole: Role; permission: string }): void {
    appendAudit(state, {
      id: `aud_denied_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      tenantId: params.tenantId,
      timestamp: new Date().toISOString(),
      actorId: params.actorId,
      actorRole: params.actorRole,
      category: "permission",
      action: `denied:${params.permission}`,
      tier: "T0",
      outcome: "info",
    });
    persist(state);
  },

  listComments(tenantId: string, actionId: string): ActionComment[] {
    return state.comments
      .filter((c) => c.tenantId === tenantId && c.actionId === actionId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  /** Redacted recent activity for the notification feed (no sensitive reasons). */
  recentActivity(tenantId: string, limit = 12): ActivityItem[] {
    return this.listAudit(tenantId)
      .slice(0, limit)
      .map((r) => ({
        id: r.id,
        timestamp: r.timestamp,
        actorRole: r.actorRole,
        action: r.action,
        outcome: r.outcome,
        tier: r.tier,
      }));
  },

  /**
   * Apply a human approval decision. Enforces the governance invariant via
   * lib/governance.decide (authorized role + reason rules) and always writes an
   * immutable, hash-chained audit record. See docs/governance.md.
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
    const audit = appendAudit(state, { ...result.audit });
    persist(state);
    logger.info("governance.decision", {
      tenantId: params.tenantId,
      actionId: params.actionId,
      decision: params.decision,
      actorRole: params.actorRole,
    });
    return { action: result.action, audit };
  },

  /** Assign an owner (and optional due date) to an action. */
  assignAction(params: {
    tenantId: string;
    actionId: string;
    owner: string;
    dueDate?: string;
    actorId: string;
    actorRole: Role;
  }): ProposedAction {
    const action = this.getAction(params.tenantId, params.actionId);
    if (!action) throw new Error("Action not found");
    action.owner = params.owner;
    action.dueDate = params.dueDate;
    appendAudit(state, {
      id: `aud_assign_${action.id}_${Date.now()}`,
      tenantId: params.tenantId,
      timestamp: new Date().toISOString(),
      actorId: params.actorId,
      actorRole: params.actorRole,
      category: "data",
      action: `assign:${action.title} → ${params.owner}`,
      tier: "T1",
      outcome: "info",
      insightId: action.insightId,
    });
    persist(state);
    return action;
  },

  /** Mark an action complete (follow-through). */
  completeAction(params: { tenantId: string; actionId: string; actorId: string; actorRole: Role }): ProposedAction {
    const action = this.getAction(params.tenantId, params.actionId);
    if (!action) throw new Error("Action not found");
    action.completedAt = new Date().toISOString();
    action.status = "closed";
    appendAudit(state, {
      id: `aud_complete_${action.id}_${Date.now()}`,
      tenantId: params.tenantId,
      timestamp: action.completedAt,
      actorId: params.actorId,
      actorRole: params.actorRole,
      category: "data",
      action: `complete:${action.title}`,
      tier: "T1",
      outcome: "info",
      insightId: action.insightId,
    });
    persist(state);
    return action;
  },

  /** Add a comment to an action. */
  addComment(params: {
    tenantId: string;
    actionId: string;
    body: string;
    authorId: string;
    authorRole: Role;
  }): ActionComment {
    const action = this.getAction(params.tenantId, params.actionId);
    if (!action) throw new Error("Action not found");
    const comment: ActionComment = {
      id: `c_${action.id}_${Date.now()}`,
      tenantId: params.tenantId,
      actionId: params.actionId,
      authorId: params.authorId,
      authorRole: params.authorRole,
      body: params.body,
      createdAt: new Date().toISOString(),
    };
    state.comments.push(comment);
    persist(state);
    return comment;
  },
};

export { KPIS, INSIGHTS };
