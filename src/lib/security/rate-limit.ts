/**
 * In-memory token-bucket rate limiter. Pluggable interface so a distributed
 * store (e.g., Redis) can replace it in production. See docs/security-model.md §7.
 */

interface Bucket {
  tokens: number;
  updatedAt: number;
}

const store = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * @param key       unique identifier (e.g., `login:1.2.3.4`)
 * @param limit     max requests per window
 * @param windowMs  window size in milliseconds
 */
export function rateLimit(key: string, limit = 30, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  const refillPerMs = limit / windowMs;
  const existing = store.get(key);

  if (!existing) {
    store.set(key, { tokens: limit - 1, updatedAt: now });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  // Refill based on elapsed time.
  const elapsed = now - existing.updatedAt;
  existing.tokens = Math.min(limit, existing.tokens + elapsed * refillPerMs);
  existing.updatedAt = now;

  if (existing.tokens < 1) {
    const retryAfterSeconds = Math.ceil((1 - existing.tokens) / refillPerMs / 1000);
    return { ok: false, remaining: 0, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
  }

  existing.tokens -= 1;
  return { ok: true, remaining: Math.floor(existing.tokens), retryAfterSeconds: 0 };
}

/** Test helper to reset limiter state. */
export function __resetRateLimiter() {
  store.clear();
}
