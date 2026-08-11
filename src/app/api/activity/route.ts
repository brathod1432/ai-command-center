import { getSession } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/authorize";
import { correlationId, jsonSecure, toErrorResponse } from "@/lib/security/request";
import { store } from "@/lib/data/store";

/**
 * Recent activity feed (redacted — no sensitive reasons). Available to anyone
 * who can read insights, powering the notification bell. RBAC: insight:read.
 */
export async function GET() {
  const cid = correlationId();
  try {
    const session = requirePermission(await getSession(), "insight:read");
    return jsonSecure({ items: store.recentActivity(session.tenantId) });
  } catch (err) {
    return toErrorResponse(err, cid);
  }
}
