# Improvements Analysis v4 — Helm (User, Client & Security)

> Cycle-4 review. Prior cycles delivered auth, RBAC, hash-chained audit, the action lifecycle, activity feed, charts, team view, My Work, Status, CSRF, sliding sessions, and persistence. This cycle closes the top remaining **security** gap (CSP nonce) and adds practical **first-run** value.

**Date:** 2026-08-11 · Status keys: **[Implemented now]**, **[Roadmap]**.

---

## 1. What stood out this cycle

1. **CSP still allowed inline scripts.** The Content-Security-Policy used `'unsafe-inline'` for `script-src` — the single biggest remaining XSS-surface weakness. It was deferred earlier because getting nonce wiring wrong white-screens the app. Now that the repo has a real browser in CI-style tooling, it can be implemented **and verified**.
2. **No responsible-disclosure discoverability.** `SECURITY.md` exists, but there was no machine-discoverable `/.well-known/security.txt`.
3. **Denied authorization wasn't recorded.** A blocked approval (e.g., a viewer trying to approve) returned 403 but left **no audit trail** — a missed security-monitoring signal.
4. **Cold-start users faced a blank slate.** No guided first-run to reach value quickly.

---

## 2. Security Hardening (this cycle)

| # | Control | What & why | Status |
|---|---|---|---|
| S1 | **CSP nonce + `strict-dynamic`** | Production CSP drops `'unsafe-inline'` for scripts; a per-request nonce (from middleware) authorizes only Next's own scripts. Verified in-browser (hydration + interactivity intact). | [Implemented now] |
| S2 | **`/.well-known/security.txt`** | Machine-discoverable responsible-disclosure contact + policy (RFC 9116). | [Implemented now] |
| S3 | **Audit denied authorization** | Forbidden approvals/updates now write a `permission / denied` audit record (actor, role, tenant) — a defensive monitoring signal. | [Implemented now] |
| S4 | Server-side session revocation ("sign out everywhere"), real SSO/OIDC + MFA | Needs a session store/IdP. | [Roadmap] |

---

## 3. User-Experience Improvements

| # | Improvement | Why it matters to a real user | Status |
|---|---|---|---|
| U1 | **First-run onboarding checklist** on the dashboard (dismissible, remembered) | Guides a new user to value in minutes: review an insight → approve an action → check the audit trail → invite the team. | [Implemented now] |
| U2 | **Keyboard shortcuts help** (press `?`) | Power-user discoverability of ⌘K and navigation. | [Implemented now] |
| U3 | Bulk triage (approve/assign several at once) | Speed for heavy reviewers. | [Roadmap → Cycle 5] |
| U4 | Saved views / role-based default landing | Personalized start. | [Roadmap] |

---

## 4. Why these, in plain terms

- **A security reviewer** now sees a CSP with **no inline-script escape hatch** in production, a standard `security.txt` for reporting, and that **even blocked attempts are logged**.
- **A brand-new user** lands on a short checklist that walks them to the first approval and the audit trail — value in minutes, not guesswork.

---

## 5. Do-next (Cycle 5 and beyond)

1. **Bulk triage** on the governance queue (U3).
2. Server-side session revocation + real SSO/OIDC + MFA (S4).
3. Saved views & role-based landing (U4).
4. Scheduled digests to Slack/email; ROI/outcome dashboard.
