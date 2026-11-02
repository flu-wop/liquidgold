import { clsx } from "clsx";

// Prices always render with cents ($14.99, $25.00) so the catalog reads
// consistently now that retail prices aren't whole dollars.
export function formatPrice(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function Price({
  price,
  compareAt,
  className,
  size = "md",
}: {
  price: number;
  compareAt?: number;
  className?: string;
  size?: "md" | "lg";
}) {
  const onSale = compareAt !== undefined && compareAt > price;
  return (
    <p className={clsx("flex flex-wrap items-baseline gap-x-2", className)}>
      <span
        className={clsx(
          "font-semibold",
          size === "lg" ? "text-2xl text-cocoa" : "text-guava-deep"
        )}
      >
        {formatPrice(price)}
      </span>
      {onSale && (
        <>
          <span className={clsx("text-cocoa/70 line-through", size === "lg" ? "text-lg" : "text-sm")}>
            <span className="sr-only">Regular price </span>
            {formatPrice(compareAt)}
          </span>
          <span className="rounded-full bg-lagoon/10 px-2 py-0.5 text-xs font-semibold text-lagoon-deep">
            Save {formatPrice(compareAt - price)}
          </span>
        </>
      )}
    </p>
  );
}
