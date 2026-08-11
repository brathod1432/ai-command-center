import type { Metadata } from "next";
import { CheckCircle2, CircleDot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/patterns/page-header";
import { WORKFLOWS } from "@/lib/data/catalog";

export const metadata: Metadata = { title: "Workflows" };

export default function WorkflowsPage() {
  return (
    <main id="main-content" className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <PageHeader
        title="Workflows"
        description="Automate reporting, escalations, and risk detection — every consequential step passes through a human approval gate."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {WORKFLOWS.map((wf) => (
          <Card key={wf.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{wf.name}</CardTitle>
                <div className="flex items-center gap-2">
                  {wf.requiresApproval ? <Badge variant="warning">Approval gated</Badge> : <Badge variant="secondary">Read-only</Badge>}
                  <Badge variant={wf.enabled ? "success" : "outline"}>{wf.enabled ? "Enabled" : "Disabled"}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{wf.description}</p>
              <p className="text-xs text-muted-foreground">Trigger: {wf.trigger}</p>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {wf.steps.map((s) => {
                  const isApproval = s.type === "approval";
                  return (
                    <li key={s.id} className="flex items-start gap-2 text-sm">
                      {isApproval ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                      ) : (
                        <CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      )}
                      <span>
                        <span className="font-medium">{s.name}</span>
                        {isApproval && s.approverRole ? (
                          <Badge variant="outline" className="ml-2">
                            {s.tier} · {s.approverRole}
                          </Badge>
                        ) : null}
                        <span className="block text-xs text-muted-foreground">{s.description}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
