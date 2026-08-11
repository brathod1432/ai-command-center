import type { Metadata } from "next";
import { DomainView } from "@/components/patterns/domain-view";

export const metadata: Metadata = { title: "Operations" };

export default function OperationsPage() {
  return (
    <DomainView
      domain="operations"
      title="Operations"
      description="SLA monitoring, cross-team bottlenecks, vendor/cost signals, and process health."
    />
  );
}
