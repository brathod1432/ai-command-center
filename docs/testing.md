# Test Strategy — Helm

> **Phase 17 — Test Strategy.** How Helm is verified: the test pyramid, categories, tooling, coverage targets, and CI gates.

**Document status:** Phase 17 · **Last updated:** 2026-08-11

---

## 1. Testing Philosophy

- **Test behavior, not implementation.** Query by role/label (RTL) like a user.
- **Pyramid shape:** many fast unit tests, focused integration tests, few high-value e2e journeys.
- **Governance & security are tested as invariants**, not afterthoughts.
- **Accessibility is automated** in CI, not manual-only.
- **Every bug fix ships with a regression test.**

```
        ▲  E2E (Playwright) — critical journeys, a11y smoke
       ███  Integration (Jest+RTL) — pages, API routes, workflows
      █████  Unit (Jest) — agents, rbac, governance, utils, schemas
```

---

## 2. Tooling

| Layer | Tool |
|---|---|
| Unit / component | **Jest** + **React Testing Library** |
| DOM environment | jsdom |
| Accessibility | **jest-axe** (component) + **@axe-core/playwright** (e2e) |
| E2E | **Playwright** (chromium/firefox/webkit) |
| Mocking data | in-repo mock datastore + fixtures |
| Coverage | Jest coverage (V8/istanbul) |

---

## 3. Test Categories

### 3.1 Unit tests
- **Agents:** each agent's `analyze`/`recommend` against golden fixtures → expected insights, severity, confidence, evidence present.
- **RBAC:** capability matrix — role × permission positive/negative.
- **Governance:** state machine transitions; invariant that consequential actions can't be `approved` without an approval record.
- **Schemas:** Zod validation accepts valid / rejects invalid payloads.
- **Utils / formatters:** numbers, dates, deltas.

### 3.2 Integration tests
- **Pages:** render dashboard/agents/etc. with mock data; assert key content, states (loading/empty/error).
- **API route handlers:** authz + Zod validation + correct responses.
- **Workflows:** run a workflow definition end to end over the engine; assert steps, approvals, and audit writes.
- **Forms:** submit valid/invalid; assert validation + submission behavior.

### 3.3 Accessibility tests
- `jest-axe` on key components (KPI card, insight card, tables, forms, dialogs) — zero violations.
- Playwright + axe on core pages — zero serious/critical violations.
- Keyboard-only navigation checks (focus order, escape/close, skip link).

### 3.4 Permission / security tests
- Unauthorized role cannot access protected page/API (403).
- Non-approver cannot approve an action.
- Tenant isolation: user of tenant A cannot read tenant B data.
- Security headers present on responses.
- Input validation rejects malformed/oversized input.

### 3.5 Workflow tests
- Escalation on approval timeout.
- Correct approver routing by domain/tier.
- Audit record written on each decision.

### 3.6 Navigation tests
- All primary routes reachable; nav highlights active route; protected routes redirect unauthenticated users to `/login`; `/showcase` public.

### 3.7 Dashboard tests
- KPIs render with correct formatting/deltas; charts render (or table fallback); action queue ordered by severity × confidence.

### 3.8 Form tests
- Field-level errors, required handling, disabled-while-submitting, success/error feedback.

---

## 4. E2E Journeys (Playwright)

1. **Login → Dashboard** — authenticate, land on Executive Command Center, see narrative + KPIs + action queue.
2. **Review & approve an action** — open a pending approval, view evidence, approve, confirm audit entry appears in `/audit`.
3. **Agent workspace** — open an agent, view insights + confidence + pending approvals.
4. **Workflow run** — trigger a workflow, observe steps + required approval.
5. **Showcase** — switch industries and see adapted content.
6. **A11y smoke** — axe scan on dashboard, agents, audit.

---

## 5. Coverage Targets

| Scope | Target |
|---|---|
| Domain logic (`lib/agents`,`rbac`,`governance`,`workflows`) | ≥ 90% lines/branches |
| Overall project | ≥ 80% |
| Critical invariants (governance/AI-safety) | 100% of documented invariants have a test |

Coverage is reported in CI; PRs that drop below thresholds fail.

---

## 6. Test Data & Fixtures

- Deterministic seed fixtures in `lib/data` (tenants, users, deals, tickets, PRs, invoices, docs).
- Golden insight fixtures for agent regression.
- No network calls in unit/integration tests (mock providers only).

---

## 7. CI Gates

Pipeline (see `deployment.md`): `install → typecheck → lint → unit+integration (coverage) → build → e2e (Playwright) → a11y`. Any failure blocks merge. `npm audit` runs for dependency hygiene.

---

## 8. Local Commands (reference)

```
npm run test           # jest unit + integration
npm run test:watch     # watch mode
npm run test:coverage  # coverage report
npm run test:e2e       # playwright
npm run lint           # eslint
npm run typecheck      # tsc --noEmit
```

---

## 9. Conventions

- Co-locate component tests as `*.test.tsx`; domain tests under `tests/unit`; e2e under `tests/e2e`.
- Name tests by behavior ("declines refund without approver role").
- Prefer accessible queries (`getByRole`, `getByLabelText`) over test IDs.
- Keep tests deterministic (fixed clock/seed where time matters).
