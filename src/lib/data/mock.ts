import type {
  CompanyHealth,
  Insight,
  Kpi,
  ProposedAction,
  Tenant,
  User,
} from "@/lib/types";

/**
 * Deterministic seed data for the reference build. No network, reproducible in
 * tests and demos. See docs/integration-guide.md (mock providers).
 */

export const TENANT: Tenant = {
  id: "acme",
  name: "Acme Cloud",
  industry: "Technology Startup",
  plan: "growth",
};

export const DEMO_USER: User = {
  id: "u_founder",
  tenantId: TENANT.id,
  name: "Jordan Avery",
  email: "founder@example.com",
  role: "executive",
  title: "Founder & CEO",
};

/** Illustrative team roster for the admin Team view. */
export const DEMO_TEAM: User[] = [
  { id: "u_owner", tenantId: TENANT.id, name: "Jordan Avery", email: "jordan@example.com", role: "owner", title: "Founder & CEO" },
  { id: "u_admin", tenantId: TENANT.id, name: "Riley Chen", email: "riley@example.com", role: "admin", title: "Head of Operations" },
  { id: "u_exec", tenantId: TENANT.id, name: "Sam Okafor", email: "sam@example.com", role: "executive", title: "COO" },
  { id: "u_mgr_eng", tenantId: TENANT.id, name: "Priya Nair", email: "priya@example.com", role: "manager", title: "Engineering Manager" },
  { id: "u_mgr_sales", tenantId: TENANT.id, name: "Diego Alvarez", email: "diego@example.com", role: "manager", title: "Sales Director" },
  { id: "u_analyst", tenantId: TENANT.id, name: "Mia Rossi", email: "mia@example.com", role: "analyst", title: "Business Analyst" },
  { id: "u_viewer", tenantId: TENANT.id, name: "Tom Becker", email: "tom@example.com", role: "viewer", title: "Board Observer" },
  { id: "u_auditor", tenantId: TENANT.id, name: "Grace Kim", email: "grace@example.com", role: "auditor", title: "Compliance Auditor" },
];

export const COMPANY_HEALTH: CompanyHealth = {
  score: 78,
  label: "healthy",
  summary:
    "Revenue is up 18% MoM and growth is healthy, but two enterprise accounts are trending to churn and Sprint 24 is at risk. Support CSAT slipped 5% on a billing issue cluster.",
  pillars: [
    { domain: "sales", score: 82, note: "Pipeline strong; forecast slightly below target." },
    { domain: "engineering", score: 68, note: "Sprint 24 goal at risk; review latency up." },
    { domain: "customer_success", score: 64, note: "2 enterprise accounts at churn risk." },
    { domain: "support", score: 71, note: "Ticket spike from a billing bug; CSAT -5%." },
    { domain: "finance", score: 85, note: "Runway 11 months; some overdue AR." },
  ],
};

export const KPIS: Kpi[] = [
  {
    id: "mrr",
    label: "Monthly Recurring Revenue",
    value: 486_000,
    unit: "currency",
    deltaPct: 18,
    trend: [360, 372, 388, 401, 420, 447, 468, 486],
    domain: "finance",
    goodDirection: "up",
  },
  {
    id: "net_new_arr",
    label: "Net New ARR (QTD)",
    value: 1_240_000,
    unit: "currency",
    deltaPct: 12,
    trend: [820, 900, 970, 1010, 1080, 1140, 1200, 1240],
    domain: "sales",
    goodDirection: "up",
  },
  {
    id: "churn_risk",
    label: "ARR at Churn Risk",
    value: 320_000,
    unit: "currency",
    deltaPct: 9,
    trend: [180, 190, 210, 230, 260, 280, 300, 320],
    domain: "customer_success",
    goodDirection: "down",
  },
  {
    id: "csat",
    label: "CSAT (7-day)",
    value: 91,
    unit: "percent",
    deltaPct: -5,
    trend: [96, 96, 95, 95, 94, 93, 92, 91],
    domain: "support",
    goodDirection: "up",
  },
  {
    id: "sprint_completion",
    label: "Sprint Completion",
    value: 61,
    unit: "percent",
    deltaPct: -14,
    trend: [88, 90, 85, 83, 80, 74, 68, 61],
    domain: "engineering",
    goodDirection: "up",
  },
  {
    id: "runway",
    label: "Cash Runway (months)",
    value: 11,
    unit: "number",
    deltaPct: -8,
    trend: [14, 14, 13, 13, 12, 12, 11, 11],
    domain: "finance",
    goodDirection: "up",
  },
];

