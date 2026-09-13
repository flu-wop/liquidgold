import type { MetadataRoute } from "next";

const BASE_URL = "https://www.liquidgoldskinco.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/shop",
    "/about",
    "/give-back",
    "/faq",
    "/contact",
    "/quiz",
    "/wholesale",
    "/privacy",
  ];

  return staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));
}
