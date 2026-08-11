# Future Roadmap — Helm

> Where Helm goes after the reference build. Ordered by horizon; every item preserves the governance, explainability, and audit invariants.

**Document status:** Phase 19 · **Last updated:** 2026-08-11

---

## Horizons

### Now (0–3 months) — Command Center foundation *(this build)*
- Executive Command Center, agent workspaces, governance/approvals + audit.
- RBAC, protected routes, security headers, mock integrations.
- Workflow engine (core), knowledge base (keyword), showcase mode.
- Full test suite (unit/integration/e2e/a11y) + observability scaffolding.

### Next (3–6 months) — Depth & automation
- First **real integrations**: GitHub, Jira, Slack (OAuth, rate-limit/backoff).
- **Reports & export** (board decks, scheduled digests to Slack/Teams/email — drafts, human-sent).
- **Workflow expansion**: more templates, conditional branches, SLA timers.
- **Knowledge ingestion** from Confluence/Google/M365 (still keyword retrieval).
- Notifications & saved views; per-tenant theming/branding.

### Later (6–12 months) — Intelligence
- **RAG retrieval** (embeddings + vector store) behind the existing retriever interface.
- **LLM reasoner** per agent (grounded + cited + confidence), gated by eval harness.
- **Predictive forecasting**: revenue, churn, capacity, cash/runway.
- **Scenario simulation** ("what if we lose customer X / hire N engineers?").
- **Closed-loop learning** from approve/decline outcomes.

### Future (12+ months) — Ecosystem
- **Agent marketplace** + industry packs (healthcare Claims Agent, insurance, logistics…).
- **Mobile executive briefing**.
- **Advanced multi-tenant admin**, SSO/SCIM, fine-grained data residency.
- **On-prem / private-model** deployment for regulated tenants.

---

## Thematic Bets

| Theme | Outcome |
|---|---|
| Trust | Higher recommendation-acceptance via calibration + evidence UX. |
| Automation with control | More workflows, always human-gated. |
| Intelligence | From heuristics → grounded LLM + forecasting. |
| Reach | More integrations, verticals, and deployment models. |

## Guardrails (non-negotiable across all horizons)
- No autonomous consequential actions — ever.
- Explainability + confidence on every insight.
- Immutable audit for every decision.
- Least-privilege, tenant-scoped data.

## Success Signals
- Recommendation acceptance rate ↑, decline reasons ↓ trending to noise.
- Risk lead-time (surfaced-before-impact) ↑.
- Time-to-value ↓ (< 10 min first insight).
- Enterprise adoption in ≥ 3 regulated verticals.
