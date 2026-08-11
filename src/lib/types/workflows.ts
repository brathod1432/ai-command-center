import { z } from "zod";
import { DomainSchema, ActionTierSchema, RoleSchema } from "./index";

/** Workflow engine contracts. See docs/architecture.md and Phase 9. */

export const WorkflowStepTypeSchema = z.enum(["trigger", "analyze", "decision", "approval", "notify", "record"]);
export type WorkflowStepType = z.infer<typeof WorkflowStepTypeSchema>;

export const WorkflowStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: WorkflowStepTypeSchema,
  description: z.string(),
  // For approval steps: which role must approve and at what tier.
  approverRole: RoleSchema.optional(),
  tier: ActionTierSchema.optional(),
});
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

export const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: DomainSchema,
  description: z.string(),
  trigger: z.string(),
  requiresApproval: z.boolean(),
  steps: z.array(WorkflowStepSchema).min(1),
  enabled: z.boolean().default(true),
});
export type Workflow = z.infer<typeof WorkflowSchema>;

export const WorkflowRunStatusSchema = z.enum(["running", "awaiting_approval", "completed", "failed"]);
export type WorkflowRunStatus = z.infer<typeof WorkflowRunStatusSchema>;

export const WorkflowRunStepSchema = z.object({
  stepId: z.string(),
  name: z.string(),
  status: z.enum(["pending", "running", "done", "awaiting_approval", "skipped"]),
  detail: z.string().optional(),
});
export type WorkflowRunStep = z.infer<typeof WorkflowRunStepSchema>;

export const WorkflowRunSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  workflowId: z.string(),
  status: WorkflowRunStatusSchema,
  startedAt: z.string(),
  steps: z.array(WorkflowRunStepSchema),
});
export type WorkflowRun = z.infer<typeof WorkflowRunSchema>;
