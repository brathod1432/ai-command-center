import type { Metadata } from "next";
import { DomainView } from "@/components/patterns/domain-view";

export const metadata: Metadata = { title: "Product" };

export default function ProductPage() {
  return (
    <DomainView
      domain="product"
      title="Product"
      description="Feature adoption, feedback clustering, roadmap health, and experiment readouts."
    />
  );
}
