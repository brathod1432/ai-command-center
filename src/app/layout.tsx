import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://github.com/brathod1432/ai-command-center"),
  title: {
    default: "Helm — AI Business Operations Platform",
    template: "%s · Helm",
  },
  description:
    "An enterprise AI operations center: a unified command center with multi-agent insights and human-in-the-loop governance.",
  applicationName: "Helm",
  authors: [{ name: "bgrathod00" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <a href="#main-content" className="sr-only sr-only-focusable">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
