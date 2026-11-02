import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { getCustomProducts } from "@/lib/custom-products";
import { getScent } from "@/lib/scents";
import { getContentMap, content } from "@/lib/content";
import { getHiddenScentSlugs } from "@/lib/scent-visibility";
import ProductDetailClient from "./ProductDetailClient";

// Content (descriptions) is DB-backed and edited live from /admin/content —
// force dynamic rendering so an edit shows up without a redeploy, same
// reasoning as the homepage.
export const dynamic = "force-dynamic";

async function findProduct(handle: string) {
  return getProduct(handle) ?? (await getCustomProducts({ includeInactive: false })).find((p) => p.handle === handle);
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await findProduct(handle);
  if (!product) return { title: "Product not found" };
  const name = product.name.split(" — ")[0];
  const description = `${name} (${product.size}) — $${product.price.toFixed(2)}. ${product.description}`.slice(0, 300);
  return {
    title: name,
    description,
    alternates: { canonical: `/products/${product.handle}` },
    openGraph: { title: name, description, images: [{ url: product.image, alt: name }] },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  let product = getProduct(handle);
  let isCustom = false;
  if (!product) {
    const custom = await getCustomProducts({ includeInactive: false });
    product = custom.find((p) => p.handle === handle);
    isCustom = true;
  }
  if (!product) notFound();

  // Hidden scents are meant to be fully off the site — a direct link to
  // one of their SKUs shouldn't still work just because listings hide it.
  const hiddenSlugs = await getHiddenScentSlugs();
  if (hiddenSlugs.has(product.scent)) notFound();

  const scent = getScent(product.scent);

  // Description is admin-editable, shared per product type (Body Butter /
  // Body Oil) rather than per individual SKU — same as it's always worked,
  // just now overridable from /admin/content instead of hardcoded. Passed
  // as both variants since the client component lets shoppers toggle
  // Body Butter <-> Body Oil without a page reload.
  const contentMap = await getContentMap();
  const descriptions = {
    bodyButter: content(contentMap, "product.bodyButter.description"),
    bodyOil: content(contentMap, "product.bodyOil.description"),
  };

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.liquidgoldskinco.com").replace(/\/$/, "");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name.split(" — ")[0],
    description: product.description,
    sku: product.handle,
    image: `${siteUrl}${product.image}`,
    brand: { "@type": "Brand", name: "Liquid Gold Skin Co." },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${product.handle}`,
      priceCurrency: "USD",
      price: product.price.toFixed(2),
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <script
        type="application/ld+json"
        // escape "<" so product copy can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductDetailClient initial={product} scent={scent} descriptions={descriptions} isCustom={isCustom} />
    </section>
  );
}
