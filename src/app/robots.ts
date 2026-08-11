import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // The app is a gated operations console; only marketing surfaces are public.
      allow: ["/", "/showcase"],
      disallow: ["/dashboard", "/agents", "/audit", "/api"],
    },
  };
}
