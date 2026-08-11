"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AuditRecord } from "@/lib/types";
import { useAudit } from "@/hooks/use-governance";

const OUTCOME_VARIANT: Record<AuditRecord["outcome"], BadgeProps["variant"]> = {
  approved: "success",
  declined: "destructive",
  changes_requested: "warning",
  info: "secondary",
};

export function AuditTable({ initialRecords }: { initialRecords: AuditRecord[] }) {
  const { data: records = [] } = useAudit(initialRecords);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) =>
      [r.action, r.category, r.actorRole, r.outcome, r.reason ?? ""].join(" ").toLowerCase().includes(q),
    );
  }, [records, query]);

  function exportJson() {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `helm-audit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by action, role, outcome…"
            className="max-w-xs"
            aria-label="Filter audit records"
          />
          <Button variant="outline" size="sm" onClick={exportJson} className="ml-auto">
            <Download className="h-4 w-4" aria-hidden="true" />
            Export JSON
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Immutable audit trail of decisions and events</caption>
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-2 py-2">Time</th>
                <th scope="col" className="px-2 py-2">Actor role</th>
                <th scope="col" className="px-2 py-2">Category</th>
                <th scope="col" className="px-2 py-2">Action</th>
                <th scope="col" className="px-2 py-2">Tier</th>
                <th scope="col" className="px-2 py-2">Outcome</th>
                <th scope="col" className="px-2 py-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2 py-8 text-center text-muted-foreground">
                    No matching audit records.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="whitespace-nowrap px-2 py-2 tabular-nums text-muted-foreground">
                      {new Date(r.timestamp).toLocaleString()}
                    </td>
                    <td className="px-2 py-2 capitalize">{r.actorRole}</td>
                    <td className="px-2 py-2">{r.category}</td>
                    <td className="px-2 py-2">{r.action}</td>
                    <td className="px-2 py-2">{r.tier}</td>
                    <td className="px-2 py-2">
                      <Badge variant={OUTCOME_VARIANT[r.outcome]}>{r.outcome.replace(/_/g, " ")}</Badge>
                    </td>
                    <td className="px-2 py-2 text-muted-foreground">{r.reason ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
