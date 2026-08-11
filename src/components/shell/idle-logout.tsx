"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { csrfHeaders } from "@/lib/security/csrf-client";

/**
 * Signs the session out after a period of no interaction, complementing the
 * server's sliding-session idle window. Protects an unattended, authenticated
 * screen. See docs/improvements-v6.md §3 (S1).
 */
const IDLE_MS = 30 * 60 * 1000; // 30 minutes

export function IdleLogout() {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let firing = false;

    async function logout() {
      if (firing) return;
      firing = true;
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "content-type": "application/json", ...csrfHeaders() },
        });
      } catch {
        /* best-effort; navigate regardless */
      }
      router.push("/login?reason=idle");
      router.refresh();
    }

    function reset() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(logout, IDLE_MS);
    }

    const events: Array<keyof WindowEventMap> = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [router]);

  return null;
}
