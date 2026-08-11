import type { Metadata } from "next";
import { Activity, ShieldCheck, ShieldX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { PageHeader } from "@/components/patterns/page-header";
import { getSession } from "@/lib/auth/current-user";
import { store } from "@/lib/data/store";
import { INTEGRATIONS } from "@/lib/data/catalog";
import type { HealthStatus } from "@/lib/types/integrations";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Status" };

const STATUS: Record<HealthStatus, { label: string; variant: BadgeProps["variant"] }> = {
  ok: { label: "Operational", variant: "success" },
  degraded: { label: "Degraded", variant: "warning" },
  rate_limited: { label: "Rate limited", variant: "warning" },
  disconnected: { label: "Disconnected", variant: "secondary" },
};

export default async function StatusPage() {
  const session = await getSession();
  const tenantId = session?.tenantId ?? "acme";
  const integrity = store.verifyAudit(tenantId);
  const connected = INTEGRATIONS.filter((i) => i.connected);
  const degraded = connected.filter((i) => i.status !== "ok");
  const overall = degraded.length === 0 ? "All systems operational" : `${degraded.length} integration(s) degraded`;

  return (
    <main id="main-content" className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <PageHeader title="Status" description="Operational health of Helm and its connected systems." />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
            System
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3 text-sm">
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Application</p>
            <p className="mt-1 flex items-center gap-2 font-medium">
              <Badge variant="success">Operational</Badge>
            </p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Datastore</p>
            <p className="mt-1"><Badge variant="success">Operational</Badge></p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">Audit chain</p>
            <p className="mt-1">
              {integrity.ok ? (
                <Badge variant="success" className="gap-1">
                  <ShieldCheck className="h-3 w-3" aria-hidden="true" /> Verified ({integrity.count})
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <ShieldX className="h-3 w-3" aria-hidden="true" /> Broken
                </Badge>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Integrations — {overall}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {INTEGRATIONS.map((it) => {
              const s = STATUS[it.status];
              return (
                <li key={it.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div>
                    <span className="font-medium">{it.name}</span>
                    <span className="ml-2 text-xs capitalize text-muted-foreground">{it.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {it.lastSync ? `synced ${timeAgo(it.lastSync)}` : "not connected"}
                    </span>
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
