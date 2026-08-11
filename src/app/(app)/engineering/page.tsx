import type { Metadata } from "next";
import { DomainView } from "@/components/patterns/domain-view";

export const metadata: Metadata = { title: "Engineering" };

export default function EngineeringPage() {
  return (
    <DomainView
      domain="engineering"
      title="Engineering"
      description="Sprint-goal risk, delivery throughput, review latency, and quality signals."
    />
  );
}
