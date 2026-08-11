import type { Metadata } from "next";
import Link from "next/link";
import { IndustrySwitcher } from "@/components/patterns/industry-switcher";

export const metadata: Metadata = {
  title: "Showcase",
  description: "See how Helm adapts across industries — technology, consulting, MSP, healthcare, insurance, finance, logistics, manufacturing, and enterprise.",
};

export default function ShowcasePage() {
  return (
    <main id="main-content" className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Adapts to your industry</h1>
          <p className="mt-1 text-muted-foreground">
            The same governed command center, tuned to what each business cares about most.
          </p>
        </div>
        <Link href="/login" className="text-sm text-primary underline-offset-4 hover:underline">
          Sign in →
        </Link>
      </div>
      <IndustrySwitcher />
    </main>
  );
}
