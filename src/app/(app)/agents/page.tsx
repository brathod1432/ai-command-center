import type { Metadata } from "next";
import Link from "next/link";
import { Bot, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/patterns/page-header";
import { AGENTS } from "@/lib/agents/registry";
import { INSIGHTS } from "@/lib/data/mock";

export const metadata: Metadata = { title: "Agents" };

const RISK_VARIANT = { low: "success", medium: "warning", high: "destructive" } as const;

export default function AgentsPage() {
  return (
    <main id="main-content" className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <PageHeader
        title="Agents"
        description="Ten specialized agents analyze your business. They recommend and explain — humans approve every consequential action."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((agent) => {
          const insightCount = INSIGHTS.filter((i) => i.agentId === agent.id).length;
          return (
            <Link key={agent.id} href={`/agents/${agent.id}`} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/50">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Bot className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </div>
                  <h2 className="mt-3 font-semibold">{agent.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{agent.mission}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant={RISK_VARIANT[agent.riskLevel]}>Risk: {agent.riskLevel}</Badge>
                    <Badge variant="outline">{insightCount} insight{insightCount === 1 ? "" : "s"}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
