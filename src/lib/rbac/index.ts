import type { Permission, Role } from "@/lib/types";

/**
 * Role-Based Access Control capability matrix. See docs/security-model.md §2.
 * Authorization is checked in middleware, server/domain, and UI (defense in depth).
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    "dashboard:read", "agent:read", "agent:run", "insight:read",
    "action:propose", "action:approve", "action:decline",
    "integration:read", "integration:manage",
    "user:read", "user:manage", "role:manage",
    "audit:read", "settings:manage",
    "knowledge:read", "knowledge:publish",
    "workflow:read", "workflow:run",
  ],
  admin: [
    "dashboard:read", "agent:read", "agent:run", "insight:read",
    "action:propose", "action:approve", "action:decline",
    "integration:read", "integration:manage",
    "user:read", "user:manage", "role:manage",
    "audit:read", "settings:manage",
    "knowledge:read", "knowledge:publish",
    "workflow:read", "workflow:run",
  ],
  executive: [
    "dashboard:read", "agent:read", "insight:read",
    "action:propose", "action:approve", "action:decline",
    "integration:read", "audit:read",
    "knowledge:read", "workflow:read", "workflow:run",
  ],
  manager: [
    "dashboard:read", "agent:read", "agent:run", "insight:read",
    "action:propose", "action:approve", "action:decline",
    "integration:read", "knowledge:read",
    "workflow:read", "workflow:run",
  ],
  analyst: [
    "dashboard:read", "agent:read", "agent:run", "insight:read",
    "action:propose", "integration:read", "knowledge:read", "workflow:read",
  ],
  viewer: [
    "dashboard:read", "agent:read", "insight:read", "knowledge:read", "workflow:read",
  ],
  auditor: [
    "dashboard:read", "audit:read", "insight:read", "knowledge:read",
  ],
};

/** Returns true if the role holds the given permission. */
export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Returns true if the role can approve consequential actions. */
export function canApprove(role: Role): boolean {
  return can(role, "action:approve");
}

/** Human-readable label for a role. */
export function roleLabel(role: Role): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
