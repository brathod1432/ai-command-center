import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/patterns/page-header";
import { Forbidden } from "@/components/patterns/forbidden";
import { getSession } from "@/lib/auth/current-user";
import { ROLE_PERMISSIONS, can, roleLabel } from "@/lib/rbac";
import { DEMO_TEAM } from "@/lib/data/mock";
import type { Permission, Role } from "@/lib/types";

export const metadata: Metadata = { title: "Team" };

const ROLES: Role[] = ["owner", "admin", "executive", "manager", "analyst", "viewer", "auditor"];
const KEY_PERMISSIONS: Permission[] = [
  "action:approve",
  "integration:manage",
  "user:manage",
  "audit:read",
  "knowledge:publish",
  "settings:manage",
];

export default async function TeamPage() {
  const session = await getSession();
  const role = session?.role ?? "viewer";
  if (!can(role, "user:read")) {
    return <Forbidden title="Team" message="Team and permission management is limited to owners and admins." />;
  }

  return (
    <main id="main-content" className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <PageHeader
        title="Team"
        description="Members and the permissions each role holds. Supports access reviews for compliance (e.g., SOC 2)."
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Team members and roles</caption>
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-2 py-2">Name</th>
                <th scope="col" className="px-2 py-2">Title</th>
                <th scope="col" className="px-2 py-2">Email</th>
                <th scope="col" className="px-2 py-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_TEAM.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="px-2 py-2 font-medium">{u.name}</td>
                  <td className="px-2 py-2 text-muted-foreground">{u.title}</td>
                  <td className="px-2 py-2 text-muted-foreground">{u.email}</td>
                  <td className="px-2 py-2">
                    <Badge variant="secondary">{roleLabel(u.role)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Role → permission matrix</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Which roles hold which key permissions</caption>
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-2 py-2">Role</th>
                {KEY_PERMISSIONS.map((p) => (
                  <th key={p} scope="col" className="px-2 py-2">{p}</th>
                ))}
                <th scope="col" className="px-2 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map((r) => (
                <tr key={r} className="border-b last:border-0">
                  <td className="px-2 py-2 font-medium">{roleLabel(r)}</td>
                  {KEY_PERMISSIONS.map((p) => (
                    <td key={p} className="px-2 py-2">
                      {can(r, p) ? (
                        <span className="text-success" aria-label="granted">✓</span>
                      ) : (
                        <span className="text-muted-foreground" aria-label="not granted">—</span>
                      )}
                    </td>
                  ))}
                  <td className="px-2 py-2 tabular-nums text-muted-foreground">{ROLE_PERMISSIONS[r].length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </main>
  );
}
