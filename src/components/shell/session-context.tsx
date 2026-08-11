"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Role } from "@/lib/types";

export interface SessionInfo {
  userId: string;
  name: string;
  email: string;
  role: Role;
  tenantId: string;
  tenantName: string;
}

const SessionContext = createContext<SessionInfo | null>(null);

export function SessionProvider({ value, children }: { value: SessionInfo; children: ReactNode }) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionInfo {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
