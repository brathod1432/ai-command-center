import type { Permission } from "@/lib/types";
import { can } from "@/lib/rbac";
import type { SessionPayload } from "@/lib/auth/session";

/** Thrown when authorization fails. Mapped to HTTP 401/403 by callers. */
export class AuthzError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403,
  ) {
    super(message);
    this.name = "AuthzError";
  }
}

/**
 * Fail-closed authorization for API route handlers (defense in depth).
 * Throws AuthzError(401) if unauthenticated, AuthzError(403) if unauthorized.
 * See docs/security-model.md §2.
 */
export function requirePermission(
  session: SessionPayload | null,
  permission: Permission,
): SessionPayload {
  if (!session) throw new AuthzError("Authentication required", 401);
  if (!can(session.role, permission)) {
    throw new AuthzError(`Missing permission: ${permission}`, 403);
  }
  return session;
}
