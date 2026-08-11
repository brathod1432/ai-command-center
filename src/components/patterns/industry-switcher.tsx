"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { INDUSTRIES } from "@/lib/data/catalog";
import { cn } from "@/lib/utils";

export function IndustrySwitcher() {
  const [activeId, setActiveId] = useState(INDUSTRIES[0].id);
  const active = INDUSTRIES.find((i) => i.id === activeId) ?? INDUSTRIES[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <div className="flex flex-wrap gap-2 lg:flex-col">
        {INDUSTRIES.map((ind) => (
          <Button
            key={ind.id}
            variant={ind.id === activeId ? "default" : "outline"}
            size="sm"
            className={cn("justify-start", ind.id === activeId ? "" : "text-muted-foreground")}
            onClick={() => setActiveId(ind.id)}
            aria-pressed={ind.id === activeId}
          >
            {ind.name}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{active.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{active.summary}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Key agents</p>
            <div className="flex flex-wrap gap-2">
              {active.keyAgents.map((a) => (
                <Badge key={a} variant="secondary">{a}</Badge>
              ))}
            </div>
          </div>
          <div className="rounded-md border bg-muted/40 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sample insight</p>
            <p className="mt-1 text-sm">{active.sampleInsight}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
