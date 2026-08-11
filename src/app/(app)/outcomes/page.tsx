import type { Metadata } from "next";
import { CheckCheck, CircleCheck, CircleX, Clock, ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/patterns/page-header";
import { getSession } from "@/lib/auth/current-user";
import { store } from "@/lib/data/store";

export const metadata: Metadata = { title: "Outcomes" };

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Clock; label: string; value: string | number; tone?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className={`h-4 w-4 ${tone ?? "text-primary"}`} aria-hidden="true" />
          <span className="text-sm">{label}</span>
        </div>
        <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

export default async function OutcomesPage() {
  const session = await getSession();
  const tenantId = session?.tenantId ?? "acme";
  const actions = store.listActions(tenantId);
  const audit = store.listAudit(tenantId);
  const integrity = store.verifyAudit(tenantId);

  const completed = actions.filter((a) => Boolean(a.completedAt)).length;
  const approved = actions.filter((a) => a.status === "approved" || a.status === "closed").length;
  const declined = actions.filter((a) => a.status === "declined").length;
  const pending = actions.filter((a) => a.status === "pending_approval" || a.status === "proposed").length;

  const approvalEvents = audit.filter((r) => r.category === "approval" && r.outcome === "approved").length;
  const declineEvents = audit.filter((r) => r.category === "approval" && r.outcome === "declined").length;
  const deniedAttempts = audit.filter((r) => r.category === "permission").length;

  return (
    <main id="main-content" className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <PageHeader
        title="Outcomes"
        description="The operating rhythm: what's been decided, completed, and blocked — with audit integrity."
      />

      <section aria-label="Action outcomes">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={CircleCheck} label="Approved" value={approved} tone="text-success" />
          <Stat icon={CheckCheck} label="Completed" value={completed} tone="text-success" />
          <Stat icon={CircleX} label="Declined" value={declined} tone="text-destructive" />
          <Stat icon={Clock} label="Pending review" value={pending} tone="text-warning" />
        </div>
      </section>

      <section aria-label="Governance activity">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">Governance activity</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat icon={CircleCheck} label="Approval events" value={approvalEvents} tone="text-success" />
          <Stat icon={CircleX} label="Decline events" value={declineEvents} tone="text-destructive" />
          <Stat icon={ShieldAlert} label="Denied attempts (blocked)" value={deniedAttempts} tone="text-warning" />
        </div>
      </section>

      <Card>
        <CardContent className="flex items-center gap-3 p-5">
          {integrity.ok ? (
            <ShieldCheck className="h-5 w-5 text-success" aria-hidden="true" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-destructive" aria-hidden="true" />
          )}
          <div>
            <p className="font-medium">
              Audit integrity: {integrity.ok ? "verified" : "BROKEN"} ({integrity.count} records)
            </p>
            <p className="text-sm text-muted-foreground">
              Every decision above is captured in a tamper-evident, hash-chained audit trail.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
