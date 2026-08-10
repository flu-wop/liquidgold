import Hero from "@/components/home/Hero";
import BestSellers from "@/components/home/BestSellers";
import LiquidTrail from "@/components/ui/LiquidTrail";
import MeetTheScents from "@/components/home/MeetTheScents";
import ShopByMood from "@/components/home/ShopByMood";
import WhyLiquidGold from "@/components/home/WhyLiquidGold";
import Reviews from "@/components/home/Reviews";
import JoinParadise from "@/components/home/JoinParadise";

export default function HomePage() {
  return (
    <>
      <Hero />
      <BestSellers />
      <LiquidTrail />
      <MeetTheScents />
      <ShopByMood />
      <WhyLiquidGold />
      <Reviews />
      <JoinParadise />
    </>
  );
}
