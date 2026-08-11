# Improvements Analysis v5 — Helm (User, Client & Security)

> Cycle-5 review (final in this series). Prior cycles delivered the full governed command center, CSRF, sliding sessions, tamper-evident audit, CSP nonce, and more. This cycle adds the governance control real compliance teams ask for first — **two-person approval** — plus an outcomes view and quality-of-life wins.

**Date:** 2026-08-11 · Status keys: **[Implemented now]**, **[Roadmap]**.

---

## 1. What stood out this cycle

1. **Single-approver risk on the highest-stakes actions.** T3 actions (financial, legal, access) could be approved by **one** person. Real governance for money/access uses **dual control** (two distinct approvers). This was the biggest governance gap.
2. **No "did it work?" view.** Decisions and completions were tracked, but there was no **outcomes/ROI** summary a leader or buyer could glance at.
3. **Everyone landed on the same page.** A manager and an auditor have different first questions; login always went to the dashboard.
4. **Read endpoints were unthrottled.** Mutations were rate-limited; list endpoints were not.

---

## 2. Security & Governance (this cycle)

| # | Control | What & why | Status |
|---|---|---|---|
| S1 | **Two-person (dual-control) approval for T3** | High-risk actions (financial/legal/access) now require **two distinct approvers**. The first approval is recorded but does **not** execute; a different authorized approver must confirm. A user cannot approve the same action twice. Every step is audited. | [Implemented now] |
| S2 | **Read-endpoint rate limiting** | `GET /api/actions|audit|activity` are now throttled per client (mutations already were). | [Implemented now] |
| S3 | Server-side session revocation ("sign out everywhere"), SSO/OIDC + MFA | Needs a shared session store reachable from the edge. | [Roadmap] |

---

## 3. User & Client Improvements

| # | Improvement | Why it matters | Status |
|---|---|---|---|
| U1 | **Outcomes / ROI view** | Approvals, completions, denials, and average time-to-decision at a glance — proves value and shows operating rhythm. | [Implemented now] |
| U2 | **Role-based default landing** | Managers land on **My Work**, auditors on the **Audit Trail**, others on the **Command Center** — the right first screen per role. | [Implemented now] |
| U3 | **Dual-control status in the UI** | The governance queue shows "1 of 2 approvals — awaiting a second approver" and prevents the same person approving twice. | [Implemented now] |
| U4 | Bulk triage (approve/assign several at once) | Speed for heavy reviewers. | [Roadmap] |
| U5 | Saved views / scheduled digests | Personalization & value without opening the app. | [Roadmap] |

---

## 4. Why these, in plain terms

- **A CFO/compliance lead** can trust that no single person can push through a payment or an access change — Helm enforces **four-eyes** on T3 and logs both approvals.
- **A founder** opens **Outcomes** and sees "12 approved, 9 completed, 2 declined, avg decision time 3h" — the operating rhythm in one card.
- **A manager** logs in and lands directly on **My Work**; an **auditor** lands on the **Audit Trail**.

---

## 5. Do-next (future)

1. **Bulk triage** on the governance queue (U4).
2. Server-side session revocation + real SSO/OIDC + MFA (S3).
3. Saved views & scheduled Slack/email digests (U5).
4. Configurable governance policy UI (who approves what, thresholds, dual-control toggles).
