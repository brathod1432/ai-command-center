import { NextResponse, type NextRequest } from "next/server";
import { AuthzError } from "@/lib/auth/authorize";
import { CSRF_COOKIE, CSRF_HEADER } from "@/lib/auth/session";
import { logger } from "@/lib/observability/logger";

/**
 * Request-security helpers for API route handlers:
 * CSRF (same-origin) checks, client identification, and safe error mapping.
 * See docs/security-model.md §5–§8.
 */

/** Best-effort client identifier for rate limiting (never trusted for authz). */
export function clientId(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local").slice(0, 64);
}

/**
 * CSRF defense for state-changing requests: require the Origin (or Referer)
 * to match the request host. Rejects cross-site form/fetch posts.
 */
export function assertSameOrigin(req: NextRequest): void {
  const origin = req.headers.get("origin") ?? req.headers.get("referer");
  if (!origin) throw new AuthzError("Missing Origin", 403);
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new AuthzError("Invalid Origin", 403);
  }
  const host = req.headers.get("host");
  if (!host || originHost !== host) {
    throw new AuthzError("Cross-origin request blocked", 403);
  }
}

/**
 * CSRF double-submit check: the `x-csrf-token` header must match the
 * `helm_csrf` cookie. Combined with assertSameOrigin, this is defense in depth
 * against CSRF. See docs/improvements-v3.md §4 (S1).
 */
export function assertCsrf(req: NextRequest): void {
  const cookie = req.cookies.get(CSRF_COOKIE)?.value;
  const header = req.headers.get(CSRF_HEADER);
  if (!cookie || !header || cookie !== header) {
    throw new AuthzError("Invalid CSRF token", 403);
  }
}

/** A short correlation id for tracing a request across logs. */
export function correlationId(): string {
  return `req_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/**
 * JSON response for authenticated endpoints. Marks responses `no-store` so
 * sensitive data is never cached by browsers/proxies. See docs/improvements-v2.md §4 (S3).
 */
export function jsonSecure(body: unknown, init: { status?: number; headers?: Record<string, string> } = {}): NextResponse {
  return NextResponse.json(body, {
    status: init.status ?? 200,
    headers: { "Cache-Control": "no-store", ...(init.headers ?? {}) },
  });
}

/** Standard rate-limit response headers. */
export function rateHeaders(remaining: number, retryAfterSeconds = 0): Record<string, string> {
  const h: Record<string, string> = { "X-RateLimit-Remaining": String(Math.max(0, remaining)) };
  if (retryAfterSeconds > 0) h["Retry-After"] = String(retryAfterSeconds);
  return h;
}

/** Map thrown errors to safe JSON responses (no stack traces/secrets leaked). */
export function toErrorResponse(err: unknown, cid: string): NextResponse {
  if (err instanceof AuthzError) {
    return NextResponse.json({ error: err.message, correlationId: cid }, { status: err.status });
  }
  logger.error("api.unhandled_error", { correlationId: cid, message: (err as Error)?.message });
  return NextResponse.json(
    { error: "Internal server error", correlationId: cid },
    { status: 500 },
  );
}
