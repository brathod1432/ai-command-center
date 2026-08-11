# Governance Model — Helm

> **Phase 5 — Human Governance Model.** Every consequential business action in Helm requires **human approval** and produces an **immutable audit record**. AI recommends; humans decide.

**Document status:** Phase 5 · **Last updated:** 2026-08-11

---

## 1. Core Principle

> **No consequential action is ever executed autonomously.** Helm proposes; a human with the right role approves; the decision is logged.

This is a hard product invariant, enforced in the domain layer (`lib/governance`) and reflected in the UI (every consequential action renders an approval gate).

---

## 2. What Requires Approval

Consequential actions (non-exhaustive), per the product mandate:

| Category | Examples |
|---|---|
| Deployments | Release, rollback, infra change (proposal only; Helm never deploys) |
| Customer messaging | Emails, in-app messages, outreach, QBR/renewal notes |
| Financial | Payments, refunds, invoice approval, collections outreach, budget changes |
| Legal / compliance | Legal communications, contract changes |
| Access / identity | User removal, permission changes, role grants |
| Data | Bulk edits, exports of sensitive data, deletions |

**Low-risk, reversible, read-only** operations (viewing dashboards, generating a draft, running an analysis) do **not** require approval — but are still logged where relevant.

---

## 3. Action Risk Classification

Each proposed `Action` is classified so the right gate applies:

| Tier | Definition | Gate |
|---|---|---|
| **T0 – Informational** | Read-only, no side effects | No approval; optional log |
| **T1 – Low** | Reversible, low blast radius | Single approver (owner role) |
| **T2 – Medium** | External effect or moderate blast radius | Role-appropriate approver + audit |
| **T3 – High** | Financial, legal, access, or irreversible | Elevated approver (or dual approval) + audit + reason required |

The classification is computed from the agent's declared risk + action category (see `agent-architecture.md` §4).

---

## 4. Approval Workflow

```
Agent Insight ──► Proposed Action ──► Governance Gate ──► Approver Queue
                                            │
                          ┌─────────────────┼─────────────────┐
                     Approve              Decline           Request changes
                        │                   │                   │
                 Mark approved        Mark declined      Return to proposer
                 (record decision)    (record reason)    (record note)
                        │
                 Action marked "approved" (execution handled by human/integration,
                 never autonomously by the agent) ──► Audit record (immutable)
```

**States:** `proposed → pending_approval → {approved | declined | changes_requested} → (approved →) closed`.

Every transition records: actor, role, timestamp, tenant, action id, decision, reason/note, and the originating insight + evidence.

---

## 5. Roles & Decision Ownership

Approval authority maps to RBAC roles (see `security-model.md`). Ownership follows domain:

| Domain | Default approver role(s) |
|---|---|
| Financial (T3) | Finance Approver / CFO; high-value = dual (CFO + CEO) |
| Customer messaging | Owning function lead (Sales/CS/Support) |
| Access / permissions | Admin / Security |
| Deployments / eng escalations | Engineering Manager |
| Roadmap commitments | Product lead |
| Cross-functional escalations | COO / CEO |

**Separation of duties:** the proposer and the approver should not be the same person for T2+ actions where roles allow. Dual approval is required for T3 financial/legal actions above a configurable threshold.

---

## 6. Escalation Paths

- **Timeout escalation:** if a pending approval isn't actioned within its SLA (per tier), it escalates to the next approver in the chain and raises visibility in the Executive Command Center.
- **Severity escalation:** `critical` insights auto-create a high-priority approval item and notify the accountable owner.
- **Conflict escalation:** a decline on a `critical` risk routes to the COO/CEO with the rationale.
- **Break-glass:** emergency approvals are permitted for a defined set of roles but are flagged, require a reason, and trigger a post-hoc review entry in the audit log.

Escalation SLAs (defaults, tenant-configurable):

| Tier | Approval SLA | Escalates to |
|---|---|---|
| T1 | 24h | Function lead |
| T2 | 8h | Function lead → COO |
| T3 | 2h | Elevated approver → CEO/CFO |

---

## 7. Auditability Rules

- **Immutable, append-only** audit log. Records are never edited or deleted; corrections are new records referencing the original.
- **Complete coverage:** every consequential decision, every agent run, every permission change, every login/logout, every data export.
- **Attributable:** actor identity + role + tenant on every record.
- **Explainable:** each action links to its originating insight and evidence, so a reviewer can reconstruct *why*.
- **Queryable & exportable:** the `/audit` page supports filtering by actor, domain, tier, outcome, and date; export for compliance.
- **Retention:** configurable per tenant/compliance regime; defaults favor longer retention for T3.

**Audit record shape (reference):**
```ts
interface AuditRecord {
  id: string;
  tenantId: string;
  timestamp: string;          // ISO
  actorId: string;
  actorRole: Role;
  category: 'approval' | 'auth' | 'permission' | 'data' | 'agent' | 'system';
  action: string;             // e.g., "approve_refund"
  tier: 'T0'|'T1'|'T2'|'T3';
  outcome: 'approved'|'declined'|'changes_requested'|'info';
  reason?: string;
  insightId?: string;         // link to evidence
  metadata?: Record<string, unknown>;
}
```

---

## 8. UI Governance Surfaces

- **Approval queue** — a first-class list on the Executive Command Center and per-agent workspace, showing pending items with tier, confidence, evidence, and Approve / Decline / Request changes.
- **Reason capture** — declines and T3 approvals require a reason (validated with Zod).
- **Audit page** — searchable, filterable, exportable record view.
- **Visual gating** — consequential actions are visibly distinct (badge + confirmation dialog) so users never approve blindly.

---

## 9. Governance & AI Safety

Governance is the *enforcement* layer for the AI safety policy (`ai-safety.md`): agents may only ever produce **proposals**; the governance layer is the only path by which a proposal becomes an approved action, and even then execution is performed by a human or an explicitly human-approved integration call — never by the agent itself.

---

## 10. Testing Governance (see `testing.md`)

- **Permission tests:** unauthorized roles cannot approve.
- **Invariant tests:** consequential actions cannot transition to `approved` without an approval record.
- **Audit tests:** every approval/decline writes an immutable record.
- **Escalation tests:** timeouts escalate correctly.
