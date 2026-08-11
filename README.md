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
# open http://localhost:3000  →  landing page
# open http://localhost:3000/dashboard  →  Executive Command Center
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

## Status

This is a **reference implementation / foundation**. It ships:
- A working landing page and Executive Command Center backed by deterministic mock data.
- The core domain layer (RBAC, governance invariants, agent registry, typed contracts).
- Security headers, a health endpoint, and a passing test suite (unit + component + a11y + e2e smoke).

Additional domain pages (agents workspaces, workflows, integrations UI, audit, etc.) are fully **specified in `docs/`** and are the roadmap's next increments (see [`docs/future-roadmap.md`](docs/future-roadmap.md)).

---

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © 2026 brathod1432

## Contact

Questions or feedback: **bgrathod00@gmail.com**
