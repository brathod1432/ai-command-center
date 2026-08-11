import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/current-user";
import { AppShell } from "@/components/shell/app-shell";
import { TENANT } from "@/lib/data/mock";

/** Protected application shell. Defense in depth: middleware also guards these routes. */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <AppShell
      session={{
        userId: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
        tenantId: session.tenantId,
        tenantName: TENANT.name,
      }}
    >
      {children}
    </AppShell>
  );
}
