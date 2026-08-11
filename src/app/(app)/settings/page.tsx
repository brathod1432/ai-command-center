import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/patterns/page-header";
import { getSession } from "@/lib/auth/current-user";
import { ROLE_PERMISSIONS, roleLabel } from "@/lib/rbac";
import { TENANT } from "@/lib/data/mock";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await getSession();
  const role = session?.role ?? "viewer";
  const permissions = ROLE_PERMISSIONS[role];

  return (
    <main id="main-content" className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <PageHeader title="Settings" description="Your profile, workspace, and the governance policy applied to your role." />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="font-medium">{session?.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium">{session?.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Role</p>
            <p className="font-medium">{roleLabel(role)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Workspace</p>
            <p className="font-medium">{TENANT.name} · {TENANT.plan}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            Access is enforced server-side (defense in depth). These are the capabilities granted to the{" "}
            <span className="font-medium">{roleLabel(role)}</span> role.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {permissions.map((p) => (
              <Badge key={p} variant="secondary" className="text-[11px]">{p}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Governance policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Consequential actions require human approval and produce an immutable audit record.</p>
          <ul className="list-inside list-disc space-y-1">
            <li><span className="font-medium text-foreground">T1</span> — reversible, low blast radius: single approver.</li>
            <li><span className="font-medium text-foreground">T2</span> — external effect: role-appropriate approver + audit.</li>
            <li><span className="font-medium text-foreground">T3</span> — financial/legal/access: elevated approver + required reason + audit.</li>
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
