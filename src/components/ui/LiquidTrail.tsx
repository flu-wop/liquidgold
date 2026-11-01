// Signature element: a soft flowing gold-to-guava trail that connects
// sections — reads as water motion (Bermuda) and as "liquid gold" (the
// name), used instead of a hard straight divider line between sections.
//
// The wave is periodic (repeats every 600 units), drawn twice as wide as
// the viewport and drifted sideways by exactly half its width, so the
// gentle loop is seamless. Pure CSS transform; static under reduced motion.
//
// `tone` fills the wave solid with the NEXT section's colour so the trail
// doubles as the transition between two differently coloured sections.
const TONES = {
  gold: null,
  cocoa: "#3A2318",
  cream: "#FFF8EF",
  sand: "#FBEEDD",
} as const;

const WAVE =
  "C150,60 350,0 600,30 C850,60 1050,0 1200,30 C1350,60 1550,0 1800,30 C2050,60 2250,0 2400,30";

export default function LiquidTrail({
  flip = false,
  tone = "gold",
}: {
  flip?: boolean;
  tone?: keyof typeof TONES;
}) {
  const solid = TONES[tone];
  return (
    <div
      className={`w-full overflow-hidden leading-none ${flip ? "rotate-180" : ""}`}
      aria-hidden
    >
      <div className="trail-drift flex w-[200%]">
        <svg viewBox="0 0 2400 60" preserveAspectRatio="none" className="h-10 w-full md:h-14">
          <defs>
            <linearGradient id="liquidTrailGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#D9A441" />
              <stop offset="50%" stopColor="#FF6F52" />
              <stop offset="100%" stopColor="#D9A441" />
            </linearGradient>
          </defs>
          <path
            d={`M0,30 ${WAVE} L2400,60 L0,60 Z`}
            fill={solid ?? "url(#liquidTrailGradient)"}
            opacity={solid ? 1 : 0.15}
          />
          {/* hairline of liquid gold riding the crest */}
          <path
            d={`M0,30 ${WAVE}`}
            fill="none"
            stroke="url(#liquidTrailGradient)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            opacity={solid ? 0.9 : 0.6}
          />
        </svg>
      </div>
    </div>
  );
}
