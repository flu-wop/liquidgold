import { products as staticProducts, getProduct as getStaticProduct, type Product } from "./products";
import { getCustomProducts } from "./custom-products";

// Storefront-facing: static catalog (always present) + active custom
// products only. Used by checkout, best-sellers, and the shop page's
// "More from the shop" section.
export async function getAllActiveProducts(): Promise<Product[]> {
  const custom = await getCustomProducts({ includeInactive: false });
  return [...staticProducts, ...custom];
}

// Checks static first (fast, no DB round trip for the 15 core SKUs) before
// falling back to custom products — used by checkout to validate a cart
// line server-side regardless of which catalog the product came from.
export async function getProductAsync(handle: string): Promise<Product | undefined> {
  const staticMatch = getStaticProduct(handle);
  if (staticMatch) return staticMatch;
  const custom = await getCustomProducts({ includeInactive: false });
  return custom.find((p) => p.handle === handle);
}

export async function getFeaturedProductsAsync(): Promise<Product[]> {
  const all = await getAllActiveProducts();
  return all.filter((p) => p.featured);
}
