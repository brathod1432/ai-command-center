import { ROLE_PERMISSIONS, can, canApprove } from "@/lib/rbac";
import type { Role } from "@/lib/types";

describe("rbac", () => {
  it("grants approval authority to executives, managers, admins, owners", () => {
    (["owner", "admin", "executive", "manager"] as Role[]).forEach((r) => {
      expect(canApprove(r)).toBe(true);
    });
  });

  it("denies approval authority to analysts, viewers, auditors", () => {
    (["analyst", "viewer", "auditor"] as Role[]).forEach((r) => {
      expect(canApprove(r)).toBe(false);
    });
  });

  it("viewer can read dashboards but cannot manage users", () => {
    expect(can("viewer", "dashboard:read")).toBe(true);
    expect(can("viewer", "user:manage")).toBe(false);
  });

  it("only owner/admin can manage roles", () => {
    expect(can("owner", "role:manage")).toBe(true);
    expect(can("admin", "role:manage")).toBe(true);
    expect(can("executive", "role:manage")).toBe(false);
  });

  it("auditor can read the audit log", () => {
    expect(can("auditor", "audit:read")).toBe(true);
  });

  it("every role has an explicit permission set", () => {
    Object.values(ROLE_PERMISSIONS).forEach((perms) => {
      expect(Array.isArray(perms)).toBe(true);
      expect(perms.length).toBeGreaterThan(0);
    });
  });
});
