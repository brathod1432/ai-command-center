/**
 * @jest-environment node
 */
import {
  SESSION_ABSOLUTE_TTL_SECONDS,
  SESSION_TTL_SECONDS,
  newSessionPayload,
  refreshedPayload,
  signSession,
  verifySession,
  type SessionPayload,
} from "@/lib/auth/session";

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

  it("rejects a session past its absolute cap even if idle expiry is valid", async () => {
    const now = Math.floor(Date.now() / 1000);
    const token = await signSession(payload({ exp: now + 3600, absExp: now - 10 }));
    expect(await verifySession(token)).toBeNull();
  });
});

describe("session lifecycle", () => {
  it("newSessionPayload sets idle and absolute expiries", () => {
    const p = newSessionPayload({ userId: "u", tenantId: "acme", role: "executive", name: "N", email: "e@example.com" });
    expect(p.exp - (p.iat ?? 0)).toBe(SESSION_TTL_SECONDS);
    expect((p.absExp ?? 0) - (p.iat ?? 0)).toBe(SESSION_ABSOLUTE_TTL_SECONDS);
  });

  it("sliding refresh extends idle expiry after activity", () => {
    const base = 1_000_000;
    const p = payload({ iat: base, exp: base + SESSION_TTL_SECONDS, absExp: base + SESSION_ABSOLUTE_TTL_SECONDS });
    const refreshed = refreshedPayload(p, (base + 120) * 1000);
    expect(refreshed).not.toBeNull();
    expect(refreshed!.exp).toBeGreaterThan(p.exp);
  });

  it("sliding refresh is capped by the absolute expiry", () => {
    const base = 1_000_000;
    const abs = base + SESSION_ABSOLUTE_TTL_SECONDS;
    const near = abs - 10; // within cap but close
    const p = payload({ iat: base, exp: base + SESSION_TTL_SECONDS, absExp: abs });
    const refreshed = refreshedPayload(p, near * 1000);
    expect(refreshed!.exp).toBe(abs);
  });

  it("returns null once the absolute cap is reached", () => {
    const base = 1_000_000;
    const abs = base + SESSION_ABSOLUTE_TTL_SECONDS;
    const p = payload({ iat: base, exp: base + SESSION_TTL_SECONDS, absExp: abs });
    expect(refreshedPayload(p, (abs + 5) * 1000)).toBeNull();
  });
});
