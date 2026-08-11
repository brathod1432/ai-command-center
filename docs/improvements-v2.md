# Improvements Analysis v2 — Helm (User, Client & Security)

> Round-2 review, building on `docs/improvements.md`. The app now has auth, RBAC, a governed approval flow with an audit trail, agent workspaces, function pages, workflows, integrations, knowledge search, reports, settings, and showcase. This round targets the **next tier of practical value** and **deeper security**.

**Date:** 2026-08-11 · Status keys: **[Implemented now]**, **[Partially]**, **[Roadmap]**.

---

## 1. Where it stood before this round

The core loop worked (log in → review insights → approve/decline → audit). But for a real operator, several practical gaps remained:

1. **Approvals were a dead end.** Approving an action didn't turn it into *tracked work* — no owner, due date, completion, or discussion.
2. **No sense of "what changed."** No notifications / activity feed.
3. **Everything shown at once.** No filtering by severity or domain to focus.
4. **Charts were only sparklines.** No real trend visualization despite Recharts being available.
5. **Search was nav-only.** The palette couldn't find an agent, a document, or an action.
6. **No team visibility.** Admins couldn't see who has which role/permissions.

On security, three concrete hardening opportunities stood out: the audit log wasn't **tamper-evident**, page authorization relied on middleware + nav-hiding (not per-page server checks), and authed API responses weren't marked **no-store**.

---

## 2. User-Experience Improvements

| # | Improvement | Why it matters to a real user | Status |
|---|---|---|---|
| U1 | **Action lifecycle** — assign owner, set due date, mark complete, and a **comment thread** | Turns a recommendation into tracked, accountable work — the difference between "insight" and "done". | [Implemented now] |
| U2 | **Notifications / activity feed** (topbar bell) | "What happened since I was last here?" — decisions and events at a glance. | [Implemented now] |
| U3 | **Filtering** insights by severity & domain | Executives focus on the few things that matter, fast. | [Implemented now] |
| U4 | **Real trend charts** (Recharts) on dashboard & finance | Visual trend/■risk reading, not just a number + sparkline. | [Implemented now] |
| U5 | **Global command palette search** (agents, knowledge, actions) | Jump to anything in two keystrokes — power-user speed. | [Implemented now] |
| U6 | Action **status beyond approve/decline** (in-progress → done) | Reflects real operational state. | [Implemented now] |
| U7 | Saved views / personalized landing per role | Each role sees what it cares about first. | [Roadmap] |
| U8 | Scheduled digests (email/Slack morning briefing) | Value without opening the app. | [Roadmap] |
| U9 | Bulk actions & keyboard shortcuts on queues | Speed for heavy reviewers. | [Roadmap] |

---

## 3. Client / Buyer Improvements

| # | Improvement | Rationale | Status |
|---|---|---|---|
| C1 | **Team & permissions view** (admin) | Buyers need to see who can do what; supports access reviews (SOC 2). | [Implemented now] |
| C2 | **Tamper-evident audit** (hash chain) + integrity check | Strong compliance/evidence story; detects log manipulation. | [Implemented now] |
| C3 | Outcome/ROI tracking (risks caught, actions completed, time saved) | Justifies spend to the buyer. | [Partially] (completion now tracked; ROI dashboard [Roadmap]) |
| C4 | Multi-tenant switcher | Agencies/MSPs and enterprises. | [Roadmap] |
| C5 | Configurable governance policy UI (who approves what, SLAs) | Fit to the buyer's compliance model. | [Roadmap] |

---

## 4. Security Hardening (this round)

| # | Control | What & why | Status |
|---|---|---|---|
| S1 | **Tamper-evident audit log** | Each record carries `prevHash` + `hash` (SHA-256 chain). A `verifyChain()` detects any insertion/edit/reorder. The Audit page shows an **integrity-verified** badge. | [Implemented now] |
| S2 | **Server-side page-level RBAC** | Every gated page checks its permission on the server and renders a shared **Forbidden** view — defense in depth beyond middleware + nav-hiding. | [Implemented now] |
| S3 | **`Cache-Control: no-store`** on authenticated API responses | Prevents sensitive data being cached by browsers/proxies. | [Implemented now] |
| S4 | **Rate-limit headers** (`X-RateLimit-*`, `Retry-After`) | Transparent throttling; clients can back off. | [Implemented now] |
| S5 | **Payload/string bounds** in Zod schemas | Reject oversized/abusive input at the boundary. | [Implemented now] |
| S6 | Sliding-session refresh + idle timeout | Reduce hijack window while keeping UX. | [Roadmap] |
| S7 | CSP nonce (drop `unsafe-inline` for scripts) | Tighten XSS surface. | [Roadmap] |
| S8 | Real SSO/OIDC + MFA | Enterprise readiness (session model already swappable). | [Roadmap] |

---

## 5. Why these, in plain terms

- **A founder** can now not just *approve* "contact the two at-risk accounts" — they can **assign it to the CS lead, set a due date, discuss it in comments, and mark it done**, then see it in the activity feed. That's the difference between a dashboard and an operating system.
- **A compliance buyer** can point auditors at an **append-only, hash-chained** trail with a one-click integrity check, and a **team/permissions** view for access reviews.
- **A security reviewer** sees authorization enforced at the page and API layers (not just hidden links), sensitive responses marked no-store, and abuse throttled with clear headers.

---

## 6. Do-next (after this round)

1. Scheduled digests to Slack/email (U8).
2. Saved views & role-based landing (U7).
3. ROI/outcome dashboard (C3).
4. Real SSO/OIDC + MFA and sliding sessions (S6/S8).
5. CSP nonce hardening (S7).
