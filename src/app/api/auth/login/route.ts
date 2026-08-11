import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { RoleSchema } from "@/lib/types";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, sessionCookieOptions, signSession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/security/rate-limit";
import { assertSameOrigin, clientId, correlationId, toErrorResponse } from "@/lib/security/request";
import { store } from "@/lib/data/store";
import { logger } from "@/lib/observability/logger";

const LoginSchema = z.object({
  email: z.string().email(),
  // Demo login: the operator chooses a role to explore RBAC/governance.
  role: RoleSchema,
});

function displayName(email: string): string {
  return email
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function POST(req: NextRequest) {
  const cid = correlationId();
  try {
    assertSameOrigin(req);

    const rl = rateLimit(`login:${clientId(req)}`, 10, 60_000);
    if (!rl.ok) {
      logger.warn("auth.login.rate_limited", { cid });
      return NextResponse.json(
        { error: "Too many attempts. Please wait and try again.", correlationId: cid },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", correlationId: cid, details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { email, role } = parsed.data;
    const name = displayName(email);
    const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
    const payload = { userId: `u_${role}`, tenantId: "acme", role, name, email, exp };
    const token = await signSession(payload);

    const res = NextResponse.json({ ok: true, user: { name, role, email } });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());

    store.addAudit({
      id: `aud_login_${Date.now()}`,
      tenantId: "acme",
      timestamp: new Date().toISOString(),
      actorId: payload.userId,
      actorRole: role,
      category: "auth",
      action: "login",
      tier: "T0",
      outcome: "info",
    });
    logger.info("auth.login", { role, cid });
    return res;
  } catch (err) {
    return toErrorResponse(err, cid);
  }
}
