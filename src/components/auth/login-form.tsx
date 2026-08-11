"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Compass, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Role } from "@/lib/types";

const ROLE_HINTS: Record<Role, string> = {
  owner: "Full access, incl. T3 financial approvals",
  admin: "Manage users, roles, integrations",
  executive: "Full read + approve cross-functional actions",
  manager: "Approve domain actions (eng/sales/CS…)",
  analyst: "Read + generate insights, no approvals",
  viewer: "Read-only dashboards",
  auditor: "Read-only audit trail access",
};

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  // Role-based default landing (overridden by an explicit ?next=).
  const roleLanding: Record<Role, string> = {
    owner: "/dashboard",
    admin: "/dashboard",
    executive: "/dashboard",
    manager: "/my-work",
    analyst: "/dashboard",
    viewer: "/dashboard",
    auditor: "/audit",
  };

  const [email, setEmail] = useState("founder@example.com");
  const [role, setRole] = useState<Role>("executive");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Sign in failed");
        setLoading(false);
        return;
      }
      const destination = params.get("next") || roleLanding[role];
      router.push(destination);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Compass className="h-5 w-5" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl">Sign in to Helm</CardTitle>
        <p className="text-sm text-muted-foreground">
          Demo sign-in — choose a role to explore RBAC and governance.
        </p>
      </CardHeader>
      <CardContent>
        {params.get("reason") === "idle" ? (
          <p className="mb-4 rounded-md bg-info/10 px-3 py-2 text-sm text-info" role="status">
            You were signed out due to inactivity. Please sign in again.
          </p>
        ) : null}
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <Select id="role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {(Object.keys(ROLE_HINTS) as Role[]).map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </Select>
            <p className="text-xs text-muted-foreground">{ROLE_HINTS[role]}</p>
          </div>

          {error ? (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={loading}>
            <LogIn className="h-4 w-4" aria-hidden="true" />
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
