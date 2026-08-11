# Agent Architecture — Helm

> **Phase 4 — Agent Operating Model.** Helm's multi-agent system. Agents **recommend, analyze, summarize, explain, and predict** — they **never** take consequential actions autonomously (see `ai-safety.md`).

**Document status:** Phase 4 · **Last updated:** 2026-08-11

---

## 1. Operating Model

Each agent is a specialized, bounded analyst over one business domain. Agents share a common contract:

```ts
interface Agent {
  id: string;
  name: string;              // e.g., "Sales Agent"
  mission: string;
  domain: Domain;            // sales | engineering | finance | ...
  inputs: DataSourceRef[];   // which integrations/entities it reads
  analyze(ctx): Insight[];   // evidence + severity + confidence
  recommend(insights): Action[]; // proposed next steps
  riskLevel: 'low' | 'medium' | 'high';
}
```

**Shared behaviors**
- Every **Insight** includes: title, narrative, evidence[] (with source), severity, confidence (0–100), timestamp.
- Every **Action** includes: description, expected impact, `requiresApproval`, risk level, owner suggestion.
- Agents write to the **audit log** on every run and every recommendation.
- Agents are **read-mostly**: they never mutate source systems; they emit recommendations for humans.

**Coordination.** A lightweight **CEO Agent** aggregates other agents' insights into an executive narrative and cross-functional risk register. Agents do not call each other directly; they publish insights to a shared store the CEO Agent reads (mediator pattern) — keeping coupling low and auditability high.

---

## 2. Agent Catalog

For each agent: **Mission · Responsibilities · Inputs · Outputs · Data Sources · Example Insights · Actions · Required Approvals · Risk Level · Business Impact.**

### 2.1 CEO Agent
- **Mission:** Produce a truthful, prioritized executive picture of company health.
- **Responsibilities:** Aggregate agent insights; compute company health score; maintain risk & opportunity registers; draft executive summary.
- **Inputs:** All other agents' insights; top-line KPIs.
- **Outputs:** Executive summary, health score, ranked risks/opportunities, top 3 actions.
- **Data Sources:** Derived (agents) + revenue/growth KPIs.
- **Example Insights:** "Revenue +18% MoM but two enterprise accounts at churn risk and Sprint 24 at risk."
- **Actions:** Recommend prioritization; route cross-functional escalations.
- **Required Approvals:** Any escalation or external comms → approval.
- **Risk Level:** Medium · **Business Impact:** Very High.

### 2.2 Operations Agent
- **Mission:** Keep operations running smoothly and on-SLA.
- **Responsibilities:** SLA monitoring, cross-team bottlenecks, vendor/cost signals, process health.
- **Inputs:** Ticketing, project, finance summaries, calendars.
- **Outputs:** SLA status, bottleneck alerts, efficiency insights.
- **Data Sources:** Jira/ADO, Zendesk/Freshdesk, calendars, billing.
- **Example Insights:** "Onboarding SLA breached for 3 accounts this week."
- **Actions:** Recommend reallocation, escalate SLA breach.
- **Required Approvals:** Resourcing/vendor changes → approval.
- **Risk Level:** Medium · **Business Impact:** High.

### 2.3 Engineering Agent
- **Mission:** Protect delivery predictability and quality.
- **Responsibilities:** Sprint-goal risk, PR/throughput, incident/on-call load, quality signals.
- **Inputs:** GitHub/ADO, Jira, incident data.
- **Outputs:** Sprint risk, delivery forecast, quality/incident insights.
- **Data Sources:** GitHub, Azure DevOps, Jira.
- **Example Insights:** "Sprint 24 goal at risk: 40% scope open with 3 days left; review latency up 2x."
- **Actions:** Recommend scope cut/escalation; propose incident review.
- **Required Approvals:** Escalations, scope changes → approval. **Never deploys.**
- **Risk Level:** Medium · **Business Impact:** High.

### 2.4 Product Agent
- **Mission:** Maximize roadmap impact and adoption.
- **Responsibilities:** Feature adoption, feedback clustering, roadmap health, experiment readouts.
- **Inputs:** Product analytics, feedback, roadmap.
- **Outputs:** Adoption trends, prioritized feedback themes, roadmap risk.
- **Data Sources:** Analytics (mock), Jira/roadmap, support themes.
- **Example Insights:** "Feature X adoption flat; 30% of new feedback references onboarding friction."
- **Actions:** Recommend roadmap reprioritization, discovery spike.
- **Required Approvals:** Roadmap commitments → approval.
- **Risk Level:** Low · **Business Impact:** High.

### 2.5 Sales Agent
- **Mission:** Grow and protect revenue.
- **Responsibilities:** Pipeline health, at-risk deals, forecast accuracy, next best action.
- **Inputs:** CRM (deals, stages, activity).
- **Outputs:** Pipeline health, at-risk deal list, forecast, NBA per deal.
- **Data Sources:** HubSpot/Salesforce (mock).
- **Example Insights:** "$420k in stage-4 deals with no activity in 14 days; forecast 8% below target."
- **Actions:** Recommend outreach; draft (not send) follow-ups.
- **Required Approvals:** **All customer messaging** → approval.
- **Risk Level:** Medium · **Business Impact:** Very High.

