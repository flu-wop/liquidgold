import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { getScent } from "@/lib/scents";
import { getContentMap, content } from "@/lib/content";
import ProductDetailClient from "./ProductDetailClient";

// Content (descriptions) is DB-backed and edited live from /admin/content —
// force dynamic rendering so an edit shows up without a redeploy, same
// reasoning as the homepage.
export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = getProduct(handle);
  if (!product) notFound();

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

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <ProductDetailClient initial={product} scent={scent} descriptions={descriptions} />
    </section>
  );
}
