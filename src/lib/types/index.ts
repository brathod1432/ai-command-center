import { z } from "zod";

/**
 * Helm domain contracts. Zod is the single source of truth; TypeScript types
 * are inferred and shared across UI, API, agents, and tests.
 * See docs/architecture.md §7 and docs/ai-safety.md §5.
 */

// ---------------------------------------------------------------------------
// Foundational enums
// ---------------------------------------------------------------------------

export const DomainSchema = z.enum([
  "executive",
  "operations",
  "engineering",
  "product",
  "sales",
  "marketing",
  "customer_success",
  "support",
  "finance",
  "knowledge",
]);
export type Domain = z.infer<typeof DomainSchema>;

export const SeveritySchema = z.enum(["info", "low", "medium", "high", "critical"]);
export type Severity = z.infer<typeof SeveritySchema>;

export const RiskLevelSchema = z.enum(["low", "medium", "high"]);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

// Governance action tiers. See docs/governance.md §3.
export const ActionTierSchema = z.enum(["T0", "T1", "T2", "T3"]);
export type ActionTier = z.infer<typeof ActionTierSchema>;

export const ActionCategorySchema = z.enum([
  "informational",
  "deployment",
  "customer_messaging",
  "financial",
  "legal",
  "access",
  "data",
  "resourcing",
  "roadmap",
]);
export type ActionCategory = z.infer<typeof ActionCategorySchema>;

export const ActionStatusSchema = z.enum([
  "proposed",
  "pending_approval",
  "approved",
  "declined",
  "changes_requested",
  "closed",
]);
export type ActionStatus = z.infer<typeof ActionStatusSchema>;

// ---------------------------------------------------------------------------
// RBAC
// ---------------------------------------------------------------------------

export const RoleSchema = z.enum([
  "owner",
  "admin",
  "executive",
  "manager",
  "analyst",
  "viewer",
  "auditor",
]);
export type Role = z.infer<typeof RoleSchema>;

export const PermissionSchema = z.enum([
  "dashboard:read",
  "agent:read",
  "agent:run",
  "insight:read",
  "action:propose",
  "action:approve",
  "action:decline",
  "integration:read",
  "integration:manage",
  "user:read",
  "user:manage",
  "role:manage",
  "audit:read",
  "settings:manage",
  "knowledge:read",
  "knowledge:publish",
  "workflow:read",
  "workflow:run",
]);
export type Permission = z.infer<typeof PermissionSchema>;

// ---------------------------------------------------------------------------
// Tenant / User / Session
// ---------------------------------------------------------------------------

export const TenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  industry: z.string(),
  plan: z.enum(["starter", "growth", "enterprise"]).default("growth"),
});
export type Tenant = z.infer<typeof TenantSchema>;

export const UserSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: RoleSchema,
  title: z.string().optional(),
});
export type User = z.infer<typeof UserSchema>;

export const SessionSchema = z.object({
  userId: z.string(),
  tenantId: z.string(),
  role: RoleSchema,
  issuedAt: z.string(),
  expiresAt: z.string(),
});
export type Session = z.infer<typeof SessionSchema>;

// ---------------------------------------------------------------------------
// Insights (explainability: evidence + confidence). See docs/ai-safety.md §3.
// ---------------------------------------------------------------------------

export const EvidenceSchema = z.object({
  label: z.string(),
  sourceType: z.string(), // e.g. "deal" | "ticket" | "pull_request" | "invoice"
  sourceId: z.string(),
  provider: z.string().optional(), // e.g. "salesforce"
});
export type Evidence = z.infer<typeof EvidenceSchema>;

export const InsightSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  agentId: z.string(),
  domain: DomainSchema,
  title: z.string(),
  narrative: z.string(),
  severity: SeveritySchema,
  confidence: z.number().int().min(0).max(100),
  evidence: z.array(EvidenceSchema).min(1, "insights must cite at least one piece of evidence"),
  createdAt: z.string(),
});
export type Insight = z.infer<typeof InsightSchema>;

// ---------------------------------------------------------------------------
// Actions / Approvals / Audit (governance). See docs/governance.md.
// ---------------------------------------------------------------------------

export const ProposedActionSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  agentId: z.string(),
  domain: DomainSchema,
  insightId: z.string(),
  title: z.string(),
  description: z.string(),
  expectedImpact: z.string(),
  category: ActionCategorySchema,
  tier: ActionTierSchema,
  requiresApproval: z.boolean(),
  suggestedOwnerRole: RoleSchema,
  status: ActionStatusSchema.default("proposed"),
  createdAt: z.string(),
  // Lifecycle (post-approval follow-through).
  owner: z.string().optional(),
  dueDate: z.string().optional(),
  completedAt: z.string().optional(),
});
export type ProposedAction = z.infer<typeof ProposedActionSchema>;

/** A comment on an action (collaboration + audit context). */
export const ActionCommentSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  actionId: z.string(),
  authorId: z.string(),
  authorRole: RoleSchema,
  body: z.string().min(1).max(2000),
  createdAt: z.string(),
});
export type ActionComment = z.infer<typeof ActionCommentSchema>;

