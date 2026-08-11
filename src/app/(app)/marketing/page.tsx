import type { Metadata } from "next";
import { DomainView } from "@/components/patterns/domain-view";

export const metadata: Metadata = { title: "Marketing" };

export default function MarketingPage() {
  return (
    <DomainView
      domain="marketing"
      title="Marketing"
      description="Campaign performance, CAC/LTV signals, funnel conversion, and content ROI."
    />
  );
}
