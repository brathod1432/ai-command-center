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
});