/** Discriminated update operations for an action (validated at the API boundary). */
export const ActionUpdateInputSchema = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("assign"),
    actionId: z.string().min(1).max(64),
    owner: z.string().min(1).max(120),
    dueDate: z.string().max(40).optional(),
  }),
  z.object({ op: z.literal("complete"), actionId: z.string().min(1).max(64) }),
  z.object({ op: z.literal("comment"), actionId: z.string().min(1).max(64), body: z.string().min(1).max(2000) }),
]);
export type ActionUpdateInput = z.infer<typeof ActionUpdateInputSchema>;

export const ApprovalDecisionSchema = z.enum(["approved", "declined", "changes_requested"]);
export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;

// Input schema for an approval decision (validated at the API boundary).
export const ApprovalInputSchema = z.object({
  actionId: z.string().min(1).max(64),
  decision: ApprovalDecisionSchema,
  reason: z.string().max(2000).optional(),
});
export type ApprovalInput = z.infer<typeof ApprovalInputSchema>;

export const AuditRecordSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  timestamp: z.string(),
  actorId: z.string(),
  actorRole: RoleSchema,
  category: z.enum(["approval", "auth", "permission", "data", "agent", "system"]),
  action: z.string(),
  tier: ActionTierSchema,
  outcome: z.enum(["approved", "declined", "changes_requested", "info"]),
  reason: z.string().optional(),
  insightId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  // Tamper-evidence: SHA-256 chain. See docs/improvements-v2.md §4 (S1).
  prevHash: z.string().optional(),
  hash: z.string().optional(),
});
export type AuditRecord = z.infer<typeof AuditRecordSchema>;

// ---------------------------------------------------------------------------
// KPI / metrics
// ---------------------------------------------------------------------------

export const KpiSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number(),
  unit: z.enum(["currency", "number", "percent"]).default("number"),
  deltaPct: z.number(), // period-over-period change, percentage points
  trend: z.array(z.number()), // sparkline series
  domain: DomainSchema,
  goodDirection: z.enum(["up", "down"]).default("up"),
});
export type Kpi = z.infer<typeof KpiSchema>;

// ---------------------------------------------------------------------------
// Business entities (normalized across integrations). See integration-guide.md.
// ---------------------------------------------------------------------------

export const DealSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  account: z.string(),
  amount: z.number(),
  stage: z.enum(["prospect", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]),
  owner: z.string(),
  lastActivityDays: z.number(),
  probability: z.number().min(0).max(1),
});
export type Deal = z.infer<typeof DealSchema>;

export const TicketSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  subject: z.string(),
  account: z.string(),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  status: z.enum(["open", "pending", "solved", "closed"]),
  cluster: z.string().optional(),
  csat: z.number().min(0).max(5).optional(),
  ageHours: z.number(),
});
export type Ticket = z.infer<typeof TicketSchema>;

export const PullRequestSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  title: z.string(),
  author: z.string(),
  status: z.enum(["open", "review", "merged", "closed"]),
  reviewLatencyHours: z.number(),
  additions: z.number(),
  deletions: z.number(),
});
export type PullRequest = z.infer<typeof PullRequestSchema>;

export const SprintSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  committedPoints: z.number(),
  completedPoints: z.number(),
  daysRemaining: z.number(),
  atRisk: z.boolean(),
});
export type Sprint = z.infer<typeof SprintSchema>;

export const InvoiceSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  account: z.string(),
  amount: z.number(),
  status: z.enum(["draft", "sent", "paid", "overdue"]),
  daysOverdue: z.number(),
});
export type Invoice = z.infer<typeof InvoiceSchema>;

export const CustomerSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  arr: z.number(),
  healthScore: z.number().min(0).max(100),
  usageTrendPct: z.number(),
  renewalInDays: z.number(),
  churnRisk: z.enum(["low", "medium", "high"]),
});
export type Customer = z.infer<typeof CustomerSchema>;

export const CampaignSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  channel: z.enum(["paid", "organic", "email", "social", "events"]),
  spend: z.number(),
  leads: z.number(),
  cac: z.number(),
  conversionPct: z.number(),
});
export type Campaign = z.infer<typeof CampaignSchema>;

// ---------------------------------------------------------------------------
// Knowledge. See docs/knowledge-architecture.md.
// ---------------------------------------------------------------------------

export const KnowledgeDocSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  type: z.enum(["policy", "procedure", "meeting_note", "runbook", "architecture", "playbook", "product_doc"]),
  title: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
  owner: z.string(),
  version: z.number(),
  status: z.enum(["draft", "published", "archived"]),
  updatedAt: z.string(),
});
export type KnowledgeDoc = z.infer<typeof KnowledgeDocSchema>;

// ---------------------------------------------------------------------------
// Company health (executive)
// ---------------------------------------------------------------------------

export const CompanyHealthSchema = z.object({
  score: z.number().min(0).max(100),
  label: z.enum(["excellent", "healthy", "watch", "at_risk", "critical"]),
  summary: z.string(),
  pillars: z.array(
    z.object({
      domain: DomainSchema,
      score: z.number().min(0).max(100),
      note: z.string(),
    }),
  ),
});
export type CompanyHealth = z.infer<typeof CompanyHealthSchema>;

// ---------------------------------------------------------------------------
// API envelope
// ---------------------------------------------------------------------------

export const ApiErrorSchema = z.object({
  error: z.string(),
  correlationId: z.string().optional(),
  details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
