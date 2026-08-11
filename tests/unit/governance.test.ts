import { ApprovalError, classifyTier, decide, requiresApproval } from "@/lib/governance";
import type { ProposedAction } from "@/lib/types";

function makeAction(overrides: Partial<ProposedAction> = {}): ProposedAction {
  return {
    id: "act_1",
    tenantId: "acme",
    agentId: "finance",
    domain: "finance",
    insightId: "ins_1",
    title: "Approve collections outreach",
    description: "desc",
    expectedImpact: "recover AR",
    category: "financial",
    tier: "T3",
    requiresApproval: true,
    suggestedOwnerRole: "owner",
    status: "pending_approval",
    createdAt: "2026-08-11T00:00:00.000Z",
    ...overrides,
  };
}

describe("governance", () => {
  it("classifies categories into risk tiers", () => {
    expect(classifyTier("informational")).toBe("T0");
    expect(classifyTier("roadmap")).toBe("T1");
    expect(classifyTier("customer_messaging")).toBe("T2");
    expect(classifyTier("financial")).toBe("T3");
    expect(classifyTier("legal")).toBe("T3");
    expect(classifyTier("access")).toBe("T3");
  });

  it("marks only T1+ as requiring approval", () => {
    expect(requiresApproval("T0")).toBe(false);
    expect(requiresApproval("T1")).toBe(true);
    expect(requiresApproval("T3")).toBe(true);
  });

  // INVARIANT: a consequential action cannot be approved by a non-approver role.
  it("rejects approval by a role without authority", () => {
    expect(() =>
      decide({
        action: makeAction({ tier: "T2", category: "customer_messaging" }),
        decision: "approved",
        actorId: "u1",
        actorRole: "viewer",
      }),
    ).toThrow(ApprovalError);
  });

  // INVARIANT: declines and T3 approvals require a reason.
  it("requires a reason for T3 approvals and for declines", () => {
    expect(() =>
      decide({ action: makeAction(), decision: "approved", actorId: "u1", actorRole: "owner" }),
    ).toThrow(/reason is required/i);

    expect(() =>
      decide({
        action: makeAction({ tier: "T1", category: "resourcing" }),
        decision: "declined",
        actorId: "u1",
        actorRole: "manager",
      }),
    ).toThrow(/reason is required/i);
  });

  // INVARIANT: T3 requires TWO distinct approvers (dual control).
  it("does not finalize a T3 action on the first approval", () => {
    const { action, audit } = decide({
      action: makeAction(), // T3 financial
      decision: "approved",
      actorId: "u_owner",
      actorRole: "owner",
      reason: "Cash flow priority",
    });
    expect(action.status).toBe("pending_approval"); // not finalized yet
    expect(action.approvals).toEqual(["u_owner"]);
    expect(audit.outcome).toBe("info"); // partial approval is informational
    expect(audit.action).toContain("approve(1/2)");
  });

  it("finalizes a T3 action only after a second, distinct approver", () => {
    const first = decide({
      action: makeAction(),
      decision: "approved",
      actorId: "u_owner",
      actorRole: "owner",
      reason: "Cash flow priority",
    });
    const { action, audit } = decide({
      action: first.action,
      decision: "approved",
      actorId: "u_cfo",
      actorRole: "admin",
      reason: "Confirmed",
    });
    expect(action.status).toBe("approved");
    expect(action.approvals).toEqual(["u_owner", "u_cfo"]);
    expect(audit.outcome).toBe("approved");
    expect(audit.action).toContain("approve(2/2)");
  });

  it("rejects the same approver supplying both approvals", () => {
    const first = decide({
      action: makeAction(),
      decision: "approved",
      actorId: "u_owner",
      actorRole: "owner",
      reason: "Cash flow priority",
    });
    expect(() =>
      decide({ action: first.action, decision: "approved", actorId: "u_owner", actorRole: "owner", reason: "again" }),
    ).toThrow(/already approved/i);
  });

  // T1/T2 remain single-approval.
  it("finalizes a single-approver action immediately", () => {
    const { action, audit } = decide({
      action: makeAction({ tier: "T1", category: "resourcing" }),
      decision: "approved",
      actorId: "u_manager",
      actorRole: "manager",
    });
    expect(action.status).toBe("approved");
    expect(audit.outcome).toBe("approved");
  });

  it("records a decline outcome with reason", () => {
    const { action, audit } = decide({
      action: makeAction({ tier: "T2", category: "customer_messaging" }),
      decision: "declined",
      actorId: "u_exec",
      actorRole: "executive",
      reason: "Not now",
    });
    expect(action.status).toBe("declined");
    expect(audit.outcome).toBe("declined");
  });
});
