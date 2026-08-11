/**
 * @jest-environment node
 */
import { signSession, verifySession, type SessionPayload } from "@/lib/auth/session";

function payload(overrides: Partial<SessionPayload> = {}): SessionPayload {
  return {
    userId: "u_executive",
    tenantId: "acme",
    role: "executive",
    name: "Jordan Avery",
    email: "founder@example.com",
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  };
}

describe("session tokens", () => {
  it("signs and verifies a valid session", async () => {
    const token = await signSession(payload());
    const result = await verifySession(token);
    expect(result?.role).toBe("executive");
    expect(result?.tenantId).toBe("acme");
  });

  it("rejects a tampered token", async () => {
    const token = await signSession(payload());
    const tampered = token.slice(0, -2) + (token.endsWith("aa") ? "bb" : "aa");
    expect(await verifySession(tampered)).toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await signSession(payload({ exp: Math.floor(Date.now() / 1000) - 10 }));
    expect(await verifySession(token)).toBeNull();
  });

  it("rejects malformed input", async () => {
    expect(await verifySession(undefined)).toBeNull();
    expect(await verifySession("not-a-token")).toBeNull();
    expect(await verifySession("a.b.c")).toBeNull();
  });
});
