import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";
import Price from "@/components/ui/Price";

const BADGES: Record<string, string> = {
  Bundle: "Bundle & Save",
  Perfume: "New",
  "Travel Kit": "New",
};

export default function ProductCard({
  product,
  sizes = "(max-width: 768px) 50vw, 25vw",
}: {
  product: Product;
  sizes?: string;
}) {
  const badge = BADGES[product.type];
  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-sand"
    >
      <div className="clip-corner relative aspect-[3/4] w-full overflow-hidden bg-sand">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        {/* Second shot fades in on hover (desktop pointer only — on touch
            the first tap navigates, so there's no hover state to show). */}
        {product.hoverImage && (
          <Image
            src={product.hoverImage}
            alt=""
            aria-hidden
            fill
            sizes={sizes}
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none"
          />
        )}
        {badge && (
          <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cocoa backdrop-blur">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-lg leading-snug text-cocoa md:text-xl">
        <span className="bg-gradient-to-r from-gold to-gold bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 group-hover:bg-[length:100%_1px] motion-reduce:transition-none">
          {product.name.split(" — ")[0]}
        </span>
      </p>
      <p className="mt-0.5 text-xs uppercase tracking-wide text-cocoa/70 md:text-sm">
        {product.type} · {product.size}
      </p>
      <Price price={product.price} compareAt={product.compareAtPrice} className="mt-1" />
    </Link>
  );
}
