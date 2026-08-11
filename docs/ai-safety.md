# AI Safety & Governance — Helm

> **Phase 14 — AI Safety.** The rules that keep Helm's AI trustworthy: what agents **may** do, what they **may never** do, and how those boundaries are enforced.

**Document status:** Phase 14 · **Last updated:** 2026-08-11

---

## 1. Guiding Principle

> **AI recommends. Humans decide. Every consequential action is approved and audited.**

Helm is designed so an executive can trust every recommendation *because* it is explainable, bounded, and never self-executing.

---

## 2. Capability Boundaries

### AI **MAY**
- **Recommend** next actions (as proposals only).
- **Analyze** business data and detect patterns/anomalies.
- **Summarize** activity across systems.
- **Explain** *why* something happened, citing evidence.
- **Predict** trends/risks with an explicit confidence score.
- **Draft** artifacts (messages, reports) for human review — never send them.

### AI **MAY NOT** (hard invariants)
- ❌ **Delete data autonomously.**
- ❌ **Send customer communications autonomously.**
- ❌ **Execute financial activity autonomously** (payments, refunds, invoice approvals).
- ❌ **Deploy code autonomously.**
- ❌ **Remove users or change permissions autonomously.**
- ❌ Take **any** consequential action without a human approval record.
- ❌ Act across tenants or outside its declared domain scope.

These are enforced in code (see §5), not just policy.

---

## 3. Explainability Requirements

Every agent output must include:
- **Evidence:** links to the source entities (deal/ticket/PR/invoice/doc).
- **Reasoning:** a plain-language "why".
- **Confidence (0–100):** shown on every insight; low-confidence items are de-emphasized and never auto-prioritized.
- **Provenance:** which agent, which data sources, and when.

No uncited claims. The Knowledge Agent must return citations with every answer (see `knowledge-architecture.md`).

---

## 4. Human-in-the-Loop Model

```
Agent proposes ─► Governance gate ─► Human approves/declines ─► (human/approved integration executes) ─► Audit
```

- Agents emit **proposals** with a `requiresApproval` flag and risk tier.
- The **only** path from proposal → action is the governance layer (see `governance.md`).
- Even after approval, execution is performed by a human or an explicitly human-approved integration call — the agent never executes side effects itself.

---

## 5. Technical Enforcement

| Boundary | Enforcement |
|---|---|
| No autonomous consequential actions | Agent API returns proposals only; no agent code path can call a mutating integration method. Mutating adapter methods require an `approvalId`. |
| Approval required | Governance state machine rejects `approved` transitions without an approval record. |
| Domain/tenant scoping | Agents receive tenant-scoped, domain-scoped inputs; cross-scope access denied at the data layer. |
| Explainability | Insight schema (Zod) *requires* evidence + confidence; outputs failing validation are rejected. |
| Auditability | Every agent run + recommendation + decision writes an immutable audit record. |
| Least privilege | Agents read via adapters with read-first scopes. |

**Invariant tests** (see `testing.md`) assert these boundaries, e.g., "a consequential action cannot reach `approved` without an approval record" and "no agent can invoke a mutating adapter method."

---

## 6. Confidence, Uncertainty & Abstention

- Agents attach calibrated confidence; below a threshold, insights are labeled **low-confidence** and excluded from the top action queue.
- When data is insufficient, agents **abstain** ("insufficient data to assess") rather than guess.
- Predictions are framed as probabilities/ranges, not certainties.

---

## 7. Hallucination & Data-Integrity Controls

- **Grounding:** insights must reference real entities in the tenant's data; ungrounded outputs are filtered.
- **Citations required** for knowledge answers; the UI surfaces sources for verification.
- **Determinism where possible:** the reference agents use transparent rules/heuristics over normalized data (auditable and testable); any future LLM use is grounded + cited + confidence-scored.
- **No fabrication of metrics** — numbers shown always trace to source data.

---

## 8. Privacy & Data Handling

- Agents operate on least-privilege, tenant-scoped data.
- No PII in logs; sensitive fields redacted (see `observability.md`, `security-model.md`).
- No data leaves the tenant boundary without governed, audited export.
- Knowledge ingestion can redact/flag sensitive content.

---

## 9. Evaluation & Monitoring

- **Eval harness:** golden fixtures with expected insights; regression tests on agent logic.
- **Quality metrics:** recommendation acceptance rate, decline reasons, precision proxy (accepted/total).
- **Drift watch:** monitor confidence calibration and acceptance trends over time.
- **Feedback loop (future):** human accept/decline feeds closed-loop improvement.

---

## 10. Incident Response for AI Behavior

- If an agent produces harmful/incorrect recommendations at scale: **disable the agent** (kill switch in `lib/agents/registry`), retain audit records, run root-cause, and add a regression fixture before re-enabling.
- Break-glass approvals are flagged and reviewed post-hoc (see `governance.md`).

---

## 11. Trust Test

Every AI capability must pass: **"Would an executive trust this recommendation?"** — which requires evidence, confidence, bounded scope, a human decision gate, and an audit trail. If any is missing, the capability is not shipped.
