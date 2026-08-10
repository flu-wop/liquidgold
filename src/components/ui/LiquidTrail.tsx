// Signature element: a soft flowing gold-to-guava trail that connects
// sections — reads as water motion (Bermuda) and as "liquid gold" (the
// name), used instead of a hard straight divider line between sections.
export default function LiquidTrail({ flip = false }: { flip?: boolean }) {
  return (
    <div
      className={`w-full overflow-hidden leading-none ${flip ? "rotate-180" : ""}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        className="h-10 w-full md:h-14"
      >
        <defs>
          <linearGradient id="liquidTrailGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D9A441" />
            <stop offset="100%" stopColor="#FF6F52" />
          </linearGradient>
        </defs>
        <path
          d="M0,30 C150,60 350,0 600,30 C850,60 1050,0 1200,30 L1200,60 L0,60 Z"
          fill="url(#liquidTrailGradient)"
          opacity="0.15"
        />
      </svg>
    </div>
  );
}
