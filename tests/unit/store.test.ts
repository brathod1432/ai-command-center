import { store } from "@/lib/data/store";
import { ApprovalError } from "@/lib/governance";

const TENANT = "acme";

describe("governance store", () => {
  it("seeds tenant actions and audit", () => {
    expect(store.listActions(TENANT).length).toBeGreaterThan(0);
    expect(store.listAudit(TENANT).length).toBeGreaterThan(0);
  });

  it("records an authorized approval and writes an audit record", () => {
    const auditBefore = store.listAudit(TENANT).length;
    const { action, audit } = store.applyDecision({
      tenantId: TENANT,
      actionId: "act_sprint_escalation", // T1 — no reason required
      decision: "approved",
      actorId: "u_manager",
      actorRole: "manager",
    });
    expect(action.status).toBe("approved");
    expect(audit.outcome).toBe("approved");
    expect(store.listAudit(TENANT).length).toBe(auditBefore + 1);
  });

  // INVARIANT: unauthorized roles cannot approve consequential actions.
  it("rejects approval from a role without authority", () => {
    expect(() =>
      store.applyDecision({
        tenantId: TENANT,
        actionId: "act_churn_outreach",
        decision: "approved",
        actorId: "u_viewer",
        actorRole: "viewer",
      }),
    ).toThrow(ApprovalError);
  });

  it("throws for an unknown action", () => {
    expect(() =>
      store.applyDecision({
        tenantId: TENANT,
        actionId: "does_not_exist",
        decision: "approved",
        actorId: "u_owner",
        actorRole: "owner",
        reason: "x",
      }),
    ).toThrow("Action not found");
  });

  it("assigns an owner and marks an action complete", () => {
    const assigned = store.assignAction({
      tenantId: TENANT,
      actionId: "act_churn_outreach",
      owner: "Priya Nair",
      dueDate: "2026-08-20",
      actorId: "u_mgr",
      actorRole: "manager",
    });
    expect(assigned.owner).toBe("Priya Nair");
    expect(assigned.dueDate).toBe("2026-08-20");

    const completed = store.completeAction({
      tenantId: TENANT,
      actionId: "act_churn_outreach",
      actorId: "u_mgr",
      actorRole: "manager",
    });
    expect(completed.status).toBe("closed");
    expect(completed.completedAt).toBeTruthy();
  });

  it("adds comments to an action", () => {
    const c = store.addComment({
      tenantId: TENANT,
      actionId: "act_sprint_escalation",
      body: "Cutting two stories.",
      authorId: "u_mgr",
      authorRole: "manager",
    });
    expect(c.body).toBe("Cutting two stories.");
    expect(store.listComments(TENANT, "act_sprint_escalation").length).toBeGreaterThan(0);
  });

  it("bulk-approves several actions, respecting dual control per item", () => {
    // T1 finalizes on one approval; T3 needs a second distinct approver.
    const results = store.bulkDecision({
      tenantId: TENANT,
      actionIds: ["act_churn_outreach", "act_ar_collections"],
      decision: "approved",
      actorId: "u_owner",
      actorRole: "owner",
      reason: "batch review",
    });
    expect(results).toHaveLength(2);
    const churn = results.find((r) => r.actionId === "act_churn_outreach");
    const ar = results.find((r) => r.actionId === "act_ar_collections");
    expect(churn?.ok).toBe(true);
    expect(churn?.status).toBe("approved"); // T2 → single approval finalizes
    expect(ar?.ok).toBe(true);
    expect(ar?.status).toBe("pending_approval"); // T3 → still needs a second approver
  });

  it("captures per-item failures in a bulk decision without aborting", () => {
    const results = store.bulkDecision({
      tenantId: TENANT,
      actionIds: ["act_sprint_escalation", "does_not_exist"],
      decision: "approved",
      actorId: "u_mgr",
      actorRole: "manager",
    });
    expect(results.find((r) => r.actionId === "act_sprint_escalation")?.ok).toBe(true);
    const missing = results.find((r) => r.actionId === "does_not_exist");
    expect(missing?.ok).toBe(false);
    expect(missing?.error).toMatch(/not found/i);
  });

  it("records a denied authorization attempt and keeps the chain valid", () => {
    const before = store.listAudit(TENANT).length;
    store.recordDenied({ tenantId: TENANT, actorId: "u_viewer", actorRole: "viewer", permission: "action:approve" });
    const after = store.listAudit(TENANT);
    expect(after.length).toBe(before + 1);
    expect(after.some((r) => r.category === "permission" && r.action.startsWith("denied:"))).toBe(true);
    expect(store.verifyAudit(TENANT).ok).toBe(true);
  });

  it("maintains a verifiable tamper-evident audit chain", () => {
    // Generate several audit-writing operations, then verify the chain.
    store.assignAction({ tenantId: TENANT, actionId: "act_ar_collections", owner: "Finance", actorId: "u", actorRole: "owner" });
    const status = store.verifyAudit(TENANT);
    expect(status.ok).toBe(true);
    expect(status.count).toBeGreaterThan(0);
  });
});
