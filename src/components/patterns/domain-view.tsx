import { Bot, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/patterns/kpi-card";
import { InsightCard } from "@/components/patterns/insight-card";
import { PageHeader } from "@/components/patterns/page-header";
import { TrendChart } from "@/components/charts/trend-chart";
import { KPIS, INSIGHTS } from "@/lib/data/mock";
import { AGENTS } from "@/lib/agents/registry";
import type { Domain } from "@/lib/types";

/** Reusable function/domain page: agent summary + domain KPIs + domain insights. */
export function DomainView({ domain, title, description }: { domain: Domain; title: string; description: string }) {
  const kpis = KPIS.filter((k) => k.domain === domain);
  const insights = INSIGHTS.filter((i) => i.domain === domain);
  const agent = AGENTS.find((a) => a.domain === domain);
  const chartKpi = kpis.find((k) => k.trend.length > 1);
  const chartData = chartKpi ? chartKpi.trend.map((v, i) => ({ name: `W${i + 1}`, value: v })) : [];

  return (
    <main id="main-content" className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <PageHeader title={title} description={description} />

      {agent ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="h-4 w-4 text-primary" aria-hidden="true" />
              {agent.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{agent.mission}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="secondary">Risk: {agent.riskLevel}</Badge>
              <Badge variant="outline">Impact: {agent.businessImpact}</Badge>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Database className="h-3 w-3" aria-hidden="true" />
                {agent.dataSources.join(", ")}
              </span>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {kpis.length > 0 ? (
        <section aria-label="Key metrics">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kpis.map((k) => (
              <KpiCard key={k.id} kpi={k} />
            ))}
          </div>
        </section>
      ) : null}

      {chartKpi ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{chartKpi.label} — 8-week trend</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={chartData}
              ariaLabel={`${chartKpi.label} trend over the last 8 weeks`}
              series={[{ key: "value", label: chartKpi.label, color: "#6366f1" }]}
            />
          </CardContent>
        </Card>
      ) : null}

      <section aria-label="Insights">
        <h2 className="mb-3 text-lg font-semibold">Agent insights</h2>
        {insights.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {insights.map((i) => (
              <InsightCard key={i.id} insight={i} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No active insights for this area right now. The {agent?.name ?? "agent"} will surface issues here as
              signals arrive from connected systems.
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}
