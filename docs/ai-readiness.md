# AI Readiness — Helm

> How Helm is architected today so that richer AI (LLM reasoning, RAG, forecasting) can be added later as an **implementation swap**, not a redesign — without ever weakening the governance and safety invariants.

**Document status:** Phase 19 · **Last updated:** 2026-08-11

---

## 1. What "AI-ready" means here

Helm's reference agents use transparent, testable rules/heuristics over normalized data. "AI readiness" means the seams are in place to upgrade the *reasoning* engine while keeping **explainability, confidence, human-in-the-loop, and audit** unchanged.

---

## 2. Readiness Pillars

| Pillar | Today | Upgrade path |
|---|---|---|
| **Normalized data** | Adapters emit Zod-validated domain entities | Same entities feed LLM/RAG context |
| **Insight contract** | `Insight{evidence, confidence, severity}` | LLM outputs must conform to the same schema |
| **Retriever interface** | Keyword retriever over chunked docs | Vector/hybrid retriever, same interface (`knowledge-architecture.md`) |
| **Agent registry** | Pluggable agents + kill switch | Add LLM-backed agents behind the same `Agent` contract |
| **Governance gate** | Proposals → approval → audit | Unchanged; LLM still only proposes |
| **Eval harness** | Golden fixtures per agent | Extend with LLM eval + calibration |

---

## 3. Data Readiness

- Every entity carries `tenantId` and stable typing → clean, scoped context windows.
- Knowledge is pre-**chunked** with heading metadata → embedding-ready.
- Provenance/citations are first-class → grounding is enforceable.

## 4. Model Integration Seam

A single `Reasoner` interface will wrap any future model:

```ts
interface Reasoner {
  analyze(input: GroundedContext): Promise<Insight[]>; // must return schema-valid, cited, confidence-scored
}
```

- Reference: `RuleReasoner` (deterministic).
- Future: `LlmReasoner` (grounded + cited + confidence), swappable per agent.
- Outputs are **validated** against the Insight schema; non-conforming outputs are rejected (no uncited/again-ungrounded claims reach users).

## 5. RAG Readiness

See `knowledge-architecture.md` §5/§8: stable doc/chunk schema, retriever interface, citations required, embedding + vector store as a drop-in. Retrieval stays tenant-scoped and RBAC-aware.

## 6. Safety Invariants Preserved

Adding AI never changes these (`ai-safety.md`):
- AI may recommend/analyze/summarize/explain/predict/draft.
- AI may **not** delete data, send customer comms, execute financial actions, deploy code, or change access — autonomously.
- Every consequential action → human approval → immutable audit.
- Confidence + evidence required; abstain on low data.

## 7. Evaluation & Calibration

- Golden fixtures gate agent changes.
- Track acceptance rate, decline reasons, and confidence calibration.
- Closed-loop learning (future): approved/declined outcomes refine recommendations.

## 8. Cost, Latency & Privacy (future LLM use)

- Cache + batch context; per-tenant budgets; observability on token/latency/cost.
- Keep PII out of prompts (redaction); prefer tenant-scoped, least-privilege context.
- Optionally support private/on-prem models for regulated tenants (aligns with single-tenant/hybrid deployment).

## 9. Readiness Checklist

- [x] Normalized, tenant-scoped domain entities.
- [x] Schema-enforced, cited, confidence-scored insights.
- [x] Pluggable agent registry + kill switch.
- [x] Retriever interface + chunked knowledge.
- [x] Governance + audit independent of reasoning engine.
- [x] Eval harness (golden fixtures).
- [ ] Vector store + embeddings (future).
- [ ] LLM reasoner + calibration (future).
- [ ] Closed-loop outcome learning (future).
