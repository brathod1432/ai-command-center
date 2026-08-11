import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-12">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <LoginForm />
      </Suspense>
      <Link href="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
        ← Back to overview
      </Link>
    </main>
  );
}
