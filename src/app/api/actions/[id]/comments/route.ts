import { getSession } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/authorize";
import { correlationId, jsonSecure, toErrorResponse } from "@/lib/security/request";
import { store } from "@/lib/data/store";

/** List comments for an action. RBAC: insight:read. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const cid = correlationId();
  try {
    const session = requirePermission(await getSession(), "insight:read");
    const { id } = await params;
    return jsonSecure({ comments: store.listComments(session.tenantId, id) });
  } catch (err) {
    return toErrorResponse(err, cid);
  }
}
