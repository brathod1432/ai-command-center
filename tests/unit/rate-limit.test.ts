import { __resetRateLimiter, rateLimit } from "@/lib/security/rate-limit";

describe("rate limiter", () => {
  beforeEach(() => __resetRateLimiter());

  it("allows requests up to the limit then blocks", () => {
    const key = "test:client";
    const limit = 5;
    for (let i = 0; i < limit; i++) {
      expect(rateLimit(key, limit, 60_000).ok).toBe(true);
    }
    const blocked = rateLimit(key, limit, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });

  it("tracks separate keys independently", () => {
    expect(rateLimit("a", 1, 60_000).ok).toBe(true);
    expect(rateLimit("a", 1, 60_000).ok).toBe(false);
    expect(rateLimit("b", 1, 60_000).ok).toBe(true);
  });
});
