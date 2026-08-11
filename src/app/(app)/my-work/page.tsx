import type { Metadata } from "next";
import { PageHeader } from "@/components/patterns/page-header";
import { MyWork } from "@/components/patterns/my-work";
import { getSession } from "@/lib/auth/current-user";
import { store } from "@/lib/data/store";

export const metadata: Metadata = { title: "My Work" };

export default async function MyWorkPage() {
  const session = await getSession();
  const actions = store.listActions(session?.tenantId ?? "acme");

  return (
    <main id="main-content" className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <PageHeader
        title="My Work"
        description={`What's on your plate, ${session?.name ?? "there"} — approvals waiting on you, actions you own, and what you've closed.`}
      />
      <MyWork initialActions={actions} />
    </main>
  );
}
