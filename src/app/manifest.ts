import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Helm — AI Business Operations Platform",
    short_name: "Helm",
    description: "An enterprise AI operations center with multi-agent insights and human-in-the-loop governance.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
  };
}
