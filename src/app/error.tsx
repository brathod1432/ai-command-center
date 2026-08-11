"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Report to the error pipeline (see docs/observability.md §7).
    // eslint-disable-next-line no-console
    console.error(JSON.stringify({ level: "error", message: "client.error_boundary", digest: error.digest }));
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <TriangleAlert className="h-10 w-10 text-destructive" aria-hidden="true" />
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        An unexpected error occurred. The details have been logged{error.digest ? ` (ref: ${error.digest})` : ""}. You can
        try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
