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
        : "#1e293b"; // dark greyed out

  const border =
    winner === "matisse"
      ? "#60a5fa"
      : winner === "joe"
        ? "#f87171"
        : "#334155";

  const textColor = winner ? "#ffffff" : "#475569";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width="56"
        height="56"
        viewBox="0 0 72 72"
        className={`drop-shadow-lg transition-all duration-500 ${winner ? "animate-ball-pop" : ""}`}
        style={{
          filter: winner
            ? `drop-shadow(0 0 14px ${fill}66)`
            : "none",
        }}
      >
        {/* Outer circle */}
        <circle cx="36" cy="36" r="34" fill={fill} stroke={border} strokeWidth="2" />
        {/* White stripe band */}
        <ellipse cx="36" cy="36" rx="20" ry="14" fill="white" opacity={winner ? 0.95 : 0.12} />
        {/* Number circle */}
        <circle cx="36" cy="36" r="12" fill="white" opacity={winner ? 1 : 0.15} />
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
          opacity={winner ? 0.35 : 0.05}
          transform="rotate(-20 28 24)"
        />
      </svg>
      {winner && (
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: fill }}
        >
          {winner === "matisse" ? "Matisse" : "Joe"}
        </span>
      )}
    </div>
  );
}
