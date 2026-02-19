"use client";

interface PoolBallProps {
  number: number;
  winner: "matisse" | "joe" | null;
}

export default function PoolBall({ number, winner }: PoolBallProps) {
  const isActive = winner !== null;

  // Gradient stops for each state
  const gradId = `ball-${number}-${winner ?? "empty"}`;

  const colors = {
    matisse: { start: "#60a5fa", mid: "#3b82f6", end: "#1d4ed8", glow: "rgba(59, 130, 246, 0.5)" },
    joe:     { start: "#f87171", mid: "#ef4444", end: "#b91c1c", glow: "rgba(239, 68, 68, 0.5)" },
    empty:   { start: "#1e293b", mid: "#0f172a", end: "#0a0e1a", glow: "none" },
  };

  const c = colors[winner ?? "empty"];

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`relative transition-all duration-500 ${isActive ? "animate-ball-pop" : ""}`}
        style={{
          filter: isActive ? `drop-shadow(0 0 12px ${c.glow})` : "none",
        }}
      >
        <svg
          width="52"
          height="52"
          viewBox="0 0 72 72"
          className="sm:w-[60px] sm:h-[60px]"
        >
          <defs>
            <radialGradient id={gradId} cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor={c.start} />
              <stop offset="60%" stopColor={c.mid} />
              <stop offset="100%" stopColor={c.end} />
            </radialGradient>
          </defs>

          {/* Main ball */}
          <circle cx="36" cy="36" r="33" fill={`url(#${gradId})`} />

          {/* Subtle edge ring */}
          <circle
            cx="36" cy="36" r="33"
            fill="none"
            stroke={isActive ? "rgba(255,255,255,0.12)" : "rgba(100,116,139,0.15)"}
            strokeWidth="1"
          />

          {/* White stripe band */}
          <ellipse
            cx="36" cy="36" rx="19" ry="13"
            fill="white"
            opacity={isActive ? 0.92 : 0.06}
          />

          {/* Number circle */}
          <circle
            cx="36" cy="36" r="11"
            fill="white"
            opacity={isActive ? 1 : 0.08}
          />

          {/* Number text */}
          <text
            x="36" y="36.5"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="15"
            fontWeight="800"
            fill={isActive ? c.mid : "rgba(100,116,139,0.4)"}
          >
            {number}
          </text>

          {/* Highlight gloss */}
          <ellipse
            cx="27" cy="23"
            rx="9" ry="5"
            fill="white"
            opacity={isActive ? 0.3 : 0.03}
            transform="rotate(-25 27 23)"
          />
        </svg>
      </div>
      {winner && (
        <span
          className="text-[9px] font-bold uppercase tracking-[0.12em] mt-0.5"
          style={{ color: c.start }}
        >
          {winner === "matisse" ? "Matisse" : "Joe"}
        </span>
      )}
    </div>
  );
}
