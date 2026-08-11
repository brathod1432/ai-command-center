import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InsightCard } from "@/components/patterns/insight-card";
import { ActionQueue } from "@/components/patterns/action-queue";
import { PageHeader } from "@/components/patterns/page-header";
import { getAgent } from "@/lib/agents/registry";
import { getSession } from "@/lib/auth/current-user";
import { store } from "@/lib/data/store";
import { INSIGHTS } from "@/lib/data/mock";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const agent = getAgent(id);
  return { title: agent ? agent.name : "Agent" };
}

export default async function AgentWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) notFound();

  const session = await getSession();
  const role = session?.role ?? "viewer";
  const tenantId = session?.tenantId ?? "acme";
  const insights = INSIGHTS.filter((i) => i.agentId === agent.id);
  const actions = store.listActions(tenantId).filter((a) => a.agentId === agent.id);

  return (
    <main id="main-content" className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <Link href="/agents" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All agents
      </Link>
      <PageHeader title={agent.name} description={agent.mission} />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Risk level</p>
            <p className="mt-1 font-medium capitalize">{agent.riskLevel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Business impact</p>
            <p className="mt-1 font-medium">{agent.businessImpact}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Database className="h-3 w-3" aria-hidden="true" /> Data sources
            </p>
            <p className="mt-1 text-sm">{agent.dataSources.join(", ")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">Insights</h2>
          {insights.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {insights.map((i) => (
                <InsightCard key={i.id} insight={i} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No active insights. This agent will post findings here as signals arrive.
              </CardContent>
            </Card>
          )}
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">Pending approvals</h2>
          {actions.length > 0 ? (
            <ActionQueue initialActions={actions} role={role} agentId={agent.id} />
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">No pending approvals</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                This agent has no actions awaiting your decision.
                <div className="mt-2">
                  <Badge variant="outline">Governed by human approval</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </main>
  );
}
