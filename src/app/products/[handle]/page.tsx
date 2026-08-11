import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { getScent } from "@/lib/scents";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = getProduct(handle);
  if (!product) notFound();

  const scent = getScent(product.scent);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <ProductDetailClient initial={product} scent={scent} />
    </section>
  );
}