export const INSIGHTS: Insight[] = [
  {
    id: "ins_churn",
    tenantId: TENANT.id,
    agentId: "customer_success",
    domain: "customer_success",
    title: "Two enterprise accounts trending to churn",
    narrative:
      "Accounts Northwind and Globex show a 45% usage drop over 30 days with two open escalations each. Combined ARR at risk is $320k.",
    severity: "high",
    confidence: 82,
    evidence: [
      { label: "Northwind usage -47%", sourceType: "customer", sourceId: "cus_northwind", provider: "salesforce" },
      { label: "Globex escalations x2", sourceType: "ticket", sourceId: "tkt_globex_1", provider: "zendesk" },
    ],
    createdAt: "2026-08-11T08:00:00.000Z",
  },
  {
    id: "ins_sprint",
    tenantId: TENANT.id,
    agentId: "engineering",
    domain: "engineering",
    title: "Sprint 24 goal at risk",
    narrative:
      "40% of committed scope is still open with 3 days left, and PR review latency has doubled to 18h. The sprint goal is unlikely to be met without scope adjustment.",
    severity: "high",
    confidence: 76,
    evidence: [
      { label: "Sprint 24: 61% complete", sourceType: "sprint", sourceId: "spr_24", provider: "jira" },
      { label: "Review latency 18h", sourceType: "pull_request", sourceId: "pr_avg", provider: "github" },
    ],
    createdAt: "2026-08-11T08:05:00.000Z",
  },
  {
    id: "ins_billing_cluster",
    tenantId: TENANT.id,
    agentId: "support",
    domain: "support",
    title: "Ticket spike clusters to a single billing bug",
    narrative:
      "22 tickets this week cluster to a billing calculation error. CSAT dropped 5%. A targeted fix plus customer comms would likely resolve the cluster.",
    severity: "medium",
    confidence: 88,
    evidence: [
      { label: "22 tickets, cluster: billing-calc", sourceType: "ticket", sourceId: "cluster_billing", provider: "zendesk" },
    ],
    createdAt: "2026-08-11T08:10:00.000Z",
  },
  {
    id: "ins_ar",
    tenantId: TENANT.id,
    agentId: "finance",
    domain: "finance",
    title: "$180k in accounts receivable overdue >30 days",
    narrative:
      "Overdue AR has grown to $180k across 6 invoices. Runway is 11 months and shortening; collections outreach is recommended.",
    severity: "medium",
    confidence: 84,
    evidence: [
      { label: "6 invoices overdue >30d", sourceType: "invoice", sourceId: "ar_overdue", provider: "stripe" },
    ],
    createdAt: "2026-08-11T08:15:00.000Z",
  },
];

export const ACTIONS: ProposedAction[] = [
  {
    id: "act_churn_outreach",
    tenantId: TENANT.id,
    agentId: "customer_success",
    domain: "customer_success",
    insightId: "ins_churn",
    title: "Approve executive outreach to Northwind & Globex",
    description:
      "Send a founder-level check-in and schedule a QBR for both at-risk accounts. Draft messaging prepared for review.",
    expectedImpact: "Protect $320k ARR at risk",
    category: "customer_messaging",
    tier: "T2",
    requiresApproval: true,
    suggestedOwnerRole: "manager",
    status: "pending_approval",
    createdAt: "2026-08-11T08:20:00.000Z",
  },
  {
    id: "act_sprint_escalation",
    tenantId: TENANT.id,
    agentId: "engineering",
    domain: "engineering",
    insightId: "ins_sprint",
    title: "Approve Sprint 24 scope-cut escalation",
    description:
      "Escalate to the EM to cut two lower-priority stories and reallocate review capacity.",
    expectedImpact: "Increase sprint goal likelihood to ~85%",
    category: "resourcing",
    tier: "T1",
    requiresApproval: true,
    suggestedOwnerRole: "manager",
    status: "pending_approval",
    createdAt: "2026-08-11T08:22:00.000Z",
  },
  {
    id: "act_ar_collections",
    tenantId: TENANT.id,
    agentId: "finance",
    domain: "finance",
    insightId: "ins_ar",
    title: "Approve collections outreach on overdue AR",
    description:
      "Authorize finance to begin collections outreach on 6 overdue invoices totaling $180k.",
    expectedImpact: "Recover up to $180k; improve runway",
    category: "financial",
    tier: "T3",
    requiresApproval: true,
    suggestedOwnerRole: "owner",
    status: "pending_approval",
    createdAt: "2026-08-11T08:24:00.000Z",
  },
];
