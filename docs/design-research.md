# Design Research — Helm

> **Phase 2 — Design Research.** Evaluation of premium-quality **free / open-source** UI ecosystems for the Helm reference implementation. Goal: adopt production-grade, well-licensed, secure, low-dependency primitives — and **adapt, not copy**.

**Document status:** Phase 2 · **Last updated:** 2026-08-11

---

## 1. Evaluation Method

Each ecosystem is scored across five dimensions. Scores are 1 (poor) – 5 (excellent).

| Dimension | What we check |
|---|---|
| **License** | Permissive (MIT/Apache-2.0/ISC) and safe for commercial use. |
| **Dependencies** | Supply-chain surface, transitive bloat, native/binary deps. |
| **Security** | Known CVEs, maintainer trust, use of `dangerouslySetInnerHTML`, unsafe eval. |
| **Maintenance** | Release cadence, open-issue hygiene, TypeScript support. |
| **Adoption** | Community size, real-world production usage, docs quality. |

> ⚠️ Version/CVE specifics change over time. Before adopting or upgrading any dependency, re-run `npm audit`, review the changelog, and prefer versions **published ≥ 7 days ago** (per project security rule) with no floating ranges.

---

## 2. Ecosystem Reviews

### 2.1 Radix UI Primitives — ✅ Approved (foundation)
Unstyled, accessible, headless primitives (dialog, dropdown, popover, tabs, tooltip…).

| License | Deps | Security | Maintenance | Adoption |
|---|---|---|---|---|
| MIT — 5 | Lean, tree-shakeable — 5 | Strong a11y, no styling injection — 5 | Active, TS-first — 5 | Very high (powers ShadCN) — 5 |

**Verdict:** Foundational accessibility layer. Adopt directly for interactive primitives.

### 2.2 ShadCN UI — ✅ Approved (primary system)
Not an npm dependency but a **copy-in** component collection (Radix + Tailwind + CVA). You own the code.

| License | Deps | Security | Maintenance | Adoption |
|---|---|---|---|---|
| MIT — 5 | You own source; minimal runtime — 5 | Auditable (in-repo) — 5 | Very active — 5 | Extremely high — 5 |

**Verdict:** **Primary component system.** Because components live in-repo, we can audit and adapt them. No hidden runtime coupling.

### 2.3 Tremor — ✅ Approved (selective: charts/KPI patterns)
React library for dashboards (charts, KPI cards) built on Recharts + Tailwind.

| License | Deps | Security | Maintenance | Adoption |
|---|---|---|---|---|
| Apache-2.0 — 5 | Pulls Recharts (already in stack) — 4 | Low risk — 4 | Active — 4 | High in dashboard space — 4 |

**Verdict:** Use as **design reference** for KPI/dashboard patterns; we implement our own thin components on **Recharts** directly to avoid version lock-in and keep the chart surface minimal.

### 2.4 HyperUI — ✅ Approved (markup reference)
Free Tailwind markup snippets (tables, cards, marketing). No runtime dependency.

| License | Deps | Security | Maintenance | Adoption |
|---|---|---|---|---|
| MIT — 5 | None (copy markup) — 5 | Copy-in, auditable — 5 | Active — 4 | High — 4 |

**Verdict:** Copy-and-adapt markup patterns for tables/empty-states. Zero dependency cost.

### 2.5 Flowbite (Free tier) — ⚠️ Conditional
Tailwind component set; some interactivity via its own JS or React wrapper.

| License | Deps | Security | Maintenance | Adoption |
|---|---|---|---|---|
| MIT (free tier) — 4 | React wrapper adds deps; some Pro-gated — 3 | OK — 4 | Active — 4 | High — 4 |

**Verdict:** **Markup patterns only.** Avoid the JS/React runtime wrapper to prevent overlap with Radix/ShadCN. Do not use Pro-gated components.

### 2.6 Magic UI — ⚠️ Conditional (motion accents only)
Animated components (framer-motion based).

| License | Deps | Security | Maintenance | Adoption |
|---|---|---|---|---|
| MIT — 4 | framer-motion — 3 | Low — 4 | Active — 4 | Growing — 3 |

**Verdict:** Use sparingly for **subtle** showcase accents only. Business dashboards favor clarity over animation (see design principles). Gate behind `prefers-reduced-motion`.

### 2.7 Aceternity UI (free components only) — ⚠️ Conditional (marketing/showcase)
Highly animated marketing components.

| License | Deps | Security | Maintenance | Adoption |
|---|---|---|---|---|
| Free components MIT-style — 3 | framer-motion, heavy effects — 2 | Copy-in; audit each — 3 | Active — 3 | Growing — 3 |

