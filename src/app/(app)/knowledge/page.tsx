import type { Metadata } from "next";
import { PageHeader } from "@/components/patterns/page-header";
import { KnowledgeSearch } from "@/components/patterns/knowledge-search";
import { KNOWLEDGE_DOCS } from "@/lib/data/catalog";

export const metadata: Metadata = { title: "Knowledge" };

export default function KnowledgePage() {
  return (
    <main id="main-content" className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <PageHeader
        title="Knowledge"
        description="Institutional memory — policies, runbooks, and playbooks. Retrieval-ready for future AI (RAG) with citations."
      />
      <KnowledgeSearch docs={KNOWLEDGE_DOCS} />
    </main>
  );
}
