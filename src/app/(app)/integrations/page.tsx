import type { Metadata } from "next";
import { Plug } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { PageHeader } from "@/components/patterns/page-header";
import { INTEGRATIONS } from "@/lib/data/catalog";
import type { HealthStatus } from "@/lib/types/integrations";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Integrations" };

const STATUS: Record<HealthStatus, { label: string; variant: BadgeProps["variant"] }> = {
  ok: { label: "Healthy", variant: "success" },
  degraded: { label: "Degraded", variant: "warning" },
  rate_limited: { label: "Rate limited", variant: "warning" },
  disconnected: { label: "Disconnected", variant: "secondary" },
};

export default function IntegrationsPage() {
  return (
    <main id="main-content" className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <PageHeader
        title="Integrations"
        description="Connect your systems of record. The reference build uses deterministic mock providers behind a common adapter interface."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map((it) => {
          const s = STATUS[it.status];
          return (
            <Card key={it.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                    <Plug className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <Badge variant={s.variant}>{s.label}</Badge>
                </div>
                <h2 className="mt-3 font-semibold">{it.name}</h2>
                <p className="text-xs capitalize text-muted-foreground">{it.category}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {it.lastSync ? `Last sync ${timeAgo(it.lastSync)}` : "Not connected"}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {it.capabilities.map((c) => (
                    <Badge key={c} variant="outline" className="text-[10px]">
                      {c}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
