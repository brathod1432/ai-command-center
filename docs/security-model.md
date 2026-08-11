# Security Model — Helm

> **Phase 12 — Security Model.** Security is a first-class concern in Helm. This document defines RBAC, authentication/session architecture, protected routing, input/output handling, headers, rate limiting, and error strategy.

**Document status:** Phase 12 · **Last updated:** 2026-08-11

---

## 1. Threat Model (summary)

| Asset | Threats | Primary controls |
|---|---|---|
| Business data across integrations | Unauthorized access, leakage | RBAC, tenant isolation, least-privilege scopes, audit |
| Approvals / actions | Privilege escalation, unauthorized approval | Role checks on every gate, separation of duties, audit |
| Sessions | Hijacking, fixation, CSRF | HttpOnly cookies, SameSite, short-lived sessions, CSRF protection |
| App surface | XSS, injection | Input validation (Zod), output encoding, CSP, no raw HTML injection |
| APIs | Abuse, brute force | Rate limiting, authn/authz, validation |
| Audit trail | Tampering | Append-only, immutable records |

---

## 2. Role-Based Access Control (RBAC)

### Roles
| Role | Description |
|---|---|
| `owner` | Full access incl. billing + tenant admin |
| `admin` | Manage users, roles, integrations, settings |
| `executive` | Full read of dashboards + approve cross-functional/high-tier actions |
| `manager` | Domain lead; approve domain actions (eng/sales/CS/etc.) |
| `analyst` | Read + generate insights/reports; no approvals |
| `viewer` | Read-only dashboards |
| `auditor` | Read-only access to audit log + governance history |

### Permission model
Permissions are `resource:action` strings evaluated against the user's role(s):

```
dashboard:read, agent:read, agent:run, insight:read,
action:propose, action:approve, action:decline,
integration:read, integration:manage,
user:read, user:manage, role:manage,
audit:read, settings:manage, knowledge:read, knowledge:publish
```

A **capability matrix** maps roles → permissions (implemented in `lib/rbac`). Checks happen in three places (defense in depth):
1. **Middleware / route** — coarse gate (is the user allowed on this page/API?).
2. **Server/domain** — fine gate (can this role perform this specific action on this tenant's data?).
3. **UI** — affordance gate (hide/disable controls the user can't use — never the *only* check).

### Tenant scoping
Every check is `(role, permission, tenantId)`. Cross-tenant access is denied by default; data queries are always tenant-scoped.

---

## 3. Authentication & Session Architecture

- **Auth:** email/password for the reference build (mock user store), designed to swap for SSO/OIDC (SAML/OAuth) without app changes. Passwords (if real) hashed with a strong adaptive algorithm; never logged.
- **Sessions:** signed, **HttpOnly**, **Secure**, **SameSite=Lax/Strict** cookies. Short-lived access with refresh; idle + absolute timeouts. No session state in `localStorage`.
- **CSRF:** state-changing requests protected via same-site cookies + CSRF token/double-submit for non-idempotent routes.
- **MFA-ready:** session model supports a second factor step (future).
- **Logout & revocation:** server-side session invalidation; all auth events audited.

---

## 4. Protected Routes

- **Middleware** (`src/middleware.ts`) checks session on all `(app)` routes; unauthenticated users are redirected to `/login`. `/showcase` and `/login` are public.
- **Per-page RBAC:** each protected page verifies the required permission; unauthorized users get a 403 view, not a redirect loop.
- **API route handlers** independently authenticate + authorize (never trust the client).

---

## 5. Input Validation & Output Encoding

- **Input validation:** all external input (forms, API bodies, query params) validated with **Zod** at the boundary; reject on failure with structured errors.
- **Output encoding:** React escapes by default; **no `dangerouslySetInnerHTML`** on untrusted/agent/user content. Markdown is sanitized before render.
- **Injection defense:** parameterized/ORM queries in real deployments; the mock datastore is in-memory (no query injection surface). No string-built queries.
- **File/URL safety:** validate and allow-list any outbound URLs; never render user-supplied URLs as executable content.

---

## 6. Security Headers

Set via Next.js config / middleware (baseline):

| Header | Value (baseline) |
|---|---|
| `Content-Security-Policy` | `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'` (tighten `style-src` as feasible) |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | disable camera/mic/geolocation by default |
| `X-DNS-Prefetch-Control` | `off` |

CSP is designed to avoid `unsafe-eval`; nonce/hash strategy for any required inline scripts.

---

## 7. Rate Limiting Strategy

- **Auth endpoints:** strict per-IP + per-account limits with exponential backoff/lockout to resist brute force.
- **API endpoints:** per-user/per-tenant token-bucket limits; 429 with `Retry-After`.
- **Integration calls:** per-provider budgets + backoff (also protects upstream quotas).
- Reference build ships a pluggable limiter interface (in-memory) that swaps for a distributed store (e.g., Redis) in production.

---

## 8. Error Handling Strategy

- **Fail closed** on authz decisions.
- **No sensitive data in errors** shown to users or logs (no secrets, stack traces, or PII in client responses).
- **Structured errors** with correlation IDs; details logged server-side (see `observability.md`), safe summaries returned to the client.
- **Error boundaries** per route; graceful degradation when an integration/agent fails (partial dashboards over hard failures).

---

## 9. Secure Configuration & Secrets

- Secrets via environment variables / secret manager — **never** committed. No secrets in client bundles.
- Distinct configs per environment; least-privilege integration scopes (read-first).
- Dependency hygiene: `npm audit` in CI, pinned versions, prefer releases ≥ 7 days old, no floating ranges (per project rule).
- Never modify security policies to bypass CI — escalate instead.

---

## 10. Data Protection

- **In transit:** TLS everywhere. **At rest:** encryption for datastore + backups (production).
- **Tenant isolation:** row-level scoping (multi-tenant) or full isolation (single-tenant/hybrid).
- **PII minimization & redaction** in logs and knowledge ingestion.
- **Right to erasure / retention** honored per tenant compliance regime.

---

## 11. Compliance Alignment

Designed to support SOC 2 / ISO 27001 controls and, for regulated verticals, HIPAA/PCI-style requirements via: RBAC, audit trail, encryption, access reviews, and configurable retention. Governance + audit (see `governance.md`) provide the evidentiary backbone.

---

## 12. Security Testing (see `testing.md`)

- Permission/authorization tests (positive + negative).
- Session/auth flow tests.
- Input-validation / rejection tests.
- Header presence checks.
- Basic abuse/rate-limit tests.
- Static checks: lint rule banning raw HTML injection; dependency audit in CI.
