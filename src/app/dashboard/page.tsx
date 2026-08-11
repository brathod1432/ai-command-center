import type { Metadata } from "next";
import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/patterns/kpi-card";
import { InsightCard } from "@/components/patterns/insight-card";
import { ActionQueue } from "@/components/patterns/action-queue";
import { ACTIONS, COMPANY_HEALTH, DEMO_USER, INSIGHTS, KPIS, TENANT } from "@/lib/data/mock";

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

export default function DashboardPage() {
  const health = COMPANY_HEALTH;

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {TENANT.name} · Welcome back, {DEMO_USER.name}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Executive Command Center</h1>
        </div>
        <Link href="/" className="text-sm text-primary underline-offset-4 hover:underline">
          ← Back to overview
        </Link>
      </header>

      <section className="mt-6" aria-labelledby="health-heading">
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

      <section className="mt-6" aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">
          Key performance indicators
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {KPIS.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
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
          <ActionQueue actions={ACTIONS} role={DEMO_USER.role} />
        </section>
      </div>
    </main>
  );
}
