import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/authorize";
import { correlationId, toErrorResponse } from "@/lib/security/request";
import { store } from "@/lib/data/store";

/** List proposed actions for the caller's tenant. RBAC: insight:read. */
export async function GET() {
  const cid = correlationId();
  try {
    const session = requirePermission(await getSession(), "insight:read");
    return NextResponse.json({ actions: store.listActions(session.tenantId) });
  } catch (err) {
    return toErrorResponse(err, cid);
  }
}
