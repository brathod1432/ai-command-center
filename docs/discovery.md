# Product Discovery — Helm

> **Helm — AI Business Operations Platform**
> The intelligent business operating system that tells leaders *what happened, why it happened, what the risks and opportunities are, and what to do next* — with a human always in control.

**Document status:** Living document · Phase 1 (Product Discovery)
**Owners:** Product Strategy, Enterprise Architecture
**Last updated:** 2026-08-11

---

## 1. Product Vision

Helm is an **AI Business Operations Platform** — a single command center that unifies the fragmented tools a company runs on (email, Jira, GitHub, CRM, accounting, support, calendar, chat) into one explainable, governed operational picture.

Helm does **not** replace people. It **assists** people. Every material action flows through a human approval and audit path. Helm's job is to compress the daily cognitive load of running a company into a clear narrative: *health, risks, opportunities, and recommended next actions* — each with evidence and a confidence score.

**One-sentence vision:** *Give every operator the situational awareness of a seasoned Chief of Staff, backed by a team of specialized AI agents that recommend but never act without approval.*

### Vision pillars
| Pillar | What it means |
|---|---|
| **Unified** | One pane of glass across every business system. |
| **Explainable** | Every insight cites its data and reasoning; no black boxes. |
| **Governed** | Humans approve all consequential actions; everything is auditable. |
| **Actionable** | Insights convert into concrete, prioritized, trackable actions. |
| **Adaptable** | Configurable to any industry, org size, and tenancy model. |

---

## 2. Problem Statement

Leaders operate blind across too many tools. The core problems:

1. **Fragmentation** — Critical signals live in 8–15 disconnected systems. No one has a complete, current picture.
2. **Reactive operating rhythm** — Problems (churn, missed sprints, cash gaps) surface *after* they hurt, not before.
3. **Manual synthesis tax** — Leaders and chiefs of staff spend hours each week manually assembling status from dashboards, spreadsheets, and standups.
4. **Insight without action** — Existing BI tools show charts but do not recommend, prioritize, or route actions for approval.
5. **Trust and governance gap** — Generic AI copilots act unpredictably and leave no audit trail, making them unsafe for regulated or high-stakes operations.

**The gap Helm fills:** a governed, explainable layer *between* raw operational data and human decision-making that turns noise into prioritized, auditable action.

---

## 3. Target Market

- **Primary:** Venture-backed startups and scale-ups (Series A–C, 20–500 employees) whose founders/execs are drowning in tool sprawl.
- **Secondary:** SMB and mid-market operators (consulting firms, MSPs, agencies) needing an operational nerve center.
- **Tertiary / expansion:** Regulated mid-market and enterprise (healthcare, insurance, financial services, logistics, manufacturing) where governance and auditability are mandatory — served via multi-tenant SaaS or single-tenant/hybrid deployments.

**Market sizing lens (top-down):** Business intelligence, RevOps, and "workspace copilot" categories are converging. Helm sits at the intersection of **BI + Workflow Automation + AI Copilot + Executive Reporting**, a whitespace between single-purpose tools and generic chat assistants.

---

## 4. Ideal Customers

An Ideal Customer Profile (ICP) for Helm:

- 30–500 employees with 6+ SaaS systems of record.
- A founder/CEO or COO who personally assembles weekly status today.
- At least one revenue system (CRM/billing) and one delivery system (Jira/GitHub/Azure DevOps).
- A culture that wants automation *with* control — not autonomy.
- Bonus: compliance obligations (SOC 2, HIPAA, PCI) that make governance and audit a buying requirement.

**Anti-ICP (poor fit):** <10 person teams with one or two tools; organizations wanting fully autonomous agents with no human approval; teams unwilling to connect systems of record.

---

## 5. Business Benefits

| Benefit | Measurable outcome |
|---|---|
| Faster situational awareness | Weekly status assembly time cut from hours to minutes. |
| Earlier risk detection | Churn, delivery, and cash risks surfaced days/weeks earlier. |
| Better prioritization | Leaders act on the top 3 things that matter, not the loudest. |
| Governed automation | Consequential actions get approval + audit trail (compliance-ready). |
| Reduced tool tax | Fewer context switches; one command center. |
| Institutional memory | Decisions, rationale, and outcomes are captured and searchable. |

