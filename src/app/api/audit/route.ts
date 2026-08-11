import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/authorize";
import { rateLimit } from "@/lib/security/rate-limit";
import { clientId, correlationId, jsonSecure, rateHeaders, toErrorResponse } from "@/lib/security/request";
import { store } from "@/lib/data/store";

/** Return the immutable audit trail + chain-integrity status. RBAC: audit:read + rate limited. */
export async function GET(req: NextRequest) {
  const cid = correlationId();
  try {
    const rl = rateLimit(`read:${clientId(req)}`, 240, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many requests", correlationId: cid }, { status: 429, headers: rateHeaders(0, rl.retryAfterSeconds) });
    }
    const session = requirePermission(await getSession(), "audit:read");
    return jsonSecure({
      records: store.listAudit(session.tenantId),
      integrity: store.verifyAudit(session.tenantId),
    });
  } catch (err) {
    return toErrorResponse(err, cid);
  }
}
