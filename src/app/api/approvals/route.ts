import { NextResponse, type NextRequest } from "next/server";
import { ApprovalInputSchema } from "@/lib/types";
import { getSession } from "@/lib/auth/current-user";
import { AuthzError, requirePermission } from "@/lib/auth/authorize";
import { ApprovalError } from "@/lib/governance";
import { rateLimit } from "@/lib/security/rate-limit";
import { assertCsrf, assertSameOrigin, clientId, correlationId, jsonSecure, rateHeaders, toErrorResponse } from "@/lib/security/request";
import { store } from "@/lib/data/store";

/**
 * Record a human approval decision on a consequential action.
 * Security: same-origin (CSRF) + rate limit + server-side RBAC + governance
 * invariant (authorized role, reason rules) + immutable audit record.
 * See docs/governance.md and docs/ai-safety.md.
 */
export async function POST(req: NextRequest) {
  const cid = correlationId();
  try {
    assertSameOrigin(req);
    assertCsrf(req);

    const rl = rateLimit(`approve:${clientId(req)}`, 60, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests", correlationId: cid },
        { status: 429, headers: rateHeaders(0, rl.retryAfterSeconds) },
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = ApprovalInputSchema.safeParse(body);
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

    try {
      const { action, audit } = store.applyDecision({
        tenantId: session.tenantId,
        actionId: parsed.data.actionId,
        decision: parsed.data.decision,
        actorId: session.userId,
        actorRole: session.role,
        reason: parsed.data.reason,
      });
      return jsonSecure({ action, audit }, { headers: rateHeaders(rl.remaining) });
    } catch (err) {
      if (err instanceof ApprovalError) {
        return NextResponse.json({ error: err.message, correlationId: cid }, { status: 400 });
      }
      if ((err as Error).message === "Action not found") {
        return NextResponse.json({ error: "Action not found", correlationId: cid }, { status: 404 });
      }
      throw err;
    }
  } catch (err) {
    return toErrorResponse(err, cid);
  }
}
