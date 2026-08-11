import { ShieldX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/patterns/page-header";

/** Shared 403 view for server-side page-level RBAC (defense in depth). */
export function Forbidden({ title, message }: { title: string; message?: string }) {
  return (
    <main id="main-content" className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <PageHeader title={title} />
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <ShieldX className="h-8 w-8 text-destructive" aria-hidden="true" />
          <p className="font-medium">You don&apos;t have access to this area.</p>
          <p className="max-w-md text-sm text-muted-foreground">
            {message ?? "Your role doesn't include the required permission. Ask an administrator if you need access."}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
