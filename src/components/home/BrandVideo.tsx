"use client";

import { useReducedMotionSafe } from "@/components/motion/useReducedMotionSafe";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";

// Homepage brand film. Built for phones first:
// - Portrait (9:16) encode on narrow/portrait screens, landscape (16:9)
//   elsewhere — picked client-side so a phone never downloads the wide file.
// - Nothing downloads until the section is near the viewport (preload
//   "none" + src set lazily), and playback pauses when scrolled away.
// - muted + playsInline so iOS/Android allow inline autoplay.
// - Reduced-motion users get the poster and a play button instead of
//   autoplay; everyone gets a visible pause/play control (WCAG 2.2.2).
// Footage: an 18.4s montage cut from four 4K iPhone clips (Cocoa Cashmere
// jar close-up, at the lake, on the rocks, flower-and-jar finish) with 0.4s
// crossfades and a seamless loop. Portrait = per-shot 9:16 crop of the 4K
// source, scaled to 720x1280; landscape = 16:9 at 1280x720. Both silent H.264.
const SOURCES = {
  portrait: {
    src: "/video/liquid-gold-ritual-v2-portrait.mp4",
    poster: "/video/liquid-gold-ritual-v2-poster-portrait.jpg",
  },
  landscape: {
    src: "/video/liquid-gold-ritual-v2-landscape.mp4",
    poster: "/video/liquid-gold-ritual-v2-poster-landscape.jpg",
  },
};

const PORTRAIT_QUERY = "(max-width: 767px), (orientation: portrait) and (max-width: 1024px)";

export default function BrandVideo() {
  const reduce = useReducedMotionSafe();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [variant, setVariant] = useState<"portrait" | "landscape" | null>(null);
  const [nearView, setNearView] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  // Pick the encode for this screen; follow rotation / resizes.
  useEffect(() => {
    const mq = window.matchMedia(PORTRAIT_QUERY);
    const update = () => setVariant(mq.matches ? "portrait" : "landscape");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Lazy-load when within ~one screen of the viewport; auto play/pause
  // while it's actually on screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const loader = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNearView(true);
          loader.disconnect();
        }
      },
      { rootMargin: "100% 0px" }
    );
    const player = new IntersectionObserver(
      ([e]) => {
        const v = videoRef.current;
        if (!v || !v.src) return;
        v.muted = true; // iOS needs the property, not just the attribute
        if (e.isIntersecting && !reduce && !userPaused) {
          v.play().catch(() => {
            /* autoplay blocked (e.g. Low Power Mode) — poster + play button stay */
          });
        } else if (!e.isIntersecting) {
          v.pause();
        }
      },
      { threshold: 0.35 }
    );
    loader.observe(el);
    player.observe(el);
    return () => {
      loader.disconnect();
      player.disconnect();
    };
  }, [reduce, userPaused, variant, nearView]);

  function toggle() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      setUserPaused(false);
      v.play().catch(() => {});
    } else {
      setUserPaused(true);
      v.pause();
    }
  }

  const source = variant ? SOURCES[variant] : null;

  return (
    <section
      ref={sectionRef}
      aria-label="Liquid Gold brand film"
      className="relative isolate overflow-hidden bg-cocoa"
    >
      <div className="relative aspect-[4/5] max-h-[88svh] w-full sm:aspect-[16/10] md:aspect-[21/9] md:max-h-[80vh]">
        {source && (
          <video
            key={source.src}
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            poster={source.poster}
            src={nearView ? source.src : undefined}
            preload="none"
            muted
            loop
            playsInline
            disablePictureInPicture
            aria-hidden
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
        )}
        {/* scrim for text legibility over any frame */}
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa from-10% via-cocoa/70 via-45% to-transparent md:bg-gradient-to-r md:from-cocoa/80 md:via-cocoa/30 md:to-transparent" />

        <div className="absolute inset-x-0 bottom-0 px-6 pb-10 md:inset-y-0 md:flex md:max-w-xl md:flex-col md:justify-center md:pb-0 md:pl-16">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-light">The Ritual</p>
          <h2 className="mt-3 font-display text-4xl leading-[1.02] text-cream sm:text-5xl md:text-6xl">
            Glow like you&rsquo;re on <span className="italic text-gold-light">island time.</span>
          </h2>
          <p className="mt-4 max-w-sm text-cream/85">
            Whipped butters, featherweight oils, and scents that feel like a passport stamp.
          </p>
          <div className="mt-7">
            <Button href="/shop">Shop the Escape</Button>
          </div>
        </div>

        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause brand video" : "Play brand video"}
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-cream/85 text-cocoa shadow-sm backdrop-blur transition-transform hover:scale-105 active:scale-95 motion-reduce:transition-none md:bottom-6 md:right-6 md:top-auto"
        >
          {playing ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M7 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L8.5 4.64A1 1 0 0 0 7 5.5Z" />
            </svg>
          )}
        </button>
      </div>
    </section>
  );
}
