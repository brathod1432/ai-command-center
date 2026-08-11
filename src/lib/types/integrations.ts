import { z } from "zod";

/** Integration adapter contracts. See docs/integration-guide.md. */

export const IntegrationCategorySchema = z.enum([
  "source",
  "issues",
  "docs",
  "chat",
  "crm",
  "support",
  "accounting",
  "analytics",
]);
export type IntegrationCategory = z.infer<typeof IntegrationCategorySchema>;

export const HealthStatusSchema = z.enum(["ok", "degraded", "rate_limited", "disconnected"]);
export type HealthStatus = z.infer<typeof HealthStatusSchema>;

export const IntegrationSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: IntegrationCategorySchema,
  connected: z.boolean(),
  status: HealthStatusSchema,
  capabilities: z.array(z.string()),
  lastSync: z.string().optional(),
  feedsAgents: z.array(z.string()),
});
export type Integration = z.infer<typeof IntegrationSchema>;

/** The interface every real/mock provider implements. */
export interface IntegrationProvider {
  id: string;
  category: IntegrationCategory;
  capabilities: string[];
  healthCheck(): Promise<HealthStatus>;
  listEntities<T = unknown>(type: string): Promise<T[]>;
  /**
   * Mutating actions require a governance approvalId. Agents never call this
   * (see docs/ai-safety.md §5). Optional because most providers are read-only
   * in the reference build.
   */
  performAction?(action: { type: string; approvalId: string; payload?: unknown }): Promise<{ ok: boolean }>;
}
