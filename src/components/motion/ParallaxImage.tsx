"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { clsx } from "clsx";

// next/image in an overflow-hidden frame with a subtle scroll-linked
// y-translation (±`strength`%). The image is scaled up slightly so the
// drift never reveals an edge. Static under reduced motion.
export default function ParallaxImage({
  src,
  alt,
  sizes,
  className,
  imgClassName,
  priority = false,
  strength = 6,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);

  return (
    <div ref={ref} className={clsx("relative overflow-hidden", className)}>
      <motion.div
        className="absolute inset-0"
        style={reduce ? undefined : { y, scale: 1 + (strength * 2.4) / 100 }}
      >
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={clsx("object-cover", imgClassName)} />
      </motion.div>
    </div>
  );
}
