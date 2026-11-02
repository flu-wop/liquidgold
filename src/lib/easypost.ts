// EasyPost shipping labels — wired but dormant until EASYPOST_API_KEY is
// set (no SDK dependency; plain REST over fetch).
//
// Env vars:
//   EASYPOST_API_KEY      required (use the TEST key first: EZTK...)
//   SHIP_FROM_NAME / SHIP_FROM_STREET1 / SHIP_FROM_STREET2 (optional)
//   SHIP_FROM_CITY / SHIP_FROM_STATE / SHIP_FROM_ZIP / SHIP_FROM_PHONE
//   SHIP_FROM_COMPANY     optional, defaults to "Liquid Gold Skin Co."

type OrderItem = { name: string; size: string; type: string; qty: number };

export class EasyPostNotConfigured extends Error {
  constructor(msg = "EasyPost isn't set up yet — add EASYPOST_API_KEY and the SHIP_FROM_* variables in Vercel.") {
    super(msg);
  }
}

export function easypostConfigured() {
  return !!process.env.EASYPOST_API_KEY && !!process.env.SHIP_FROM_STREET1;
}

// Estimated packed weight per unit, in ounces (product + jar/bottle +
// padding). Starting guesses — weigh one of each on a kitchen scale and
// adjust; the admin can also override the total per label.
const UNIT_OZ: Record<string, Record<string, number>> = {
  "Body Butter": { "4 oz": 6.5, "8 oz": 11 },
  "Body Oil": { "8 oz": 11 },
  Perfume: { default: 2.5 },
  "Travel Kit": { default: 12 },
  Bundle: { default: 22 },
};
const BOX_OZ = 4; // box + filler

export function estimateWeightOz(items: OrderItem[]) {
  const total = items.reduce((sum, i) => {
    const byType = UNIT_OZ[i.type] ?? {};
    const unit = byType[i.size] ?? byType.default ?? 8;
    return sum + unit * i.qty;
  }, BOX_OZ);
  return Math.max(1, Math.round(total * 10) / 10);
}

// Box size by total weight — small / medium / large.
function parcelFor(weightOz: number) {
  if (weightOz <= 24) return { length: 9, width: 6, height: 4, weight: weightOz };
  if (weightOz <= 60) return { length: 12, width: 9, height: 6, weight: weightOz };
  return { length: 14, width: 12, height: 8, weight: weightOz };
}

async function ep(path: string, body: unknown) {
  const key = process.env.EASYPOST_API_KEY;
  if (!key) throw new EasyPostNotConfigured();
  const res = await fetch(`https://api.easypost.com/v2${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${key}:`).toString("base64")}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `EasyPost error (${res.status})`);
  }
  return data;
}

export type LabelResult = {
  shipmentId: string;
  trackingCode: string;
  carrier: string;
  service: string;
  rate: string;
  labelUrl: string;
  trackingUrl: string | null;
};

export async function buyLabel(opts: {
  to: { name: string; street1: string; city: string; state: string; zip: string; email?: string };
  items: OrderItem[];
  weightOz?: number;
}): Promise<LabelResult> {
  if (!easypostConfigured()) throw new EasyPostNotConfigured();
  const e = process.env;
  const weight = opts.weightOz && opts.weightOz > 0 ? opts.weightOz : estimateWeightOz(opts.items);

  const shipment = await ep("/shipments", {
    shipment: {
      to_address: {
        name: opts.to.name,
        street1: opts.to.street1,
        city: opts.to.city,
        state: opts.to.state,
        zip: opts.to.zip,
        country: "US",
        email: opts.to.email,
      },
      from_address: {
        name: e.SHIP_FROM_NAME || "Liquid Gold Skin Co.",
        company: e.SHIP_FROM_COMPANY || "Liquid Gold Skin Co.",
        street1: e.SHIP_FROM_STREET1,
        street2: e.SHIP_FROM_STREET2 || undefined,
        city: e.SHIP_FROM_CITY,
        state: e.SHIP_FROM_STATE,
        zip: e.SHIP_FROM_ZIP,
        phone: e.SHIP_FROM_PHONE || undefined,
        country: "US",
      },
      parcel: parcelFor(weight),
      options: { label_format: "PDF", label_size: "4x6" },
    },
  });

  // Cheapest USPS rate (Ground Advantage for light parcels).
  const rates: { id: string; carrier: string; service: string; rate: string }[] = shipment.rates ?? [];
  const usps = rates.filter((r) => r.carrier === "USPS");
  const pool = usps.length ? usps : rates;
  if (pool.length === 0) throw new Error("No shipping rates came back — check the address and try again.");
  const best = pool.reduce((a, b) => (parseFloat(a.rate) <= parseFloat(b.rate) ? a : b));

  const bought = await ep(`/shipments/${shipment.id}/buy`, { rate: { id: best.id } });
  const labelUrl: string | undefined = bought.postage_label?.label_pdf_url ?? bought.postage_label?.label_url;
  if (!labelUrl || !bought.tracking_code) throw new Error("Label purchase didn't return a label — check EasyPost.");

  return {
    shipmentId: bought.id,
    trackingCode: bought.tracking_code,
    carrier: best.carrier,
    service: best.service,
    rate: best.rate,
    labelUrl,
    trackingUrl: bought.tracker?.public_url ?? null,
  };
}
