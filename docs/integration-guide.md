# Integration Guide — Helm

> **Phase 11 — Integration Framework.** How Helm connects to external systems via a common adapter interface. The reference build ships **mock providers only**; real providers implement the same interface.

**Document status:** Phase 11 · **Last updated:** 2026-08-11

---

## 1. Philosophy

- **One interface, many providers.** Agents and pages depend on normalized domain entities, never on a vendor's raw API.
- **Mock-first.** Every integration has a deterministic mock provider so the app is fully functional and testable offline.
- **Read-first, least-privilege.** Adapters default to read scopes; any mutating method requires an `approvalId` (governance).
- **Graceful degradation.** A failing provider degrades one panel, not the whole dashboard.

---

## 2. Provider Interface

```ts
interface IntegrationProvider<TEntity = unknown> {
  id: string;                         // 'github' | 'jira' | ...
  category: IntegrationCategory;      // 'source' | 'issues' | 'crm' | ...
  capabilities: Capability[];         // ['read:pull_requests', ...]
  connect(config: ProviderConfig): Promise<ConnectionResult>;
  healthCheck(): Promise<HealthStatus>;
  listEntities(type: string, opts: ListOpts): Promise<Normalized<TEntity>[]>;
  // mutating methods require an approvalId (governance-gated):
  performAction?(action: MutatingAction & { approvalId: string }): Promise<ActionResult>;
}
```

Normalization maps each vendor's payload → Helm domain types (Zod-validated), so `Deal`, `Ticket`, `PullRequest`, `Invoice`, `KnowledgeDoc` look identical regardless of source.

---

## 3. Supported Integrations (adapters)

| Category | Providers | Feeds agent(s) |
|---|---|---|
| Source control | **GitHub**, **Azure DevOps** | Engineering |
| Issue/project | **Jira**, **Azure DevOps** | Engineering, Operations, Product |
| Docs/knowledge | **Confluence**, **Google Workspace**, **Microsoft 365** | Knowledge |
| Chat/comms | **Slack**, **Microsoft Teams** | Ops, CEO (delivery of digests — draft only) |
| CRM | **HubSpot**, **Salesforce** | Sales, Customer Success, Marketing |
| Support | **Zendesk**, **Freshdesk** | Support, Customer Success |
| Accounting/billing | **QuickBooks**, **Xero**, **Stripe** | Finance |
| Analytics | **Google Analytics**, **Microsoft Clarity** | Marketing, Product |

All ship as **mock providers** in the reference build (deterministic fixtures).

---

## 4. Mock Providers

- Live in `lib/integrations/providers/*` implementing `IntegrationProvider`.
- Return seeded, deterministic data (same input → same output) for reproducible demos + tests.
- Simulate realistic states: healthy, degraded, rate-limited, disconnected — so the UI's degraded/empty/error states are exercisable.
- No network calls; safe for CI and offline dev.

---

## 5. Adding a Real Provider

1. Implement `IntegrationProvider` for the vendor (OAuth/token config in `connect`).
2. Map vendor payloads → Helm domain types; validate with the existing Zod schemas.
3. Add rate-limit/backoff + `healthCheck`.
4. Register in `lib/integrations/registry`.
5. Keep mutating methods `approvalId`-gated (governance).
6. Add contract tests mirroring the mock provider's test suite.

No agent or page code changes — they consume the same normalized entities.

---

## 6. Security & Governance

- **Scopes:** request the minimum; read-first. Document scopes per provider.
- **Secrets:** tokens via secret manager/env, never committed, never in client bundle (see `security-model.md`).
- **Mutations:** any write to an external system requires a governance `approvalId`; agents cannot call mutating methods (see `ai-safety.md`).
- **Audit:** connect/disconnect, scope changes, and any mutating action are audited.
- **Rate limits:** per-provider budgets + backoff; `integration_calls_total` metric (see `observability.md`).

---

## 7. Health & Observability

- `/integrations` page shows live status per provider (from `healthCheck()`), last sync, and capabilities.
- Metrics: `integration_calls_total{provider,status}`, latency histograms.
- Degraded providers surface a banner; affected panels show partial/empty states.

---

## 8. Testing Integrations

- Mock providers back all unit/integration tests (deterministic).
- Contract tests assert each provider returns schema-valid normalized entities.
- Failure-mode tests: degraded/rate-limited/disconnected render correctly.
