import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/authorize";
import { rateLimit } from "@/lib/security/rate-limit";
import { clientId, correlationId, jsonSecure, rateHeaders, toErrorResponse } from "@/lib/security/request";
import { store } from "@/lib/data/store";

/**
 * Recent activity feed (redacted — no sensitive reasons). Available to anyone
 * who can read insights, powering the notification bell. RBAC: insight:read + rate limited.
 */
export async function GET(req: NextRequest) {
  const cid = correlationId();
  try {
    const rl = rateLimit(`read:${clientId(req)}`, 240, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many requests", correlationId: cid }, { status: 429, headers: rateHeaders(0, rl.retryAfterSeconds) });
    }
    const session = requirePermission(await getSession(), "insight:read");
    return jsonSecure({ items: store.recentActivity(session.tenantId) });
  } catch (err) {
    return toErrorResponse(err, cid);
  }
}
