import { getSession } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/authorize";
import { correlationId, jsonSecure, toErrorResponse } from "@/lib/security/request";
import { store } from "@/lib/data/store";

/** Return the immutable audit trail + chain-integrity status. RBAC: audit:read. */
export async function GET() {
  const cid = correlationId();
  try {
    const session = requirePermission(await getSession(), "audit:read");
    return jsonSecure({
      records: store.listAudit(session.tenantId),
      integrity: store.verifyAudit(session.tenantId),
    });
  } catch (err) {
    return toErrorResponse(err, cid);
  }
}
