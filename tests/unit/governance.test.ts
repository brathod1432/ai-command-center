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

  // INVARIANT: a valid approval transitions status and always emits an audit record.
  it("approves with an authorized role and emits an immutable audit record", () => {
    const now = new Date("2026-08-11T10:00:00.000Z");
    const { action, audit } = decide({
      action: makeAction(),
      decision: "approved",
      actorId: "u_owner",
      actorRole: "owner",
      reason: "Cash flow priority",
      now,
    });

    expect(action.status).toBe("approved");
    expect(audit.category).toBe("approval");
    expect(audit.outcome).toBe("approved");
    expect(audit.tier).toBe("T3");
    expect(audit.actorRole).toBe("owner");
    expect(audit.insightId).toBe("ins_1");
    expect(audit.reason).toBe("Cash flow priority");
    expect(new Date(audit.timestamp).toISOString()).toBe(now.toISOString());
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
