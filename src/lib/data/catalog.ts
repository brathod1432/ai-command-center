import type { Integration } from "@/lib/types/integrations";
import type { Workflow } from "@/lib/types/workflows";
import type { KnowledgeDoc } from "@/lib/types";

/** Deterministic catalog data for workflows, integrations, knowledge, industries. */

export const WORKFLOWS: Workflow[] = [
  {
    id: "wf_churn",
    name: "Customer Churn Detection",
    domain: "customer_success",
    description: "Detect accounts trending to churn and route outreach for approval.",
    trigger: "Daily usage + support signal scan",
    requiresApproval: true,
    enabled: true,
    steps: [
      { id: "s1", name: "Scan usage & tickets", type: "trigger", description: "Aggregate usage drop and escalations." },
      { id: "s2", name: "Score churn risk", type: "analyze", description: "CS Agent scores accounts." },
      { id: "s3", name: "Draft outreach", type: "analyze", description: "Prepare messaging for review." },
      { id: "s4", name: "Approve outreach", type: "approval", description: "Human approves before any send.", approverRole: "manager", tier: "T2" },
      { id: "s5", name: "Record decision", type: "record", description: "Write to the audit trail." },
    ],
  },
  {
    id: "wf_sprint",
    name: "Sprint Risk Reporting",
    domain: "engineering",
    description: "Flag sprint-goal risk and propose an escalation.",
    trigger: "Sprint burndown deviation",
    requiresApproval: true,
    enabled: true,
    steps: [
      { id: "s1", name: "Analyze burndown", type: "trigger", description: "Detect scope/velocity risk." },
      { id: "s2", name: "Assess sprint", type: "analyze", description: "Engineering Agent evaluates goal likelihood." },
      { id: "s3", name: "Approve escalation", type: "approval", description: "EM approves scope changes.", approverRole: "manager", tier: "T1" },
      { id: "s4", name: "Record decision", type: "record", description: "Write to the audit trail." },
    ],
  },
  {
    id: "wf_invoice",
    name: "Invoice / AR Review",
    domain: "finance",
    description: "Surface overdue AR and route collections outreach for approval.",
    trigger: "Overdue AR threshold crossed",
    requiresApproval: true,
    enabled: true,
    steps: [
      { id: "s1", name: "Scan AR", type: "trigger", description: "Find invoices overdue > 30 days." },
      { id: "s2", name: "Assess cash risk", type: "analyze", description: "Finance Agent quantifies impact." },
      { id: "s3", name: "Approve outreach", type: "approval", description: "Finance approver authorizes.", approverRole: "owner", tier: "T3" },
      { id: "s4", name: "Record decision", type: "record", description: "Write to the audit trail." },
    ],
  },
  {
    id: "wf_exec",
    name: "Executive Reporting",
    domain: "executive",
    description: "Compile the weekly executive briefing from all agents.",
    trigger: "Weekly schedule",
    requiresApproval: false,
    enabled: true,
    steps: [
      { id: "s1", name: "Collect insights", type: "trigger", description: "Gather all agent insights." },
      { id: "s2", name: "Summarize", type: "analyze", description: "CEO Agent drafts the narrative." },
      { id: "s3", name: "Notify", type: "notify", description: "Deliver the briefing (draft) to the leader." },
    ],
  },
];

export const INTEGRATIONS: Integration[] = [
  { id: "github", name: "GitHub", category: "source", connected: true, status: "ok", capabilities: ["read:pull_requests", "read:commits"], lastSync: "2026-08-11T08:00:00.000Z", feedsAgents: ["engineering"] },
  { id: "jira", name: "Jira", category: "issues", connected: true, status: "ok", capabilities: ["read:issues", "read:sprints"], lastSync: "2026-08-11T07:58:00.000Z", feedsAgents: ["engineering", "operations", "product"] },
  { id: "salesforce", name: "Salesforce", category: "crm", connected: true, status: "degraded", capabilities: ["read:opportunities", "read:accounts"], lastSync: "2026-08-11T06:30:00.000Z", feedsAgents: ["sales", "customer_success"] },
  { id: "zendesk", name: "Zendesk", category: "support", connected: true, status: "ok", capabilities: ["read:tickets", "read:csat"], lastSync: "2026-08-11T08:02:00.000Z", feedsAgents: ["support", "customer_success"] },
  { id: "stripe", name: "Stripe", category: "accounting", connected: true, status: "ok", capabilities: ["read:invoices", "read:balances"], lastSync: "2026-08-11T08:01:00.000Z", feedsAgents: ["finance"] },
  { id: "slack", name: "Slack", category: "chat", connected: false, status: "disconnected", capabilities: ["read:messages"], feedsAgents: ["operations"] },
  { id: "ga", name: "Google Analytics", category: "analytics", connected: true, status: "rate_limited", capabilities: ["read:sessions", "read:conversions"], lastSync: "2026-08-11T05:00:00.000Z", feedsAgents: ["marketing", "product"] },
  { id: "confluence", name: "Confluence", category: "docs", connected: false, status: "disconnected", capabilities: ["read:pages"], feedsAgents: ["knowledge"] },
];

