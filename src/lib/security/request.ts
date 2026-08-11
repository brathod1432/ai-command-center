import { NextResponse, type NextRequest } from "next/server";
import { AuthzError } from "@/lib/auth/authorize";
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

/** A short correlation id for tracing a request across logs. */
export function correlationId(): string {
  return `req_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
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
