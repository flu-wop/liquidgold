import { clsx } from "clsx";

// CSS-only infinite marquee (no JS, so it can stay a server component).
// Content is rendered twice and the track slides by exactly -50%, so the
// loop is seamless. Pauses on hover and stops entirely under
// prefers-reduced-motion (see .marquee-track in globals.css).
export default function Marquee({
  items,
  className,
  duration = 32,
}: {
  items: string[];
  className?: string;
  duration?: number;
}) {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <li key={i} className="flex items-center whitespace-nowrap px-6">
          {t}
          <span aria-hidden className="ml-12 inline-block h-1.5 w-1.5 rotate-45 bg-gold" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className={clsx("marquee overflow-hidden", className)}>
      <div className="marquee-track flex w-max" style={{ animationDuration: `${duration}s` }}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
