/**
 * @jest-environment node
 */
import { GENESIS_HASH, computeHash, verifyChain } from "@/lib/governance/audit-chain";
import type { AuditRecord } from "@/lib/types";

function build(actions: string[]): AuditRecord[] {
  let prev = GENESIS_HASH;
  const out: AuditRecord[] = [];
  actions.forEach((action, i) => {
    const withPrev = {
      id: `aud_${i}`,
      tenantId: "acme",
      timestamp: `2026-08-11T0${i}:00:00.000Z`,
      actorId: "u1",
      actorRole: "owner" as const,
      category: "approval" as const,
      action,
      tier: "T1" as const,
      outcome: "approved" as const,
      prevHash: prev,
    };
    const hash = computeHash(withPrev);
    out.push({ ...withPrev, hash });
    prev = hash;
  });
  return out;
}

describe("audit hash chain", () => {
  it("verifies an intact chain", () => {
    const chain = build(["a", "b", "c"]);
    expect(verifyChain(chain)).toEqual({ ok: true, count: 3 });
  });

  it("detects a tampered field", () => {
    const chain = build(["a", "b", "c"]);
    chain[1] = { ...chain[1], action: "tampered" };
    const result = verifyChain(chain);
    expect(result.ok).toBe(false);
    expect(result.brokenAt).toBe("aud_1");
  });

  it("detects a reordered/inserted record", () => {
    const chain = build(["a", "b", "c"]);
    const swapped = [chain[0], chain[2], chain[1]];
    expect(verifyChain(swapped).ok).toBe(false);
  });

  it("treats an empty chain as valid", () => {
    expect(verifyChain([])).toEqual({ ok: true, count: 0 });
  });
});
