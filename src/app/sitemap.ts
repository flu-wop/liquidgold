import type { MetadataRoute } from "next";
import { scents } from "@/lib/scents";
import { products } from "@/lib/products";
import { getHiddenScentSlugs } from "@/lib/scent-visibility";
import { getCustomProducts } from "@/lib/custom-products";

const BASE_URL = "https://www.liquidgoldskinco.com";

// Rebuilt per request so hidden scents and newly added products are
// reflected without a redeploy. Placeholder pages (FAQ, blog) are left
// out until they have real content; cart/checkout/admin are never listed.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: [string, number][] = [
    ["", 1],
    ["/shop", 0.9],
    ["/scents", 0.9],
    ["/about", 0.6],
    ["/give-back", 0.5],
    ["/contact", 0.5],
    ["/quiz", 0.6],
    ["/wholesale", 0.5],
    ["/privacy", 0.2],
  ];

  const hidden = await getHiddenScentSlugs().catch(() => new Set<string>());
  const custom = await getCustomProducts({ includeInactive: false }).catch(() => []);

  return [
    ...staticRoutes.map(([route, priority]) => ({ url: `${BASE_URL}${route}`, lastModified: now, priority })),
    ...scents
      .filter((s) => !hidden.has(s.slug))
      .map((s) => ({ url: `${BASE_URL}/scents/${s.slug}`, lastModified: now, priority: 0.8 })),
    ...[...products, ...custom]
      .filter((p) => !hidden.has(p.scent))
      .map((p) => ({ url: `${BASE_URL}/products/${p.handle}`, lastModified: now, priority: 0.7 })),
  ];
}
