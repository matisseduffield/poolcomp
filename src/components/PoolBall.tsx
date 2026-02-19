"use client";

interface PoolBallProps {
  number: number;
  winner: "matisse" | "joe" | null;
  isNext?: boolean;
}

export default function PoolBall({ number, winner, isNext }: PoolBallProps) {
  const isActive = winner !== null;

  const gradId = `ball-${number}-${winner ?? "empty"}`;
  const shadowId = `ball-shadow-${number}`;

  const colors = {
    matisse: { start: "#60a5fa", mid: "#3b82f6", end: "#1d4ed8", glow: "rgba(59, 130, 246, 0.55)", accent: "#93c5fd" },
    joe:     { start: "#f87171", mid: "#ef4444", end: "#b91c1c", glow: "rgba(239, 68, 68, 0.55)", accent: "#fca5a5" },
    empty:   { start: "#151b2e", mid: "#0c1020", end: "#050810", glow: "none", accent: "#334155" },
  };

  const c = colors[winner ?? "empty"];

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className={`relative transition-all duration-500 ${isActive ? "animate-ball-pop" : ""} ${isNext && !isActive ? "animate-soft-pulse" : ""}`}
        style={{
          filter: isActive ? `drop-shadow(0 0 14px ${c.glow})` : "none",
        }}
      >
        <svg
          width="50"
          height="58"
          viewBox="0 0 72 84"
          className="sm:w-[58px] sm:h-[68px]"
        >
          <defs>
            <radialGradient id={gradId} cx="38%" cy="32%" r="65%">
              <stop offset="0%" stopColor={c.start} />
              <stop offset="55%" stopColor={c.mid} />
              <stop offset="100%" stopColor={c.end} />
            </radialGradient>
            <radialGradient id={shadowId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={isActive ? c.mid : "#0f172a"} stopOpacity={isActive ? "0.3" : "0.15"} />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Shadow underneath */}
          <ellipse cx="36" cy="74" rx="20" ry="5" fill={`url(#${shadowId})`} />

          {/* Main ball */}
          <circle cx="36" cy="34" r="31" fill={`url(#${gradId})`} />

          {/* Subtle outer ring */}
          <circle
            cx="36" cy="34" r="31"
            fill="none"
            stroke={isActive ? "rgba(255,255,255,0.1)" : "rgba(100,116,139,0.1)"}
            strokeWidth="0.8"
          />

          {/* White stripe band */}
          <ellipse
            cx="36" cy="34" rx="18" ry="12"
            fill="white"
            opacity={isActive ? 0.9 : 0.05}
          />

          {/* Number circle */}
          <circle
            cx="36" cy="34" r="10.5"
            fill="white"
            opacity={isActive ? 1 : 0.07}
          />

          {/* Number text */}
          <text
            x="36" y="34.5"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14"
            fontWeight="800"
            fill={isActive ? c.mid : "rgba(100,116,139,0.35)"}
          >
            {number}
          </text>

          {/* Primary highlight */}
          <ellipse
            cx="27" cy="22"
            rx="8" ry="4.5"
            fill="white"
            opacity={isActive ? 0.32 : 0.025}
            transform="rotate(-25 27 22)"
          />

          {/* Secondary soft sheen */}
          <ellipse
            cx="44" cy="42"
            rx="6" ry="3"
            fill="white"
            opacity={isActive ? 0.06 : 0}
            transform="rotate(20 44 42)"
          />
        </svg>
      </div>
      {/* "Next" indicator pulsing ring */}
      {isNext && !isActive && (
        <span className="text-[8px] font-black text-amber-400/60 uppercase tracking-widest">
          next
        </span>
      )}
    </div>
  );
}
