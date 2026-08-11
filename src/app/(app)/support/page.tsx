import type { Metadata } from "next";
import { DomainView } from "@/components/patterns/domain-view";

export const metadata: Metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <DomainView
      domain="support"
      title="Support"
      description="Ticket clustering, CSAT trends, SLA/first-response, and staffing-to-demand."
    />
  );
}
