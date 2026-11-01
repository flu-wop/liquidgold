"use client";

import { useSyncExternalStore } from "react";

// prefers-reduced-motion, hydration-safe. framer-motion's useReducedMotion
// reads matchMedia during the first client render, so reduced-motion
// users got a different tree than the server rendered (React #418).
// useSyncExternalStore uses the server snapshot (false) while hydrating,
// then re-renders with the real value — no mismatch, and reduced-motion
// users still end up with fully static markup.
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function useReducedMotionSafe(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
