import type { Metadata } from "next";
import { DomainView } from "@/components/patterns/domain-view";

export const metadata: Metadata = { title: "Finance" };

export default function FinancePage() {
  return (
    <DomainView
      domain="finance"
      title="Finance"
      description="Cash runway, overdue AR, burn, and budget variance. All financial actions require approval."
    />
  );
}
