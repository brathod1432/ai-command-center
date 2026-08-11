# Architecture — Helm

> **Phase 3 — Architecture Design.** Enterprise-ready architecture for the Helm AI Business Operations Platform.

**Document status:** Phase 3 · **Last updated:** 2026-08-11

---

## 1. Architectural Goals & Principles

- **Governed by design** — every consequential action flows through a human approval + audit path.
- **Explainable** — insights carry evidence + confidence; no unexplained outputs.
- **Modular** — clean seams between UI, domain logic, agents, and integrations (adapter pattern).
- **Deployment-flexible** — single-tenant, multi-tenant, cloud, and hybrid from one codebase.
- **Secure & observable** — RBAC, audit, metrics, logging, tracing are first-class (see `security-model.md`, `observability.md`).
- **Accessible & performant** — WCAG 2.1 AA; Lighthouse targets in `final-audit.md`.
- **Testable** — unit → integration → e2e, plus a11y and permission tests (`testing.md`).

---

## 2. Technology Stack

| Concern | Choice | Rationale |
|---|---|---|
| Framework | **Next.js (App Router)** + React | SSR/streaming, routing, server components, edge/runtime flexibility. |
| Language | **TypeScript** (strict) | Type safety across UI, domain, and contracts. |
| Styling | **Tailwind CSS** | Utility-first, consistent design tokens. |
| Components | **ShadCN UI** (Radix + CVA) | Owned, accessible, adaptable (see `design-research.md`). |
| Client state | **Zustand** | Minimal, ergonomic global state (UI, session, filters). |
| Server/data state | **TanStack Query** | Caching, background refresh, request dedup for mock/real APIs. |
| Validation | **Zod** + **React Hook Form** | Schema-first validation shared client/server. |
| Charts | **Recharts** | Free, composable, SSR-friendly. |
| Unit/component tests | **Jest** + **React Testing Library** | Standard, fast, accessible-query friendly. |
| E2E | **Playwright** | Cross-browser, robust, CI-friendly. |
| Accessibility tests | **axe-core** (`jest-axe` + Playwright axe) | Automated WCAG checks. |
| Icons | **lucide-react** | Lightweight SVG icons. |

---

## 3. System Context (C4 — Level 1)

```
                       ┌───────────────────────────────────────────┐
   Business Leaders    │                  HELM                      │
  (Founder/CEO/COO/…) ─┤   AI Business Operations Platform          │
                       │  (Command Center · Agents · Workflows)     │
                       └───────┬───────────────────────┬───────────┘
                               │                       │
                    Integration Adapters      Governance & Audit
                    (mock → real)                    │
        ┌───────────┬───────────┬───────────┐        │
      GitHub      Jira        CRM         Billing   Audit Log / RBAC / Approvals
      Slack     Confluence  Zendesk      Stripe
```

Helm reads from systems of record via **adapters**, synthesizes **insights** through **agents**, proposes **actions**, and routes consequential actions through **governance** — logging everything to the **audit trail**.

---

## 4. Container View (C4 — Level 2)

```
┌──────────────────────────── Next.js App ─────────────────────────────┐
│  Presentation (App Router)                                            │
│   • Route groups: (auth), (app)                                       │
│   • Pages: dashboard, executive, agents, ops, projects, eng, sales,   │
│     marketing, support, customers, finance, reports, workflows,       │
│     knowledge, integrations, audit, settings, showcase                │
│                                                                       │
│  UI Layer:  ShadCN components · charts · app shell · a11y             │
│  State:     Zustand (session/ui) · TanStack Query (data)              │
│  Contracts: Zod schemas (shared types)                                │
├───────────────────────────────────────────────────────────────────── │
│  Application / Domain (lib/)                                          │
│   • agents/        agent definitions + insight generators             │
│   • workflows/     workflow engine + definitions                      │
│   • governance/    approvals, policy, escalation                      │
│   • integrations/  adapter interfaces + mock providers                │
│   • auth/rbac/     roles, permissions, guards                         │
│   • data/          mock datastore + seed fixtures                     │
│   • observability/ logger, metrics, trace helpers                     │
│                                                                       │
│  API (Route Handlers under app/api/*)                                 │
│   • REST-ish endpoints backed by mock datastore                       │
│   • Zod-validated inputs/outputs, RBAC-checked                        │
├───────────────────────────────────────────────────────────────────── │
│  Middleware:  auth/session, security headers, rate-limit hook         │
└───────────────────────────────────────────────────────────────────────┘
```

The domain layer is **framework-agnostic** (plain TS) so it can be reused server-side, in route handlers, and in tests. In production, mock providers are swapped for real integrations behind the same interfaces, and the mock datastore is replaced by a database + service layer.

---

## 5. Directory Structure (reference)

