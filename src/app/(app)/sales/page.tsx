import type { Metadata } from "next";
import { DomainView } from "@/components/patterns/domain-view";

export const metadata: Metadata = { title: "Sales" };

export default function SalesPage() {
  return (
    <DomainView
      domain="sales"
      title="Sales"
      description="Pipeline health, at-risk deals, forecast accuracy, and next best actions."
    />
  );
}
