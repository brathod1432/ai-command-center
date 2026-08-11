import type { Metadata } from "next";
import { HeartPulse } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/patterns/kpi-card";
import { InsightCard } from "@/components/patterns/insight-card";
import { ActionQueue } from "@/components/patterns/action-queue";
import { PageHeader } from "@/components/patterns/page-header";
import { getSession } from "@/lib/auth/current-user";
import { store } from "@/lib/data/store";
import { COMPANY_HEALTH, INSIGHTS, KPIS } from "@/lib/data/mock";

export const metadata: Metadata = {
  title: "Executive Command Center",
  description: "Company health, KPIs, agent insights, and recommended actions.",
};

const HEALTH_VARIANT = {
  excellent: "success",
  healthy: "success",
  watch: "warning",
  at_risk: "destructive",
  critical: "destructive",
} as const;

export default async function DashboardPage() {
  const session = await getSession();
  const role = session?.role ?? "viewer";
  const tenantId = session?.tenantId ?? "acme";
  const actions = store.listActions(tenantId);
  const health = COMPANY_HEALTH;

  return (
    <main id="main-content" className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <PageHeader
        title="Executive Command Center"
        description={`Welcome back, ${session?.name ?? "there"}. Here is what needs your attention today.`}
      />

      <section aria-labelledby="health-heading">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle id="health-heading" className="flex items-center gap-2 text-base">
                <HeartPulse className="h-4 w-4 text-primary" aria-hidden="true" />
                Company Health
              </CardTitle>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-semibold tabular-nums">{health.score}</span>
                <Badge variant={HEALTH_VARIANT[health.label]}>{health.label.replace("_", " ")}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{health.summary}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {health.pillars.map((p) => (
                <div key={p.domain} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium capitalize text-muted-foreground">
                      {p.domain.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-semibold tabular-nums">{p.score}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{p.note}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-label="Key performance indicators">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {KPIS.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-labelledby="insights-heading">
          <h2 id="insights-heading" className="mb-3 text-lg font-semibold">
            Agent insights
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {INSIGHTS.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </section>
        <section aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="mb-3 text-lg font-semibold">
            Governance queue
          </h2>
          <ActionQueue initialActions={actions} role={role} />
        </section>
      </div>
    </main>
  );
}
