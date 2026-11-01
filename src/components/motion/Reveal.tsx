"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

// Fade-up on scroll into view. Animates transform + opacity only, runs
// once, and renders a plain static wrapper for reduced-motion users.
// Server components can wrap their markup in these — children stay
// server-rendered, only the wrapper hydrates.

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "section";
};

export default function Reveal({ children, className, delay = 0, y = 28, as = "div" }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

const group: Variants = {
  hidden: {},
  show: (stagger: number) => ({ transition: { staggerChildren: stagger } }),
};
const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

// Stagger variant: wrap a grid in <RevealGroup>, each child in <RevealItem>.
export function RevealGroup({
  children,
  className,
  id,
  stagger = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div id={id} className={className}>{children}</div>;
  return (
    <motion.div
      id={id}
      className={className}
      variants={group}
      custom={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}
