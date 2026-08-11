# Improvements Analysis v3 — Helm (User, Client & Security)

> Round-3 review, building on `docs/improvements.md` and `docs/improvements-v2.md`. The app now has auth, RBAC, a hash-chained audit trail, the full action lifecycle (assign/comment/complete), an activity feed, filtering, charts, and a team/permissions view. This round makes it feel like a **daily-use tool** and hardens the session/CSRF layer.

**Date:** 2026-08-11 · Status keys: **[Implemented now]**, **[Partially]**, **[Roadmap]**.

---

## 1. Where it stood before this round

The building blocks were all there, but a real operator still lacked a few things that separate a demo from a tool they'd open every morning:

1. **No personal starting point.** Actions now have owners and approvals, but there was no "**what's on my plate**" view — you had to hunt across pages.
2. **No operational status view.** Integration health and audit integrity existed as data, but there was no single **Status** page to glance at.
3. **Search was still partial.** The palette found pages/agents/docs but not the **insights or actions** themselves.
4. **Data didn't survive a restart.** The in-memory store reset on every server restart — fine for a demo, jarring for real use.
5. **Session security was single-shot.** A fixed 8-hour token with no **idle timeout**, **sliding refresh**, or **absolute cap**; CSRF relied on the Origin check alone.

---

## 2. User-Experience Improvements

| # | Improvement | Why it matters to a real user | Status |
|---|---|---|---|
| U1 | **"My Work" inbox** — my pending approvals, actions **assigned to me**, and what I completed | A single, personal starting point — the "open this first" screen. | [Implemented now] |
| U2 | **Status page** — integration health, audit-chain integrity, system health | One glance answers "is everything OK?". | [Implemented now] |
| U3 | **Global search** in the command palette (insights + actions, not just nav/agents/docs) | Find *anything* in two keystrokes. | [Implemented now] |
| U4 | **CSV export** of the audit trail (alongside JSON) | Analysts live in spreadsheets; compliance wants CSV. | [Implemented now] |
| U5 | **Data persistence across restarts** (file-backed store) | Decisions/comments/audit survive a restart — it behaves like a real system. | [Implemented now] |
| U6 | Saved views / role-based default landing | Each role lands on what it cares about. | [Roadmap] |
| U7 | Scheduled digests (email/Slack morning briefing) | Value without opening the app. | [Roadmap] |
| U8 | Bulk triage (approve/assign several at once) | Speed for heavy reviewers. | [Roadmap] |

---

## 3. Client / Buyer Improvements

| # | Improvement | Rationale | Status |
|---|---|---|---|
| C1 | **Operational status page** | Buyers/ops want an at-a-glance health view + integrity proof. | [Implemented now] |
| C2 | **Durable data** (persistence) | A product that forgets on restart isn't trusted with real ops. | [Implemented now] |
| C3 | Multi-tenant switcher + per-tenant branding | Agencies/MSPs and enterprises. | [Roadmap] |
| C4 | Configurable governance thresholds & SLAs (persisted) | Fit to the buyer's compliance model. | [Roadmap] |
| C5 | ROI/outcome dashboard (risks caught, actions completed, cycle time) | Justifies the spend. | [Partially] (completion + activity now tracked; dedicated ROI view [Roadmap]) |

---

## 4. Security Hardening (this round)

| # | Control | What & why | Status |
|---|---|---|---|
| S1 | **CSRF double-submit token** | In addition to the same-origin check, state-changing requests must present a header token matching a per-session cookie — defense in depth against CSRF. | [Implemented now] |
| S2 | **Sliding session + idle timeout** | The session refreshes on activity (sliding), so inactivity logs you out after the idle window. | [Implemented now] |
| S3 | **Absolute session cap** | Even active sessions expire at an absolute maximum age, forcing periodic re-auth. | [Implemented now] |
| S4 | **Cross-origin isolation headers** | `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, `X-Permitted-Cross-Domain-Policies` reduce cross-origin leakage/Spectre-class risks. | [Implemented now] |
| S5 | CSP **nonce** (drop `unsafe-inline` for scripts) | Tighten XSS surface. Deferred: requires per-request nonce wiring and careful browser verification to avoid breaking hydration. | [Roadmap] |
| S6 | Real SSO/OIDC + MFA, server-side session revocation ("sign out everywhere") | Enterprise readiness; needs a session store. | [Roadmap] |

---

## 5. Why these, in plain terms

- **A manager** opens Helm and immediately sees **My Work**: three approvals waiting on them, two actions they own with due dates, and what they closed this week — no hunting.
- **An admin/ops** glances at **Status**: which integrations are degraded, that the audit chain is intact, and that the system is healthy.
- **Anyone** hits ⌘K and jumps straight to an *insight* or *action*, not just a page.
- **The business** trusts it more because data **persists**, sessions **time out and cap**, and CSRF is defended with a **token + origin** check.

---

## 6. Do-next (after this round)

1. CSP nonce hardening with in-browser verification (S5).
2. Real SSO/OIDC + MFA and server-side session revocation (S6).
3. Scheduled digests to Slack/email (U7).
4. Saved views & role-based landing (U6).
5. ROI/outcome dashboard and configurable governance thresholds (C5/C4).
