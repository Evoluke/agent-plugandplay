import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const routes = [
    { path: "", changefreq: "weekly", priority: 1 },
    { path: "gerar-curriculo", changefreq: "weekly", priority: 0.9 },
    { path: "modelos-de-curriculo", changefreq: "weekly", priority: 0.8 },
    { path: "curriculo-primeiro-emprego", changefreq: "weekly", priority: 0.8 },
    { path: "como-fazer-curriculo-por-area", changefreq: "weekly", priority: 0.8 },
    { path: "blog", changefreq: "weekly", priority: 0.7 },
    { path: "blog/curriculo-ats-palavras-chave", changefreq: "monthly", priority: 0.6 },
    { path: "blog/carta-de-apresentacao-que-converte", changefreq: "monthly", priority: 0.6 },
    { path: "blog/template-curriculo-2025", changefreq: "monthly", priority: 0.6 },
    { path: "curriculo/enfermeiro", changefreq: "monthly", priority: 0.7 },
    { path: "curriculo/vendedor", changefreq: "monthly", priority: 0.7 },
    { path: "curriculo/designer", changefreq: "monthly", priority: 0.7 },
    { path: "privacy", changefreq: "yearly", priority: 0.3 },
    { path: "terms", changefreq: "yearly", priority: 0.3 },
  ];

  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route.path ? `/${route.path}` : ""}`,
    lastModified,
    changefreq: route.changefreq,
    priority: route.priority,
  }));
}

