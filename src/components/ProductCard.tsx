import Link from "next/link";
import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.handle}`} className="group block">
      <div className="clip-corner grain aspect-[3/4] w-full bg-gradient-to-br from-guava/50 via-gold/50 to-lagoon/50 transition-transform duration-300 group-hover:scale-[1.02]" />
      <p className="mt-4 font-display text-xl text-cocoa">
        {product.name.split(" — ")[0]}
      </p>
      <p className="text-sm uppercase tracking-wide text-cocoa/50">
        {product.type} · {product.size}
      </p>
      <p className="mt-1 font-semibold text-guava">${product.price}</p>
    </Link>
  );
}
