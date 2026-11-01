"use client";

import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import { motion, useScroll, useSpring } from "framer-motion";

// 2px gold hairline across the top of the viewport showing page progress.
// scaleX only (transform), hidden entirely for reduced-motion users.
export default function ScrollProgress() {
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  if (reduce) return null;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-gold via-gold-light to-guava"
      style={{ scaleX }}
    />
  );
}
