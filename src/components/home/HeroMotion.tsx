"use client";

import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

// Line-by-line headline entrance: each line slides up out of its own
// overflow-hidden mask. `accentLast` gives the final line the gold-italic
// treatment (default headline only — see Hero.tsx).
export function HeroHeadline({
  lines,
  accentLast,
  className,
}: {
  lines: string[];
  accentLast: boolean;
  className: string;
}) {
  const reduce = useReducedMotionSafe();
  return (
    <h1 className={className}>
      {lines.map((line, i) => {
        const isAccent = accentLast && i === lines.length - 1;
        const inner = (
          <span className={isAccent ? "text-gold-gradient inline-block pr-[0.08em] italic" : "inline-block"}>
            {line}
          </span>
        );
        return (
          <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
            {reduce ? (
              inner
            ) : (
              <motion.span
                className="inline-block"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.05, ease: EASE, delay: 0.15 + i * 0.12 }}
              >
                {inner}
              </motion.span>
            )}
          </span>
        );
      })}
    </h1>
  );
}

// Fades the supporting copy/CTAs in after the headline lands.
export function HeroFade({ children, delay = 0.6, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotionSafe();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

// Slow settle-in scale on load + gentle scroll parallax. Only the hero
// image is `priority`.
export function HeroImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y }}>
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { scale: 1.14, opacity: 0.4 }}
          animate={{ scale: 1.04, opacity: 1 }}
          transition={{ duration: 2.2, ease: EASE }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 62vw"
            className="object-cover"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
