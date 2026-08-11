import type { Metadata } from "next";
import { DomainView } from "@/components/patterns/domain-view";

export const metadata: Metadata = { title: "Customer Success" };

export default function CustomersPage() {
  return (
    <DomainView
      domain="customer_success"
      title="Customer Success"
      description="Account health, churn early-warning, renewals, and expansion signals."
    />
  );
}
