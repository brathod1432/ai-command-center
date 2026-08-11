import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { Insight, Severity } from "@/lib/types";

const SEVERITY_VARIANT: Record<Severity, BadgeProps["variant"]> = {
  info: "info",
  low: "secondary",
  medium: "warning",
  high: "destructive",
  critical: "destructive",
};

export function ConfidenceMeter({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 w-24 overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Confidence ${value} percent`}
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{value}% confidence</span>
    </div>
  );
}

export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant={SEVERITY_VARIANT[insight.severity]}>{insight.severity.toUpperCase()}</Badge>
          <ConfidenceMeter value={insight.confidence} />
        </div>
        <h3 className="pt-1 font-semibold leading-tight">{insight.title}</h3>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <p className="text-sm text-muted-foreground">{insight.narrative}</p>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Evidence</p>
          <ul className="space-y-1">
            {insight.evidence.map((e) => (
              <li key={e.sourceId} className="flex items-center gap-1.5 text-xs">
                <FileText className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span>{e.label}</span>
                {e.provider ? <span className="text-muted-foreground">· {e.provider}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
