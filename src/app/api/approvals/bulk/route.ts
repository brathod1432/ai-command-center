import { NextResponse, type NextRequest } from "next/server";
import { BulkApprovalInputSchema } from "@/lib/types";
import { getSession } from "@/lib/auth/current-user";
import { AuthzError, requirePermission } from "@/lib/auth/authorize";
import { rateLimit } from "@/lib/security/rate-limit";
import { assertCsrf, assertSameOrigin, clientId, correlationId, jsonSecure, rateHeaders, toErrorResponse } from "@/lib/security/request";
import { store } from "@/lib/data/store";

/**
 * Bulk approve/decline. Convenience layer only — each item flows through the
 * same governed path (RBAC, reason rules, dual-control, immutable audit) via
 * store.bulkDecision. Security: same-origin + CSRF + rate limit + RBAC.
 * See docs/improvements-v6.md.
 */
export async function POST(req: NextRequest) {
  const cid = correlationId();
  try {
    assertSameOrigin(req);
    assertCsrf(req);

    const rl = rateLimit(`approve-bulk:${clientId(req)}`, 30, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests", correlationId: cid },
        { status: 429, headers: rateHeaders(0, rl.retryAfterSeconds) },
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = BulkApprovalInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", correlationId: cid, details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const permission = parsed.data.decision === "approved" ? "action:approve" : "action:decline";
    const current = await getSession();
    let session;
    try {
      session = requirePermission(current, permission);
    } catch (e) {
      if (e instanceof AuthzError && e.status === 403 && current) {
        store.recordDenied({ tenantId: current.tenantId, actorId: current.userId, actorRole: current.role, permission });
      }
      throw e;
    }

    const results = store.bulkDecision({
      tenantId: session.tenantId,
      actionIds: parsed.data.actionIds,
      decision: parsed.data.decision,
      actorId: session.userId,
      actorRole: session.role,
      reason: parsed.data.reason,
    });

    const succeeded = results.filter((r) => r.ok).length;
    return jsonSecure({ results, succeeded, failed: results.length - succeeded }, { headers: rateHeaders(rl.remaining) });
  } catch (err) {
    return toErrorResponse(err, cid);
  }
}
