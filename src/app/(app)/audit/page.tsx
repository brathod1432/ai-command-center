import type { Metadata } from "next";
import { ShieldX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/patterns/page-header";
import { AuditTable } from "@/components/patterns/audit-table";
import { getSession } from "@/lib/auth/current-user";
import { can } from "@/lib/rbac";
import { store } from "@/lib/data/store";

export const metadata: Metadata = { title: "Audit Trail" };

export default async function AuditPage() {
  const session = await getSession();
  const role = session?.role ?? "viewer";

  if (!can(role, "audit:read")) {
    return (
      <main id="main-content" className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <PageHeader title="Audit Trail" />
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <ShieldX className="h-8 w-8 text-destructive" aria-hidden="true" />
            <p className="font-medium">You don&apos;t have access to the audit trail.</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Audit access is restricted to owners, admins, executives, and auditors. Ask an administrator
              if you need visibility for a compliance review.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const records = store.listAudit(session?.tenantId ?? "acme");

  return (
    <main id="main-content" className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <PageHeader
        title="Audit Trail"
        description="Immutable, append-only record of every decision and security-relevant event. Filter and export for compliance."
      />
      <AuditTable initialRecords={records} />
    </main>
  );
}
