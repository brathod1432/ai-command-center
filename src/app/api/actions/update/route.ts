import { NextResponse, type NextRequest } from "next/server";
import { ActionUpdateInputSchema } from "@/lib/types";
import { getSession } from "@/lib/auth/current-user";
import { AuthzError, requirePermission } from "@/lib/auth/authorize";
import { rateLimit } from "@/lib/security/rate-limit";
import { assertCsrf, assertSameOrigin, clientId, correlationId, jsonSecure, rateHeaders, toErrorResponse } from "@/lib/security/request";
import { store } from "@/lib/data/store";

/**
 * Action lifecycle updates (assign owner, mark complete, add comment).
 * Security: same-origin (CSRF) + rate limit + per-op server-side RBAC + Zod.
 *  - assign / complete require action:approve (managers+)
 *  - comment requires insight:read (any viewer)
 * See docs/improvements-v2.md §2 (U1).
 */
export async function POST(req: NextRequest) {
  const cid = correlationId();
  try {
    assertSameOrigin(req);
    assertCsrf(req);

    const rl = rateLimit(`action-update:${clientId(req)}`, 120, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests", correlationId: cid },
        { status: 429, headers: rateHeaders(0, rl.retryAfterSeconds) },
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = ActionUpdateInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", correlationId: cid, details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const input = parsed.data;

    const permission = input.op === "comment" ? "insight:read" : "action:approve";
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
      if (input.op === "assign") {
        const action = store.assignAction({
          tenantId: session.tenantId,
          actionId: input.actionId,
          owner: input.owner,
          dueDate: input.dueDate,
          actorId: session.userId,
          actorRole: session.role,
        });
        return jsonSecure({ action }, { headers: rateHeaders(rl.remaining) });
      }
      if (input.op === "complete") {
        const action = store.completeAction({
          tenantId: session.tenantId,
          actionId: input.actionId,
          actorId: session.userId,
          actorRole: session.role,
        });
        return jsonSecure({ action }, { headers: rateHeaders(rl.remaining) });
      }
      const comment = store.addComment({
        tenantId: session.tenantId,
        actionId: input.actionId,
        body: input.body,
        authorId: session.userId,
        authorRole: session.role,
      });
      return jsonSecure({ comment }, { headers: rateHeaders(rl.remaining) });
    } catch (err) {
      if ((err as Error).message === "Action not found") {
        return NextResponse.json({ error: "Action not found", correlationId: cid }, { status: 404 });
      }
      throw err;
    }
  } catch (err) {
    return toErrorResponse(err, cid);
  }
}
