import Link from "next/link";
import { Activity, ArrowRight, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AGENTS } from "@/lib/agents/registry";

const FEATURES = [
  {
    icon: Activity,
    title: "Executive Command Center",
    body: "One unified picture of company health — what happened, why, the risks, and the top actions to take next.",
  },
  {
    icon: Sparkles,
    title: "Multi-Agent Insights",
    body: "Ten specialized agents analyze sales, engineering, finance, support and more — every insight cited and confidence-scored.",
  },
  {
    icon: ShieldCheck,
    title: "Human-in-the-Loop Governance",
    body: "AI recommends; humans decide. Every consequential action is approved and written to an immutable audit trail.",
  },
  {
    icon: Workflow,
    title: "Workflow Automation",
    body: "Automate reporting, escalations, and risk detection — always with an approval gate you control.",
  },
];

export default function HomePage() {
  return (
    <main id="main-content" className="mx-auto max-w-6xl px-6 py-16">
      <section className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Enterprise AI Operations Center
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Helm — the AI Business Operations Platform
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Understand what is happening across your company and what to do next — with evidence,
          confidence scores, and a human always in control.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/dashboard">
              Open the Command Center
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard">View a live demo</Link>
          </Button>
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <Card key={f.title}>
            <CardContent className="p-5">
              <f.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="mt-3 font-semibold">{f.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="text-center text-xl font-semibold">Ten specialized agents, one command center</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {AGENTS.map((a) => (
            <span key={a.id} className="rounded-full border bg-card px-3 py-1 text-sm">
              {a.name}
            </span>
          ))}
        </div>
      </section>

      <footer className="mt-20 border-t pt-6 text-center text-sm text-muted-foreground">
        Helm reference implementation · Documentation in <code>/docs</code> · Contact{" "}
        <a className="underline" href="mailto:bgrathod00@gmail.com">
          bgrathod00@gmail.com
        </a>
      </footer>
    </main>
  );
}
