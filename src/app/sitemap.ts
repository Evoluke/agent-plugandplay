import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const routes = [
    { path: "", changefreq: "weekly", priority: 1 },
    { path: "sobre-nos", changefreq: "monthly", priority: 0.8 },
    { path: "saiba-mais", changefreq: "monthly", priority: 0.75 },
    { path: "sob-demanda", changefreq: "monthly", priority: 0.75 },
    { path: "tools", changefreq: "weekly", priority: 0.7 },
    { path: "tools/calculadora-margem", changefreq: "weekly", priority: 0.7 },
    { path: "pricing", changefreq: "monthly", priority: 0.8 },
    { path: "contact", changefreq: "monthly", priority: 0.6 },
    { path: "privacy", changefreq: "yearly", priority: 0.5 },
    { path: "terms", changefreq: "yearly", priority: 0.5 },
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

