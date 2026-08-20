import { getDb, ensureSchema } from "./db";

// ── Editable site content ──
// Only the fields listed here are editable by Ariel — everything else
// (layout, structure, checkout logic, pricing) stays code-only, which is
// the whole point: she can change wording/images without any way to break
// the site. Each field has a hardcoded DEFAULT (the current copy) that's
// used until she overrides it, and the DB read fails open to that default
// if Turso ever hiccups — an editable-content outage should never take
// down a page that doesn't actually need editing right now.

export const CONTENT_FIELDS = {
  "hero.headline": { label: "Homepage Headline", type: "text", default: "Your skin just went on vacation." },
  "hero.subheadline": { label: "Homepage Subheadline", type: "textarea", default: "Island-inspired body care made to leave your skin soft, glowing, and impossible to forget." },
  "hero.image": { label: "Homepage Hero Photo", type: "image", default: "/images/products/hero-ritual.jpg" },

  "about.story": { label: "About — My Story (one paragraph per line)", type: "textarea", default:
`I'm Ariel Salgado — founder of Liquid Gold Skin Co.
This brand is more than skin deep to me. It's family deep. It's a story of growth, resilience, and learning how to love myself, one small habit at a time.
Being surrounded by the incredibly strong women in my family set my mind on success & what it could look like, but the way I measured success was a bit different. I paved my own path, was on the ground running at 18. Corporate lifestyle was never for me. I knew I had to be my own boss. Creating discipline and healthy habits for myself didn't come easy. I lost my mother before the age of 20 — she was a great pillar of success in my life. Losing my mother young felt like a setback, and I no longer knew what it meant to take care of myself. I was not living, I was surviving.
And through that survival, you grow. I didn't know what was right or wrong, but I knew one thing: I love to learn. I dove into research, experimented with natural ingredients, and slowly began creating products for myself.
My skin journey began in 2019 — this has become my life and my passion. Over the years, I continued to make transitions out of consumerism that is detrimental to our skin and ultimately our health. This is my way of transforming an idea taught to us that we know to question but are confused how to into something beautiful and intentional.
Thank you for being here and for joining me on this journey. Your glow is waiting.` },
  "about.founderImage": { label: "About — Founder Photo", type: "image", default: "/images/brand/founder-ariel.jpg" },
  "about.mission": { label: "About — Our Mission (one paragraph per line)", type: "textarea", default:
`At Liquid Gold Skin Co., we believe self care isn't just a luxury — it's a necessity. Every product is made with love and intention, turning your daily skincare into a ritual of self love and a reminder to let go of the harsh chemicals and preservatives. Preserve yourself inside and out.
This is a journey that we are on together — letting go of the unnatural and making the effort to enjoy taking care of our body and skin more than ever. It is a war against the unnatural, and together we are going to win!` },

  "scent.cocoa-cashmere.story": { label: "Cocoa Cashmere — Story", type: "textarea", default: "A warm, creamy fragrance that wraps the skin in coconut, soft florals, vanilla-tonka warmth, woods, amber, and musk." },
  "scent.cocoa-cashmere.vibe": { label: "Cocoa Cashmere — Vibe", type: "text", default: "Cozy, sexy, warm, comforting, and addictive." },
  "scent.cocoa-cashmere.image": { label: "Cocoa Cashmere — Photo", type: "image", default: "/images/products/cocoa-cashmere-butter.jpg" },

  "scent.juicy-paradise.story": { label: "Juicy Paradise — Story", type: "textarea", default: "A juicy tropical blend overflowing with ripe peach, guava, mango, papaya, and soft white florals." },
  "scent.juicy-paradise.vibe": { label: "Juicy Paradise — Vibe", type: "text", default: "Bright sunshine, tropical fruit, warm skin, and vacation energy." },
  "scent.juicy-paradise.image": { label: "Juicy Paradise — Photo", type: "image", default: "/images/products/juicy-paradise.png" },

  "scent.bare-current.story": { label: "Bare Current — Story", type: "textarea", default: "A fresh, skin-like fragrance inspired by warm sun, ocean air, sea spray, soft jasmine, and marine musk." },
  "scent.bare-current.vibe": { label: "Bare Current — Vibe", type: "text", default: "Fresh out of the ocean, sun-warmed skin, clean air, and effortless island energy." },
  "scent.bare-current.image": { label: "Bare Current — Photo", type: "image", default: "/images/products/bare-current-oil.jpg" },

  "scent.pink-fantasy.story": { label: "Pink Fantasy — Story", type: "textarea", default: "A playful, tropical fragrance made to feel bright, feminine, fun, and vacation-ready." },
  "scent.pink-fantasy.vibe": { label: "Pink Fantasy — Vibe", type: "text", default: "Pink sunsets, tropical drinks, warm weather, and flirty island energy." },
  "scent.pink-fantasy.image": { label: "Pink Fantasy — Photo", type: "image", default: "/images/products/pink-fantasy.jpg" },

  "scent.unscented.story": { label: "Unscented — Story", type: "textarea", default: "No added fragrance. Naturally carries a light cocoa butter aroma." },
  "scent.unscented.vibe": { label: "Unscented — Vibe", type: "text", default: "For customers who want deep moisture without fragrance." },
  "scent.unscented.image": { label: "Unscented — Photo", type: "image", default: "/images/products/unscented-butter.jpg" },
} as const;

export type ContentKey = keyof typeof CONTENT_FIELDS;

export async function getContentMap(): Promise<Partial<Record<ContentKey, string>>> {
  try {
    await ensureSchema();
    const db = getDb();
    const result = await db.execute("SELECT key, value FROM content");
    const map: Partial<Record<ContentKey, string>> = {};
    for (const row of result.rows) {
      map[row.key as ContentKey] = row.value as string;
    }
    return map;
  } catch (e) {
    console.error("content fetch failed, using defaults", e);
    return {};
  }
}

export function content(map: Partial<Record<ContentKey, string>>, key: ContentKey): string {
  return map[key] ?? CONTENT_FIELDS[key].default;
}

export async function setContentValue(key: ContentKey, value: string) {
  if (!(key in CONTENT_FIELDS)) throw new Error(`Unknown content field: ${key}`);
  await ensureSchema();
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO content (key, value, updated_at) VALUES (?, ?, unixepoch())
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = unixepoch()`,
    args: [key, value],
  });
}

// Shared helper — every place that displays a scent (homepage rows, scent
// destination pages, quiz results) pulls story/vibe/image through here so
// an edit in admin shows up everywhere that scent appears, consistently.
export function getScentContent(map: Partial<Record<ContentKey, string>>, slug: string) {
  return {
    story: map[`scent.${slug}.story` as ContentKey] ?? CONTENT_FIELDS[`scent.${slug}.story` as ContentKey]?.default,
    vibe: map[`scent.${slug}.vibe` as ContentKey] ?? CONTENT_FIELDS[`scent.${slug}.vibe` as ContentKey]?.default,
    image: map[`scent.${slug}.image` as ContentKey] ?? CONTENT_FIELDS[`scent.${slug}.image` as ContentKey]?.default,
  };
}
