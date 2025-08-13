import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const routes = [
    { path: "", changefreq: "weekly", priority: 1 },
    { path: "pricing", changefreq: "monthly", priority: 0.8 },
    { path: "login", changefreq: "monthly", priority: 0.5 },
    { path: "signup", changefreq: "monthly", priority: 0.5 },
    { path: "forgot-password", changefreq: "yearly", priority: 0.3 },
    { path: "verify-email", changefreq: "yearly", priority: 0.3 },
    { path: "update-password", changefreq: "yearly", priority: 0.3 },
    { path: "complete-profile", changefreq: "yearly", priority: 0.3 },
  ];

  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route.path ? `/${route.path}` : ""}`,
    lastModified,
    changefreq: route.changefreq,
    priority: route.priority,
  }));
}

