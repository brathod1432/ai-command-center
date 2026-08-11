"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { InsightCard } from "@/components/patterns/insight-card";
import type { Insight } from "@/lib/types";

/** Filterable grid of agent insights (severity + domain). */
export function InsightsPanel({ insights }: { insights: Insight[] }) {
  const [severity, setSeverity] = useState("all");
  const [domain, setDomain] = useState("all");

  const domains = useMemo(() => Array.from(new Set(insights.map((i) => i.domain))), [insights]);

  const filtered = insights.filter(
    (i) => (severity === "all" || i.severity === severity) && (domain === "all" || i.domain === domain),
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          aria-label="Filter by severity"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="h-8 max-w-[160px]"
        >
          <option value="all">All severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="info">Info</option>
        </Select>
        <Select
          aria-label="Filter by domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="h-8 max-w-[180px]"
        >
          <option value="all">All domains</option>
          {domains.map((d) => (
            <option key={d} value={d}>
              {d.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
        <span className="text-xs text-muted-foreground">
          {filtered.length} of {insights.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No insights match the current filters.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((i) => (
            <InsightCard key={i.id} insight={i} />
          ))}
        </div>
      )}
    </div>
  );
}
