import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { getSession } from "@/lib/auth/current-user";
import { assertSameOrigin, correlationId, toErrorResponse } from "@/lib/security/request";
import { store } from "@/lib/data/store";
import { logger } from "@/lib/observability/logger";

export async function POST(req: NextRequest) {
  const cid = correlationId();
  try {
    assertSameOrigin(req);
    const session = await getSession();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
    if (session) {
      store.addAudit({
        id: `aud_logout_${Date.now()}`,
        tenantId: session.tenantId,
        timestamp: new Date().toISOString(),
        actorId: session.userId,
        actorRole: session.role,
        category: "auth",
        action: "logout",
        tier: "T0",
        outcome: "info",
      });
      logger.info("auth.logout", { role: session.role, cid });
    }
    return res;
  } catch (err) {
    return toErrorResponse(err, cid);
  }
}
