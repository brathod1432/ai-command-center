"use client";

import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { KnowledgeDoc } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

/**
 * Keyword retrieval over the knowledge corpus (RAG-ready interface — see
 * docs/knowledge-architecture.md §5). Deterministic and testable; swappable
 * for a vector retriever later.
 */
export function KnowledgeSearch({ docs }: { docs: KnowledgeDoc[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((d) =>
      [d.title, d.body, d.type, d.owner, ...d.tags].join(" ").toLowerCase().includes(q),
    );
  }, [docs, query]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search policies, runbooks, playbooks…"
          className="pl-9"
          aria-label="Search knowledge base"
        />
      </div>

      {results.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No documents match “{query}”. Try a different term.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-medium">
                    <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
                    {d.title}
                  </span>
                  <Badge variant="outline" className="capitalize">{d.type.replace(/_/g, " ")}</Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{d.body}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>Owner: {d.owner}</span>
                  <span>·</span>
                  <span>v{d.version}</span>
                  <span>·</span>
                  <span>Updated {timeAgo(d.updatedAt)}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {d.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
