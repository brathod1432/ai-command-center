# Helm — AI Business Operations Platform

> An **Enterprise AI Operations Center**, not another AI chat app.

Helm is an AI Business Operations Platform: a single command center that unifies the tools a company runs on (email, Jira, GitHub, CRM, accounting, support, calendar, chat) into one **explainable, governed** operational picture. It tells business leaders *what happened, why it happened, what the risks and opportunities are, and what to do next* — with a **human always in control**.

Helm does not replace people. It assists them. **AI recommends; humans decide.** Every consequential action flows through a human approval gate and an immutable audit trail.

---

## Highlights

- **Executive Command Center** — company health, KPIs, agent insights, and a prioritized action queue in one view.
- **Multi-agent insights** — ten specialized agents (Sales, Engineering, Finance, Support, Customer Success, and more). Every insight is **cited** and carries a **confidence score**.
- **Human-in-the-loop governance** — consequential actions require role-appropriate approval and produce an immutable audit record.
- **Security first** — RBAC, security headers, tenant scoping, input validation with Zod.
- **Accessible & performant** — WCAG 2.1 AA targets, keyboard-first, automated axe checks.
- **Deployment-flexible** — single-tenant, multi-tenant, cloud, and hybrid from one codebase.
- **Integration-ready** — an adapter interface with deterministic **mock providers** for offline dev and tests.

---

## Screenshots

> All screenshots are generated from the running app (see `tests/e2e/screenshots.spec.ts`). Light & dark themes, desktop & mobile, and multiple user roles are shown.

### Landing & overview

![Landing page](docs/screenshots/01-landing.png)

### Executive Command Center

The centerpiece: company health, KPIs, an 8-week trend chart, cited agent insights, and the governance approval queue.

| Light | Dark |
|---|---|
| ![Dashboard (light)](docs/screenshots/10-dashboard.png) | ![Dashboard (dark)](docs/screenshots/11-dashboard-dark.png) |

### Daily workflow (operator's view)

| My Work inbox | Agent workspace |
|---|---|
| ![My Work](docs/screenshots/12-my-work.png) | ![Agent workspace](docs/screenshots/14-agent-workspace.png) |

| Follow-through (assign / due date / complete) | Command palette (⌘K) |
|---|---|
| ![Follow-through](docs/screenshots/26-manager-followthrough.png) | ![Command palette](docs/screenshots/24-command-palette.png) |

### Governance & compliance

| Audit trail (tamper-evident, exportable) | Operational status |
|---|---|
| ![Audit trail](docs/screenshots/20-audit.png) | ![Status](docs/screenshots/21-status.png) |

| Team & permissions (access reviews) | Reports (board-ready, exportable) |
|---|---|
| ![Team](docs/screenshots/22-team.png) | ![Reports](docs/screenshots/19-reports.png) |

### Platform surfaces

| Agents | Finance (with trend chart) |
|---|---|
| ![Agents](docs/screenshots/13-agents.png) | ![Finance](docs/screenshots/15-finance.png) |

| Workflows | Integrations (mock providers) |
|---|---|
| ![Workflows](docs/screenshots/16-workflows.png) | ![Integrations](docs/screenshots/17-integrations.png) |

| Knowledge (search) | Settings (role permissions) |
|---|---|
| ![Knowledge](docs/screenshots/18-knowledge.png) | ![Settings](docs/screenshots/23-settings.png) |

### Role-based access (RBAC)

A **viewer** sees read-only dashboards; approvals are disabled and the audit trail is denied — enforced on the server, not just hidden in the UI.

| Viewer dashboard | Viewer denied audit access |
|---|---|
| ![Viewer dashboard](docs/screenshots/30-viewer-dashboard.png) | ![Viewer forbidden](docs/screenshots/31-viewer-audit-forbidden.png) |

### Mobile

| Mobile dashboard | Mobile navigation |
|---|---|
| ![Mobile dashboard](docs/screenshots/40-mobile-dashboard.png) | ![Mobile nav](docs/screenshots/41-mobile-nav.png) |

### Public marketing

| Sign in (role selection) | Showcase (industry switcher) |
|---|---|
| ![Login](docs/screenshots/02-login.png) | ![Showcase](docs/screenshots/03-showcase.png) |

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + ShadCN-style owned components (Radix) |
| Client state | Zustand |
| Server state | TanStack Query |
| Validation | Zod + React Hook Form |
| Charts | Recharts (+ lightweight inline sparklines) |
| Testing | Jest + React Testing Library, Playwright (e2e), axe (a11y) |

See [`docs/architecture.md`](docs/architecture.md) for the full design.

---

## Quickstart

**Prerequisites:** Node.js `>=18.18` and npm.

```bash
# 1. Install dependencies
npm install

# 2. (optional) create a local env file
cp .env.example .env.local

# 3. Start the dev server
npm run dev
# open http://localhost:3000              →  landing page
# open http://localhost:3000/login        →  demo sign-in (choose a role)
# after sign-in you land on /dashboard    →  Executive Command Center
```

**Demo sign-in:** the login page lets you pick a **role** (owner, admin, executive, manager, analyst, viewer, auditor) so you can see RBAC and the governance/approval flow behave differently. Try approving an action as an `executive`, then view it in **Audit Trail**; sign in as a `viewer` to see approvals disabled and audit access denied.