### 2.6 Marketing Agent
- **Mission:** Efficient demand generation and brand health.
- **Responsibilities:** Campaign performance, CAC/LTV signals, funnel conversion, content ROI.
- **Inputs:** Analytics, campaign data, CRM lead source.
- **Outputs:** Campaign ROI, funnel drop-off, spend efficiency insights.
- **Data Sources:** GA/Clarity (mock), CRM.
- **Example Insights:** "CAC up 22% on paid; organic converts 3x better."
- **Actions:** Recommend budget shift; pause underperforming campaign (proposal only).
- **Required Approvals:** Budget/spend changes, external content → approval.
- **Risk Level:** Low · **Business Impact:** Medium.

### 2.7 Customer Success Agent
- **Mission:** Protect retention and drive expansion.
- **Responsibilities:** Health scoring, churn early-warning, renewal risk, expansion signals.
- **Inputs:** Usage, support, CRM, NPS.
- **Outputs:** Account health, churn-risk list, renewal calendar, expansion candidates.
- **Data Sources:** CRM, product usage, support (mock).
- **Example Insights:** "Accounts ABC & DEF trending to churn (usage −45%, 2 escalations)."
- **Actions:** Recommend outreach; draft QBR/renewal plan.
- **Required Approvals:** **Customer communications** → approval.
- **Risk Level:** Medium · **Business Impact:** Very High.

### 2.8 Support Agent
- **Mission:** Maximize CSAT and resolution efficiency.
- **Responsibilities:** Ticket clustering, CSAT trends, SLA/first-response, staffing-to-demand.
- **Inputs:** Ticketing, CSAT surveys.
- **Outputs:** Ticket clusters (root cause), CSAT trend, SLA risk, escalations.
- **Data Sources:** Zendesk/Freshdesk (mock).
- **Example Insights:** "22 tickets cluster to a single billing bug; CSAT −5% this week."
- **Actions:** Recommend fix + macro; propose customer comms (draft).
- **Required Approvals:** Customer comms, staffing changes → approval.
- **Risk Level:** Low · **Business Impact:** High.

### 2.9 Finance Agent
- **Mission:** Protect cash and financial health.
- **Responsibilities:** Cash-flow signals, AR/overdue invoices, burn/runway, budget variance.
- **Inputs:** Accounting/billing.
- **Outputs:** Runway, overdue AR, variance alerts, cash-risk register.
- **Data Sources:** QuickBooks/Xero/Stripe (mock).
- **Example Insights:** "$180k AR overdue >30 days; runway 11 months and shortening."
- **Actions:** Recommend invoice review/collections outreach (proposal only).
- **Required Approvals:** **All financial actions, refunds, invoice approvals** → approval.
- **Risk Level:** High · **Business Impact:** Very High.

### 2.10 Knowledge Agent
- **Mission:** Turn institutional knowledge into answers.
- **Responsibilities:** Index policies/runbooks/notes; answer with citations; surface relevant docs to other agents (RAG-ready).
- **Inputs:** Knowledge base (policies, procedures, meeting notes, runbooks, playbooks, product docs).
- **Outputs:** Cited answers, related-document suggestions, gaps in documentation.
- **Data Sources:** Confluence/Google Workspace/M365 (mock) + internal KB.
- **Example Insights:** "Refund policy last updated 14 months ago; 3 tickets referenced outdated terms."
- **Actions:** Recommend doc updates; provide cited answers to leaders.
- **Required Approvals:** Publishing/altering official docs → approval.
- **Risk Level:** Low · **Business Impact:** Medium.

---

## 3. Insight & Confidence Model

- **Confidence (0–100)** blends data completeness, signal strength, and rule/model certainty. Displayed on every insight; low-confidence insights are visually de-emphasized and never auto-prioritized.
- **Severity:** info · low · medium · high · critical — drives ordering in the executive action queue.
- **Evidence:** each insight links to the underlying entities (deal, ticket, PR, invoice) so a human can verify.

## 4. Risk Tiering & Approval Matrix

| Agent | Risk | Consequential actions (always require approval) |
|---|---|---|
| CEO | Med | Escalations, external comms |
| Operations | Med | Resourcing, vendor changes |
| Engineering | Med | Escalations, scope changes (never deploys) |
| Product | Low | Roadmap commitments |
| Sales | Med | Any customer messaging |
| Marketing | Low | Budget/spend, external content |
| Customer Success | Med | Customer communications |
| Support | Low | Customer comms, staffing |
| Finance | High | Any financial action, refunds, invoice approvals |
| Knowledge | Low | Publishing official docs |

## 5. Agent Lifecycle

1. **Schedule/trigger** (cron-like or on data change).
2. **Fetch** normalized inputs (tenant-scoped).
3. **Analyze** → produce insights (with evidence + confidence).
4. **Recommend** → produce actions; flag consequential ones for approval.
5. **Publish** to insight store; **CEO Agent** aggregates.
6. **Audit** run + outputs.
7. **Feedback loop** — human accept/decline is captured to improve future recommendations (future: closed-loop learning).

## 6. Extensibility

New agents implement the `Agent` contract and register in `lib/agents/registry`. Industry packs (see `showcase`) can add domain agents (e.g., a Claims Agent for insurance) without touching the core.
