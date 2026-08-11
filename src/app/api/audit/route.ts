import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/authorize";
import { correlationId, toErrorResponse } from "@/lib/security/request";
import { store } from "@/lib/data/store";

/** Return the immutable audit trail for the caller's tenant. RBAC: audit:read. */
export async function GET() {
  const cid = correlationId();
  try {
    const session = requirePermission(await getSession(), "audit:read");
    return NextResponse.json({ records: store.listAudit(session.tenantId) });
  } catch (err) {
    return toErrorResponse(err, cid);
  }
}