---

## 6. Business Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI produces wrong/hallucinated insights | Med | High | Evidence citations, confidence scores, human approval, eval harness (see `ai-safety.md`). |
| Over-trust / automation complacency | Med | High | Explicit approval gates; no autonomous consequential actions. |
| Data security / breach across connected systems | Med | Critical | Least-privilege scopes, encryption, RBAC, audit logs (see `security-model.md`). |
| Integration brittleness | High | Med | Adapter pattern + mock providers; graceful degradation. |
| Scope creep ("do everything") | High | Med | Ruthless phase discipline; business-value gate on every feature. |
| Change management / adoption | Med | High | Showcase mode, per-industry templates, in-product onboarding. |
| Vendor/API rate limits & cost | Med | Med | Caching, backoff, per-integration budgets, observability. |

---

## 7. Competitive Landscape

| Category | Examples | Their strength | Where Helm wins |
|---|---|---|---|
| Generic AI copilots | Microsoft Copilot, ChatGPT Enterprise | Broad assistance, ecosystem | Governance, explainability, business-ops depth, audit trail |
| BI / analytics | Tableau, Looker, Power BI | Deep visualization | Recommendations + action routing + narrative, not just charts |
| Workflow automation | Zapier, Make, n8n | Integration breadth | Human-in-the-loop approvals + AI reasoning + observability |
| RevOps / CS platforms | Gong, Gainsight | Domain depth (one function) | Cross-functional, unified executive view |
| Exec dashboards | Geckoboard, Databox | Simple KPI walls | Explanation of *why* + recommended actions + agents |

**Positioning:** *"An Enterprise AI Operations Center, not another AI chat app."* Helm is the governed synthesis + action layer that none of the point tools provide end to end.

---

## 8. User Personas

Each persona lists goals, pains, and the Helm value delivered.

### 8.1 Founder
- **Goals:** Know the true state of the company in 5 minutes; act on the few things that matter.
- **Pains:** Tool sprawl; conflicting numbers; no time to synthesize.
- **Helm value:** Executive Command Center narrative + top recommended actions with confidence.

### 8.2 CEO
- **Goals:** Board-ready truth; align teams to strategy; manage risk.
- **Pains:** Late surprises; manual board deck assembly.
- **Helm value:** Executive summary, risk register, opportunity queue, exportable reports.

### 8.3 COO
- **Goals:** Operational excellence; cross-functional coordination.
- **Pains:** Blind spots between departments; escalations arrive late.
- **Helm value:** Operations view, workflow automation, escalation routing.

### 8.4 Engineering Manager
- **Goals:** Ship on time; manage delivery risk and quality.
- **Pains:** Sprint risk visibility; incident/on-call load.
- **Helm value:** Engineering Agent — sprint risk, DORA-style signals, escalation approvals.

### 8.5 Product Manager
- **Goals:** Prioritize roadmap by impact; track adoption.
- **Pains:** Fragmented feedback; unclear impact.
- **Helm value:** Product Agent — adoption trends, feedback clusters, roadmap health.

### 8.6 Sales Director
- **Goals:** Hit revenue; protect at-risk deals; forecast accurately.
- **Pains:** Pipeline hygiene; slipping deals; churn risk.
- **Helm value:** Sales Agent — pipeline health, at-risk deals, forecast, next best action.

### 8.7 Operations Director
- **Goals:** Efficiency; SLA adherence; vendor/cost control.
- **Pains:** Manual reporting; SLA breaches.
- **Helm value:** Operations + Finance views, SLA monitors, cost signals.

### 8.8 Support Lead
- **Goals:** CSAT, fast resolution, staffing to demand.
- **Pains:** Ticket spikes; cluster blindness; escalation lag.
- **Helm value:** Support Agent — ticket clustering, CSAT trends, escalation workflow.

---

## 9. Use Cases