export const KNOWLEDGE_DOCS: KnowledgeDoc[] = [
  { id: "kd_refund", tenantId: "acme", type: "policy", title: "Refund Policy", body: "Refunds are issued within 14 days for annual plans...", tags: ["billing", "policy"], owner: "Finance", version: 3, status: "published", updatedAt: "2025-06-02T00:00:00.000Z" },
  { id: "kd_incident", tenantId: "acme", type: "runbook", title: "Incident Response Runbook", body: "On detection: declare severity, assign IC, open channel...", tags: ["oncall", "sev"], owner: "Engineering", version: 7, status: "published", updatedAt: "2026-07-20T00:00:00.000Z" },
  { id: "kd_onboarding", tenantId: "acme", type: "procedure", title: "Customer Onboarding", body: "Kickoff within 3 business days; success plan in 7...", tags: ["cs", "onboarding"], owner: "Customer Success", version: 2, status: "published", updatedAt: "2026-05-11T00:00:00.000Z" },
  { id: "kd_sales_play", tenantId: "acme", type: "playbook", title: "Enterprise Sales Playbook", body: "Multi-thread the account; align on business value...", tags: ["sales"], owner: "Sales", version: 4, status: "published", updatedAt: "2026-04-01T00:00:00.000Z" },
];

export interface IndustryDemo {
  id: string;
  name: string;
  summary: string;
  keyAgents: string[];
  sampleInsight: string;
}

export const INDUSTRIES: IndustryDemo[] = [
  { id: "tech", name: "Technology Startup", summary: "Growth, delivery velocity, and burn are the daily concerns.", keyAgents: ["Sales Agent", "Engineering Agent", "Finance Agent"], sampleInsight: "Sprint 24 at risk while MRR grows 18% — protect delivery to sustain momentum." },
  { id: "consulting", name: "Consulting Company", summary: "Utilization, project margin, and client health drive the business.", keyAgents: ["Operations Agent", "Finance Agent", "Customer Success Agent"], sampleInsight: "Two engagements trending over-budget; utilization dipped to 68% this week." },
  { id: "msp", name: "Managed Service Provider", summary: "SLAs, ticket volume, and recurring revenue retention matter most.", keyAgents: ["Support Agent", "Operations Agent", "Finance Agent"], sampleInsight: "SLA breach risk on 3 accounts; ticket backlog up 22% after a vendor outage." },
  { id: "healthcare", name: "Healthcare Organization", summary: "Compliance, patient satisfaction, and staffing are paramount.", keyAgents: ["Operations Agent", "Support Agent", "Knowledge Agent"], sampleInsight: "Policy doc outdated 14 months; 3 tickets referenced stale guidance — governance review advised." },
  { id: "insurance", name: "Insurance Company", summary: "Claims throughput, loss ratio, and regulatory audit-readiness.", keyAgents: ["Operations Agent", "Finance Agent", "Knowledge Agent"], sampleInsight: "Claims cycle time up 12%; audit trail complete for all adjuster decisions." },
  { id: "fintech", name: "Financial Company", summary: "Cash, risk, fraud signals, and strict auditability.", keyAgents: ["Finance Agent", "Operations Agent", "Support Agent"], sampleInsight: "Overdue AR up to $180k; every approval captured for SOC 2 evidence." },
  { id: "logistics", name: "Logistics Company", summary: "On-time delivery, capacity, and cost per shipment.", keyAgents: ["Operations Agent", "Finance Agent", "Support Agent"], sampleInsight: "On-time rate slipped to 93%; two lanes over capacity this week." },
  { id: "manufacturing", name: "Manufacturing Company", summary: "Throughput, quality/defects, and supply chain reliability.", keyAgents: ["Operations Agent", "Engineering Agent", "Finance Agent"], sampleInsight: "Defect rate up 0.4pp on line 3; supplier lead time risk flagged." },
  { id: "enterprise", name: "Enterprise Internal Platform", summary: "Cross-department visibility with strict RBAC and audit.", keyAgents: ["CEO Agent", "Operations Agent", "Knowledge Agent"], sampleInsight: "Unified risk register across 6 departments; all actions role-gated and logged." },
];
