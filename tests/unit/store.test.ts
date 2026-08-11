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

  it("maintains a verifiable tamper-evident audit chain", () => {
    // Generate several audit-writing operations, then verify the chain.
    store.assignAction({ tenantId: TENANT, actionId: "act_ar_collections", owner: "Finance", actorId: "u", actorRole: "owner" });
    const status = store.verifyAudit(TENANT);
    expect(status.ok).toBe(true);
    expect(status.count).toBeGreaterThan(0);
  });
});
