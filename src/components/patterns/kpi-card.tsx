import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkline } from "@/components/patterns/sparkline";
import type { Kpi } from "@/lib/types";
import { cn, formatCurrency, formatDelta, formatNumber, formatPercent } from "@/lib/utils";

function formatValue(kpi: Kpi): string {
  if (kpi.unit === "currency") return formatCurrency(kpi.value);
  if (kpi.unit === "percent") return `${kpi.value}%`;
  return formatNumber(kpi.value);
}

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const isImprovement =
    kpi.goodDirection === "up" ? kpi.deltaPct >= 0 : kpi.deltaPct <= 0;
  const DeltaIcon = kpi.deltaPct >= 0 ? ArrowUpRight : ArrowDownRight;
  const deltaLabel = `${formatDelta(kpi.deltaPct)} period over period, ${isImprovement ? "favorable" : "unfavorable"}`;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
              isImprovement ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            <DeltaIcon className="h-3 w-3" aria-hidden="true" />
            <span aria-label={deltaLabel}>{formatDelta(kpi.deltaPct)}</span>
          </span>
        </div>
        <div className="mt-2 flex items-end justify-between gap-3">
          <p className="text-2xl font-semibold tabular-nums">{formatValue(kpi)}</p>
          <Sparkline data={kpi.trend} label={`${kpi.label} trend, ${formatPercent(0)} baseline`} />
        </div>
      </CardContent>
    </Card>
  );
}