**Verdict:** **Showcase/marketing surfaces only**, never in the operational dashboard. Audit each copied component; strip heavy effects; respect reduced-motion. Confirm the specific component's license before use.

### 2.8 Origin UI — ⚠️ Conditional
Tailwind + Radix based copy-in components.

| License | Deps | Security | Maintenance | Adoption |
|---|---|---|---|---|
| MIT — 4 | Copy-in — 4 | Auditable — 4 | Active — 3 | Growing — 3 |

**Verdict:** Optional supplement to ShadCN for niche patterns; adopt individual components after audit.

### 2.9 Supporting libraries (approved)
- **lucide-react** (ISC) — icon set used by ShadCN. ✅
- **class-variance-authority**, **tailwind-merge**, **clsx** (MIT) — styling utilities. ✅
- **Recharts** (MIT) — charts. ✅
- **@tanstack/react-query** (MIT), **zustand** (MIT), **zod** (MIT), **react-hook-form** (MIT). ✅

---

## 3. Approved Patterns

- **Headless + Tailwind + in-repo components** (ShadCN/Radix) as the core — auditable and owned.
- **KPI cards, sparkline trends, delta badges** (Tremor-inspired, implemented on Recharts).
- **Data tables** with sort/filter/pagination + empty/error/loading states (HyperUI-inspired markup).
- **Command palette** (⌘K) via `cmdk` (used by ShadCN) for fast navigation.
- **App shell**: fixed sidebar + top bar + content, responsive collapse.
- **Priority queue / action list** cards with severity, confidence, and approval CTAs.
- **Notification / toast** patterns for async feedback.
- **Accessible dialogs, sheets, popovers, tabs** from Radix.

## 4. Rejected Patterns

| Pattern | Reason |
|---|---|
| Heavy hero animations in operational views | Distracts from decision-making; hurts performance. |
| Pro-gated / paid-only components | Violates free-stack constraint. |
| Multiple overlapping component runtimes (Flowbite JS + Radix) | Dependency conflict, larger surface, inconsistent a11y. |
| Auto-playing motion without reduced-motion guard | Accessibility violation (WCAG 2.3.3 / 2.2.2). |
| Any component using `dangerouslySetInnerHTML` on untrusted data | XSS risk. |
| Icon fonts | Larger payload + a11y issues vs. inline SVG (lucide). |

## 5. Security Findings

- **Copy-in components** (ShadCN/HyperUI/Origin/Aceternity) reduce supply-chain risk because source is in-repo and auditable — but each must be **read and sanitized** before use; do not paste unaudited snippets.
- **Animation libraries** (framer-motion) increase bundle size and CPU; restrict to showcase and guard with `prefers-reduced-motion`.
- **No `dangerouslySetInnerHTML`** on user/agent-generated content. If rendering markdown, sanitize (e.g., a vetted sanitizer) — see `security-model.md`.
- **Pin dependencies**, avoid floating ranges, run `npm audit` in CI, prefer releases ≥ 7 days old.
- **CSP-friendly**: prefer libraries that don't require `unsafe-inline`/`unsafe-eval`.

## 6. Risk Analysis

| Risk | Severity | Mitigation |
|---|---|---|
| Unaudited copy-in snippet introduces XSS | High | Mandatory review + sanitizer; lint rule against raw HTML injection. |
| Animation bloat degrades Lighthouse Performance | Med | Scope motion to showcase; lazy-load; reduced-motion. |
| Component runtime overlap / conflicts | Med | Single system (ShadCN/Radix); others = markup reference only. |
| License drift on a specific component | Low | Record source + license per adopted component. |

## 7. Component Recommendations (final)

| Need | Choice | Source model |
|---|---|---|
| Primitives (dialog, tabs, dropdown, tooltip, popover, sheet) | Radix via ShadCN | npm + in-repo |
| Buttons, inputs, cards, badges, tables, forms | ShadCN | in-repo (owned) |
| Command palette | cmdk (ShadCN) | npm |
| Icons | lucide-react | npm |
| Charts / KPIs | Recharts + custom thin wrappers (Tremor-inspired) | npm + in-repo |
| Table markup patterns | HyperUI-inspired | copy-adapt |
| Showcase accents | Magic/Aceternity (subtle, guarded) | copy-adapt, audited |

**Guiding rule:** *Adapt and improve — never blindly copy.* Every adopted component is read, understood, adapted to Helm's design system (`design-system.md`), and made accessible.
