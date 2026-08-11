# Design System — Helm

> **Phase 15 — Design System.** The visual and interaction language of Helm. Target quality: the calm, information-dense clarity of **Microsoft, Linear, Notion, Atlassian, and Stripe**. Clarity over decoration.

**Document status:** Phase 15 · **Last updated:** 2026-08-11

---

## 1. Design Principles

1. **Clarity first** — the fastest path to understanding; no ornament that doesn't inform.
2. **Density with breathing room** — executive-grade information density, disciplined spacing.
3. **Explainability visible** — evidence, confidence, and severity are always legible.
4. **Governance is obvious** — consequential actions look consequential.
5. **Accessible by default** — WCAG 2.1 AA; keyboard-first; reduced-motion respected.
6. **Consistent, tokenized** — one source of truth for color, type, spacing.

---

## 2. Color

Colors are defined as CSS variables (HSL) and consumed via Tailwind + ShadCN tokens, so light/dark themes and per-tenant theming are a token swap.

### Semantic tokens
| Token | Light | Dark | Use |
|---|---|---|---|
| `background` | near-white | near-black slate | app background |
| `foreground` | slate-900 | slate-50 | primary text |
| `card` / `popover` | white | slate-900 | surfaces |
| `muted` / `muted-foreground` | slate-100 / slate-500 | slate-800 / slate-400 | secondary |
| `border` / `input` | slate-200 | slate-800 | lines/fields |
| `primary` | indigo-600 | indigo-500 | brand actions |
| `ring` | indigo-500 | indigo-400 | focus ring |

### Status palette (accessible, colorblind-aware — pair color with icon/label)
| Status | Token | Meaning |
|---|---|---|
| Success / healthy | `success` (emerald) | on track |
| Warning / at-risk | `warning` (amber) | needs attention |
| Danger / critical | `destructive` (red) | urgent risk |
| Info | `info` (sky) | neutral note |

**Contrast:** all text meets WCAG AA (≥ 4.5:1 normal, ≥ 3:1 large). Status is never conveyed by color alone — always paired with an icon and text label.

---

## 3. Typography

- **Font:** system UI stack / Geist-style sans (via `next/font`), monospace for numeric/code.
- **Scale (rem):** `xs .75 · sm .875 · base 1 · lg 1.125 · xl 1.25 · 2xl 1.5 · 3xl 1.875 · 4xl 2.25`.
- **Weights:** 400 body, 500 medium (labels), 600 semibold (headings/KPIs).
- **Line-height:** 1.5 body, 1.2 headings. **Tabular numerals** for metrics/tables.
- **Hierarchy:** page title (2xl/3xl semibold) → section (lg/xl medium) → body (sm/base) → caption (xs muted).

---

## 4. Grid & Layout

- **App shell:** fixed left sidebar (collapsible), sticky top bar, scrollable content. Max content width ~1440px on ultra-wide.
- **Grid:** 12-column responsive; dashboard uses a card grid (`grid-cols-1 md:2 xl:3/4`).
- **Breakpoints (Tailwind):** `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`.
- **Responsive:** sidebar collapses to icons/drawer < lg; tables become stacked/scrollable on small screens.

---

## 5. Spacing & Radius & Elevation

- **Spacing scale (Tailwind, 4px base):** 1,2,3,4,6,8,12,16… Cards use `p-4/p-6`; section gaps `gap-4/gap-6`.
- **Radius:** `--radius: 0.5rem` (sm .375, md .5, lg .75). Consistent rounded surfaces.
- **Elevation:** subtle shadows only (`shadow-sm`/`shadow`), border-first surfaces. No heavy drop shadows.

---

## 6. Motion

- Purposeful, fast (150–250ms), ease-out. Used for state transitions, not spectacle.
- **`prefers-reduced-motion`** fully respected — disables non-essential animation.
- Heavy/marketing motion confined to `/showcase`.

---

## 7. Iconography

- **lucide-react** inline SVG; 16/20/24px. Icons always paired with text for meaning (a11y). Consistent stroke width.

---

## 8. Component Library

Built on ShadCN/Radix, adapted to Helm tokens. Each has defined **default / hover / focus / active / disabled** and **loading / empty / error** states where applicable.

### 8.1 Cards
- **KPI card:** label, big tabular value, delta badge (▲/▼ + %), sparkline, timeframe. Delta color paired with arrow + sign.
- **Insight card:** severity chip, title, narrative, evidence links, confidence meter, action buttons.
- **Section card:** header (title + actions) + content + optional footer.

### 8.2 Tables
- Sortable headers, sticky header, zebra optional, row hover, pagination, column visibility, empty/loading/error states, keyboard navigable, `<caption>`/`scope` for a11y.

### 8.3 Forms
- React Hook Form + Zod. Label + control + description + inline error (`aria-describedby`, `aria-invalid`). Required marked textually. Disabled submit while pending; success/failure toast.

### 8.4 Notifications / Toasts
- Non-blocking, `role="status"`/`aria-live="polite"`; success/warning/error/info variants; auto-dismiss with pause-on-hover; never the sole channel for critical governance messages.

### 8.5 Dialogs & Sheets
- Radix dialog/sheet: focus trap, `Esc` to close, restore focus, labelled title/description. Consequential-action dialogs require explicit confirm and (for T3) a reason field.

### 8.6 Alerts / Banners
- Inline contextual alerts (info/warning/danger/success) with icon + heading + body; used for degraded integrations, SLA breaches, etc.

### 8.7 Charts
- Recharts wrappers: line/area (trends), bar (comparisons), sparkline (KPI), donut (composition). Accessible: title, described-by summary, data available in a table fallback, tokenized colors, no color-only encoding.

### 8.8 Priority Queue / Action List
- Ordered by severity × confidence; each item shows domain, severity, confidence, evidence, and Approve/Decline/Request-changes with governance affordances.

### 8.9 Command Palette (⌘K)
- `cmdk`-based fast navigation/search across pages, agents, and knowledge.

---

## 9. State Patterns

| State | Pattern |
|---|---|
| **Loading** | Skeletons matching final layout (no layout shift); `aria-busy`. |
| **Empty** | Friendly illustration/icon + one-line explanation + primary CTA. |
| **Error** | Clear message + retry + correlation ID; never a raw stack trace. |
| **Success** | Inline confirmation + toast; optimistic where safe. |
| **Partial/degraded** | Show available data + a banner noting the degraded source. |

---

## 10. Accessibility Standards

- WCAG 2.1 AA. Full keyboard operability; visible focus rings (`ring`).
- Semantic landmarks (`header/nav/main/aside`), skip-to-content link.
- `aria-live` for async updates; labelled controls; color-independent status.
- Automated checks with axe (jest-axe + Playwright) in CI (see `testing.md`).

---

## 11. Theming & Tenancy

- All visual decisions are tokens → dark mode and per-tenant brand (primary color, logo) are configuration, not code changes. Contrast is re-validated for any custom brand color.

---

## 12. Content & Voice

- Concise, factual, executive tone. Numbers are precise and sourced. Avoid hype. Recommendations are phrased as proposals ("Recommend contacting…"), reinforcing the human-in-the-loop model.