**Production start** fails closed without a session secret (a deliberate security control):

```bash
# SESSION_SECRET is REQUIRED for `next start` (production)
SESSION_SECRET="<a-long-random-value>" npm run build && SESSION_SECRET="<same-value>" npm run start
```

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | ESLint (next lint) |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Jest unit/component tests |
| `npm run test:coverage` | Tests with coverage |
| `npm run test:e2e` | Playwright end-to-end tests |

---

## Project Structure

```
docs/                      # Architecture, security, governance, agents, and more
src/
  app/                     # App Router pages + API route handlers
    page.tsx               #   landing / overview
    dashboard/             #   Executive Command Center
    api/health/            #   health probe
  components/
    ui/                    # owned ShadCN-style primitives (button, card, badge)
    patterns/              # KPI card, insight card, action queue, sparkline
  lib/
    agents/                # agent registry
    data/                  # deterministic mock data
    governance/            # approval state machine + invariants
    rbac/                  # role → permission matrix
    types/                 # Zod schemas (shared contracts)
    utils.ts               # formatters + helpers
tests/
  unit/                    # Jest unit + component tests
  e2e/                     # Playwright smoke + a11y journeys
```

---

## Documentation

Comprehensive design documentation lives in [`docs/`](docs/):

| Doc | Topic |
|---|---|
| [discovery.md](docs/discovery.md) | Product vision, market, personas, KPIs, roadmap |
| [design-research.md](docs/design-research.md) | UI ecosystem evaluation (license/security review) |
| [architecture.md](docs/architecture.md) | Enterprise architecture & tech decisions |
| [agent-architecture.md](docs/agent-architecture.md) | The ten-agent operating model |
| [governance.md](docs/governance.md) | Human approval workflows & audit |
| [security-model.md](docs/security-model.md) | RBAC, sessions, headers, validation |
| [observability.md](docs/observability.md) | Metrics, logging, tracing, health |
| [ai-safety.md](docs/ai-safety.md) | What AI may / may not do |
| [knowledge-architecture.md](docs/knowledge-architecture.md) | Knowledge platform (RAG-ready) |
| [integration-guide.md](docs/integration-guide.md) | Adapter framework & mock providers |
| [design-system.md](docs/design-system.md) | Colors, type, components, states |
| [testing.md](docs/testing.md) | Test strategy & coverage |
| [ai-readiness.md](docs/ai-readiness.md) | Path to LLM/RAG upgrades |
| [future-roadmap.md](docs/future-roadmap.md) | Where Helm goes next |

---

## Governance & AI Safety (the core invariant)

Helm's AI may **recommend, analyze, summarize, explain, predict, and draft**. It may **never** autonomously delete data, send customer communications, execute financial actions, deploy code, or change access. The only path from a proposal to an approved action is a human decision — always recorded in the audit trail. See [`docs/ai-safety.md`](docs/ai-safety.md) and [`docs/governance.md`](docs/governance.md).

---

## What's included

A genuinely usable, governed command center:

- **Authentication + RBAC** — demo sign-in with role selection; signed HttpOnly session; `middleware` route protection; server-enforced authorization (defense in depth).
- **Executive Command Center** — company health, KPIs, agent insights, and a governance queue.
- **10 agent workspaces** — `/agents` and `/agents/[id]` with mission, insights, and pending approvals.
- **My Work inbox** — a personal starting point: approvals waiting on you, actions assigned to you, and what you've completed.
- **Real governance flow** — approve/decline consequential actions via a Zod-validated, RBAC-checked, CSRF-protected, rate-limited API that writes an **immutable, hash-chained audit record**; view it in **Audit Trail** (integrity-verified badge) and export **CSV/JSON**.
- **Action follow-through** — after approval, **assign an owner + due date, comment, and mark complete** — turning a recommendation into tracked work.
- **Activity feed** — a topbar notification bell showing recent decisions/events.
- **Status page** — integration health, audit-chain integrity, and system health at a glance.
- **Filtering & charts** — filter insights by severity/domain; real Recharts trend charts on the dashboard and function pages.
- **Function pages** — Sales, Engineering, Finance, Support, Customer Success, Marketing, Operations, Product.
- **Team & permissions** (admin) — member roster + role→permission matrix for access reviews.
- **Workflows, Integrations (mock providers), Knowledge (search), Reports (export), Settings, Showcase (industry switcher).**
- **App shell** — sidebar navigation, command palette (⌘K, searches nav/agents/insights/actions/docs), dark mode, responsive/mobile, toasts, empty/loading/error states.
- **Durable data** — best-effort file persistence so decisions/comments/audit survive restarts.
- **Security** — auth + **sliding session** (idle timeout + absolute cap), middleware + **server-side page-level RBAC**, **CSRF double-submit token + same-origin**, CSP + hardened headers (COOP/CORP), `no-store` on authed APIs, rate-limit headers, **tamper-evident audit**, fail-closed session secret, structured logging, health endpoint.

See [`docs/improvements.md`](docs/improvements.md), [`docs/improvements-v2.md`](docs/improvements-v2.md), and [`docs/improvements-v3.md`](docs/improvements-v3.md) for the full user/client/security analysis and what's next (CSP nonce, SSO/MFA, scheduled digests).

---

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © 2026 brathod1432

## Contact

Questions or feedback: **bgrathod00@gmail.com**
