import { notFound } from "next/navigation";
import { getProduct, productsByScent } from "@/lib/products";
import { getScent } from "@/lib/scents";
import Button from "@/components/ui/Button";
import Reassurance from "@/components/ui/Reassurance";
import ProductCard from "@/components/ProductCard";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = getProduct(handle);
  if (!product) notFound();

  const scent = getScent(product.scent);
  const pairsWith = productsByScent(product.scent).filter(
    (p) => p.handle !== product.handle
  );

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-12 md:grid-cols-2">
        {/* PLACEHOLDER: real product photography + texture video go here */}
        <div className="blob grain aspect-square w-full bg-gradient-to-br from-guava/50 via-gold/50 to-lagoon/50" />
        <div>
          {scent && (
            <p className="text-xs font-semibold uppercase tracking-widest text-guava">
              {scent.name} · {scent.mood}
            </p>
          )}
          <h1 className="mt-2 font-display text-4xl text-cocoa">{product.name}</h1>
          <p className="mt-4 font-semibold text-2xl text-cocoa">${product.price}</p>
          <p className="mt-4 text-cocoa/70">{product.description}</p>

          {scent && (
            <p className="mt-4 text-sm text-cocoa/60">
              Notes: {scent.notes.join(" · ")}
            </p>
          )}

          {/* TODO(commerce): this button currently does nothing — wire to
              /api/checkout once Stripe is live */}
          <div className="mt-8 flex gap-4">
            <Button>Add to Cart</Button>
            <Button variant="ghost">Add to Wishlist</Button>
          </div>
          <Reassurance>
            {product.inStock ? "In stock, ships within 2 business days" : "Back-in-stock alerts coming soon"}
          </Reassurance>

          <div className="mt-10 border-t border-cocoa/10 pt-6 text-sm text-cocoa/70">
            <p className="font-semibold text-cocoa">How to Use</p>
            <p className="mt-1">
              Apply generously after showering while skin is still damp for
              maximum glow and absorption.
            </p>
          </div>
        </div>
      </div>

      {pairsWith.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-6 font-display text-2xl text-cocoa">
            Pairs well <span className="italic text-gold-gradient">with</span>
          </h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {pairsWith.map((p) => (
              <ProductCard key={p.handle} product={p} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