1. **Morning briefing** — Founder opens Helm; sees a one-screen narrative of health, risks, opportunities, and top 3 actions.
2. **Churn early-warning** — Customer Success Agent flags two enterprise accounts trending to churn; recommends outreach; leader approves messaging draft (never auto-sent).
3. **Sprint-risk escalation** — Engineering Agent detects sprint-goal risk; proposes an escalation; EM approves; action logged to audit.
4. **Support cluster triage** — Support Agent clusters a spike of tickets to a root cause; recommends a fix + comms; routed for approval.
5. **Board reporting** — CEO generates a board-ready report from the Reports module, sourced from live signals with citations.
6. **Cash/invoice review** — Finance Agent surfaces overdue invoices and a cash-flow risk; recommends a review action requiring explicit approval.
7. **Lead qualification** — Sales Agent scores and routes inbound leads; a workflow requests owner assignment approval.
8. **Cross-functional risk report** — Operations Director gets a single risk register across engineering, sales, support, and finance.

---

## 10. Future Opportunities

- **Retrieval-augmented knowledge** (RAG) over policies, runbooks, and meeting notes (see `knowledge-architecture.md`).
- **Predictive forecasting** for revenue, churn, capacity, and cash.
- **Scenario simulation** ("what if we lose customer X?").
- **Agent marketplace** for industry-specific agents.
- **Deeper vertical templates** (healthcare, insurance, logistics, manufacturing).
- **Mobile executive briefing** and Slack/Teams digest delivery.
- **Closed-loop learning** — measuring outcomes of approved actions to improve recommendations.

---

## 11. Success Metrics & KPIs

### Product / adoption
- **TTV (time to value):** first useful insight < 10 minutes from connect.
- **WAU/MAU** of executive users; **stickiness** (DAU/MAU).
- **Actions approved per week** and **action completion rate**.
- **% recommendations accepted** (a trust proxy).

### Business impact (customer outcomes)
- Reduction in weekly status-assembly time.
- Risks surfaced *before* impact (lead time).
- Churn reduction / expansion on flagged accounts.
- Sprint predictability improvement.

### Trust & safety
- **Recommendation precision** (accepted / total).
- **Zero autonomous consequential actions** (hard invariant).
- **100% of consequential actions have an audit record**.

### Quality gates (engineering — see `final-audit.md`)
- Lighthouse Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, Maintainability ≥ 95.

---

## 12. Assumptions

- Customers can grant scoped, read-first access to their systems of record.
- Human-in-the-loop is a *feature*, not a limitation, for the target market.
- Mock/adapter providers are acceptable for the initial build; real OAuth integrations follow the same interface.
- Executive users value narrative + prioritization over raw dashboards.

---

## 13. Constraints

- **Governance-first:** No autonomous consequential actions — ever.
- **Explainability required:** Every insight must cite evidence and a confidence score.
- **Free/open UI stack only** for the reference implementation (see `design-research.md`).
- **Deployment flexibility:** Must support single-tenant, multi-tenant, cloud, and hybrid.
- **Accessibility:** WCAG 2.1 AA target across the app.
- **Privacy:** Least-privilege data access; auditability by default.

---

## 14. Roadmap

| Horizon | Theme | Highlights |
|---|---|---|
| **Now (0–3 mo)** | Command Center foundation | Executive dashboard, agents workspaces, governance/approvals, mock integrations, RBAC, audit log, showcase. |
| **Next (3–6 mo)** | Depth & automation | Workflow engine expansion, reports/export, knowledge base ingestion, first real integrations (GitHub, Jira, Slack). |
| **Later (6–12 mo)** | Intelligence | RAG retrieval, predictive forecasting, scenario simulation, closed-loop outcome learning. |
| **Future (12 mo+)** | Ecosystem | Agent marketplace, vertical packs, mobile briefings, advanced multi-tenant admin. |

---

## 15. Glossary

- **Agent** — A specialized AI persona (e.g., Sales Agent) that analyzes a domain and produces insights/recommendations. Never acts autonomously.
- **Insight** — An explainable observation with evidence, severity, and confidence.
- **Recommendation / Action** — A proposed next step; consequential actions require approval.
- **Approval** — A human decision gate recorded in the audit log.
- **Confidence score** — Model/heuristic certainty (0–100%) attached to an insight.
- **Tenancy** — Single-tenant, multi-tenant, or hybrid deployment model.
