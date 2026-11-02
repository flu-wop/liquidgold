// Single source of truth for promo codes and shipping rules, imported by
// both the checkout API (authoritative) and the checkout page (display
// only). Pure data — no server imports — so it's safe in client bundles.
//
// To add, rename or retire a code, edit PROMOS below. Codes are matched
// case-insensitively. Word-of-mouth codes are simply never shown on the
// site; share them directly with people.

export const FREE_SHIPPING_THRESHOLD = 75; // dollars, on the pre-discount subtotal
export const FLAT_SHIPPING = 6; // dollars

export type Promo =
  | { kind: "percent"; value: number; label: string }
  | { kind: "freeShipping"; label: string };

export const PROMOS: Record<string, Promo> = {
  // New
  FREESHIP: { kind: "freeShipping", label: "Free shipping" },
  WORDOFMOUTH10: { kind: "percent", value: 10, label: "10% off" },
  // Existing
  ISLAND15: { kind: "percent", value: 15, label: "15% off" },
  ISLAND20: { kind: "percent", value: 20, label: "20% off" },
};

export function findPromo(input: string | undefined | null): { code: string; promo: Promo } | null {
  if (!input || typeof input !== "string") return null;
  const code = input.trim().toUpperCase();
  const promo = Object.prototype.hasOwnProperty.call(PROMOS, code) ? PROMOS[code] : undefined;
  return promo ? { code, promo } : null;
}

export function shippingFor(subtotalDollars: number, promo?: Promo | null): number {
  if (subtotalDollars === 0) return 0;
  if (promo?.kind === "freeShipping") return 0;
  return subtotalDollars >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
}
