import Hero from "@/components/home/Hero";
import BestSellers from "@/components/home/BestSellers";
import LiquidTrail from "@/components/ui/LiquidTrail";
import MeetTheScents from "@/components/home/MeetTheScents";
import ShopByMood from "@/components/home/ShopByMood";
import WhyLiquidGold from "@/components/home/WhyLiquidGold";
import Reviews from "@/components/home/Reviews";
import JoinParadise from "@/components/home/JoinParadise";
import { getContentMap, content } from "@/lib/content";

// Fetched fresh per request (not baked in at build time) so edits made in
// admin show up without a redeploy — fails open to defaults, same pattern
// as the shop page's stock counts.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const contentMap = await getContentMap();
  return (
    <>
      <Hero
        headline={content(contentMap, "hero.headline")}
        subheadline={content(contentMap, "hero.subheadline")}
        image={content(contentMap, "hero.image")}
      />
      <BestSellers />
      <LiquidTrail />
      <MeetTheScents contentMap={contentMap} />
      <ShopByMood />
      <WhyLiquidGold />
      <Reviews />
      <JoinParadise />
    </>
  );
}
