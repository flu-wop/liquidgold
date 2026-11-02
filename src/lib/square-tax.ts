import { getSquare } from "./square";

// Sales tax lives in Square (Dashboard → Items → Taxes). Checkout attaches
// every tax that is (a) enabled and (b) active at THIS site's location to
// the Square order; Square then computes the amount itself.
//
// A tax that exists but is switched off, or only active at a different
// location, is silently ignored by Square — which is how a sale can go
// through with $0 tax even though "tax is on". This module makes that
// visible: checkout logs/alerts on it, and /admin/system shows it.

export type SquareTax = {
  id: string;
  name: string;
  percentage: string;
  enabled: boolean;
  activeHere: boolean;
  additive: boolean;
  why?: string; // set when the tax will NOT be applied
};

export async function getSquareTaxes(): Promise<{ taxes: SquareTax[]; error?: string }> {
  const loc = process.env.SQUARE_LOCATION_ID;
  const taxes: SquareTax[] = [];
  try {
    const pager = await getSquare().catalog.list({ types: "TAX" });
    for await (const obj of pager) {
      if (obj.type !== "TAX" || !obj.id) continue;
      const d = obj.taxData;
      const enabled = d?.enabled === true;
      const absent = (obj.absentAtLocationIds ?? []).includes(loc ?? "");
      const present = obj.presentAtAllLocations !== false || (obj.presentAtLocationIds ?? []).includes(loc ?? "");
      const activeHere = present && !absent;
      let why: string | undefined;
      if (!enabled) why = "switched off in Square";
      else if (!activeHere) why = "not active at this site's Square location";
      taxes.push({
        id: obj.id,
        name: d?.name ?? "Tax",
        percentage: d?.percentage ?? "?",
        enabled,
        activeHere,
        additive: d?.inclusionType !== "INCLUSIVE",
        why,
      });
    }
    return { taxes };
  } catch (e) {
    return { taxes, error: e instanceof Error ? e.message : String(e) };
  }
}

export const applicableTaxes = (taxes: SquareTax[]) => taxes.filter((t) => !t.why);

// Optional manual fallback, e.g. SALES_TAX_PERCENT=6.5 (+ SALES_TAX_NAME).
// Only used when Square returns NO applicable tax, so a Square-side
// misconfiguration can't silently cost her the tax on a sale.
export function fallbackTax(): { name: string; percentage: string } | null {
  const pct = parseFloat(process.env.SALES_TAX_PERCENT ?? "");
  if (!isFinite(pct) || pct <= 0 || pct > 25) return null;
  return { name: process.env.SALES_TAX_NAME || "Sales tax", percentage: String(pct) };
}
