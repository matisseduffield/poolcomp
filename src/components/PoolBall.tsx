"use client";

interface PoolBallProps {
  number: number;
  winner: "matisse" | "joe" | null;
}

export default function PoolBall({ number, winner }: PoolBallProps) {
  const fill =
    winner === "matisse"
      ? "#3b82f6" // blue
      : winner === "joe"
        ? "#ef4444" // red
        : "#374151"; // greyed out

  const border =
    winner === "matisse"
      ? "#60a5fa"
      : winner === "joe"
        ? "#f87171"
        : "#4b5563";

  const textColor = winner ? "#ffffff" : "#6b7280";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width="72"
        height="72"
        viewBox="0 0 72 72"
        className="drop-shadow-lg transition-all duration-300"
        style={{
          filter: winner
            ? `drop-shadow(0 0 12px ${fill}88)`
            : "none",
          transform: winner ? "scale(1.08)" : "scale(1)",
        }}
      >
        {/* Outer circle */}
        <circle cx="36" cy="36" r="34" fill={fill} stroke={border} strokeWidth="2" />
        {/* White stripe band */}
        <ellipse cx="36" cy="36" rx="20" ry="14" fill="white" opacity={winner ? 0.95 : 0.2} />
        {/* Number circle */}
        <circle cx="36" cy="36" r="12" fill="white" opacity={winner ? 1 : 0.25} />
        {/* Number text */}
        <text
          x="36"
          y="36"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="16"
          fontWeight="bold"
          fill={winner ? fill : textColor}
        >
          {number}
        </text>
        {/* Highlight gloss */}
        <ellipse
          cx="28"
          cy="24"
          rx="8"
          ry="5"
          fill="white"
          opacity={winner ? 0.35 : 0.08}
          transform="rotate(-20 28 24)"
        />
      </svg>
      {winner && (
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: fill }}
        >
          {winner === "matisse" ? "Matisse" : "Joe"}
        </span>
      )}
    </div>
  );
}
