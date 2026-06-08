import type { MetadataRoute } from "next";

const BASE = "https://www.promptdolphin.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/for-teams", "/trust", "/privacy"];
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