```
ai-business-operations-platform/
├─ docs/                      # all phase documentation
├─ src/
│  ├─ app/
│  │  ├─ (auth)/login/
│  │  ├─ (app)/dashboard|executive|agents|operations|projects|
│  │  │        engineering|sales|marketing|support|customers|
│  │  │        finance|reports|workflows|knowledge|integrations|
│  │  │        audit|settings/
│  │  ├─ showcase/
│  │  ├─ api/                 # route handlers (mock-backed)
│  │  ├─ layout.tsx
│  │  └─ globals.css
│  ├─ components/
│  │  ├─ ui/                  # ShadCN primitives (owned)
│  │  ├─ charts/              # Recharts wrappers
│  │  ├─ shell/               # sidebar, topbar, nav
│  │  └─ patterns/            # KPI card, action queue, insight card…
│  ├─ lib/
│  │  ├─ agents/  workflows/  governance/  integrations/
│  │  ├─ auth/    rbac/       data/        observability/
│  │  ├─ types/               # zod schemas + TS types
│  │  └─ utils.ts
│  ├─ store/                  # zustand stores
│  ├─ hooks/                  # TanStack Query hooks
│  └─ middleware.ts
├─ tests/                     # jest + playwright
├─ public/
└─ config files (next, tailwind, tsconfig, jest, playwright, eslint)
```

---

## 6. Data Flow

1. **Read** — Adapters (mock) pull normalized entities (deals, tickets, PRs, invoices…).
2. **Normalize** — Zod schemas validate and shape data into domain types.
3. **Analyze** — Agents run insight generators over normalized data → `Insight[]` (evidence + severity + confidence).
4. **Recommend** — Insights produce `Action[]`; consequential actions flagged for approval.
5. **Present** — UI renders narrative + KPIs + action queue via TanStack Query hooks.
6. **Decide** — Human approves/declines; governance records decision.
7. **Audit** — Every decision and agent output is logged immutably.

---

## 7. State Management Strategy

- **Zustand** — session/user, RBAC context, UI (sidebar, theme, active tenant, filters). Small, synchronous, no server truth.
- **TanStack Query** — all server-derived data (agents' insights, KPIs, tables). Provides caching, `staleTime`, background refetch, and error/loading states that map to UI states.
- **Zod** — single source of truth for shapes; inferred TS types shared across UI, API, and tests. Forms via React Hook Form + `zodResolver`.

---

## 8. Multi-Tenancy & Deployment Models

| Model | Description | Isolation approach |
|---|---|---|
| **Single-tenant** | One org per deployment/instance. | Full data + infra isolation; simplest compliance story. |
| **Multi-tenant** | Many orgs on shared infra. | `tenantId` on every record; row-level scoping; per-tenant RBAC; audit partitioned by tenant. |
| **Hybrid** | Shared control plane, isolated data plane (e.g., customer VPC/DB). | Control plane multi-tenant; data plane single-tenant per customer. |

**Design implications:** every domain entity and audit record carries `tenantId`; all queries are tenant-scoped at the data layer; the mock datastore already threads `tenantId` so real DB row-level security can be enabled without app changes. Deployment targets: any Node host / container / serverless platform; static assets via CDN; horizontally scalable stateless app tier.

---

## 9. Integration Architecture (summary)

Adapters implement a common `IntegrationProvider` interface (connect, listEntities, healthCheck, capabilities). **Mock providers** back the reference build; real providers (GitHub, Jira, Slack, Salesforce, Stripe, …) implement the same interface with OAuth + rate-limit/backoff. See `integration-guide.md` and Phase 11.

---

## 10. Cross-Cutting Concerns

| Concern | Where handled | Doc |
|---|---|---|
| Security / RBAC / headers | middleware + `lib/rbac` + route guards | `security-model.md` |
| Governance / approvals | `lib/governance` + audit | `governance.md` |
| AI safety | agent action policy | `ai-safety.md` |
| Observability | `lib/observability` + API instrumentation | `observability.md` |
| Design system | `components/ui` + tokens | `design-system.md` |
| Knowledge/RAG readiness | `lib/knowledge` (future) | `knowledge-architecture.md` |

---

## 11. Non-Functional Requirements

- **Performance:** code-splitting, RSC where possible, lazy charts, Query caching. Lighthouse Perf ≥ 90.
- **Accessibility:** WCAG 2.1 AA; keyboard-first; axe in CI. A11y ≥ 95.
- **Reliability:** graceful degradation when an integration is down; error boundaries per route.
- **Scalability:** stateless app tier; tenant-scoped data; cache + pagination for large datasets.
- **Maintainability:** strict TS, domain isolation, documented contracts, ≥ target coverage.

---

## 12. Architecture Decision Records (ADR summary)

| ADR | Decision | Status |
|---|---|---|
| ADR-001 | Next.js App Router + RSC as the app framework | Accepted |
| ADR-002 | ShadCN/Radix owned components over a heavy UI kit | Accepted |
| ADR-003 | Zustand (client) + TanStack Query (server state) split | Accepted |
| ADR-004 | Zod as shared contract layer | Accepted |
| ADR-005 | Adapter pattern with mock providers first | Accepted |
| ADR-006 | Human-in-the-loop governance as a hard invariant | Accepted |
| ADR-007 | `tenantId` on all entities for tenancy-agnostic data layer | Accepted |
