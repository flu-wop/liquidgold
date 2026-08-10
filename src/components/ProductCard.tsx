import Link from "next/link";
import type { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.handle}`} className="group block">
      <div className="blob grain aspect-square w-full bg-gradient-to-br from-guava/40 via-gold/40 to-lagoon/40 transition-transform duration-300 group-hover:scale-[1.02]" />
      <p className="mt-4 font-display text-lg text-cocoa">{product.name}</p>
      <p className="text-sm text-cocoa/60">{product.type}</p>
      <p className="mt-1 font-semibold text-guava">${product.price}</p>
    </Link>
  );
}
