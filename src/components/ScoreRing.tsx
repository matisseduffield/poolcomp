"use client";

interface ScoreRingProps {
  score: number;
  maxScore: number;
  color: "blue" | "red";
  label: string;
  size?: number;
}

export default function ScoreRing({ score, maxScore, color, label, size = 100 }: ScoreRingProps) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = maxScore > 0 ? score / Math.max(maxScore, 3) : 0;
  const dashOffset = circumference * (1 - Math.min(progress, 1));

  const colors = {
    blue: {
      stroke: "url(#ring-grad-blue)",
      bg: "rgba(59, 130, 246, 0.08)",
      text: "#93c5fd",
      glow: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))",
    },
    red: {
      stroke: "url(#ring-grad-red)",
      bg: "rgba(239, 68, 68, 0.08)",
      text: "#fca5a5",
      glow: "drop-shadow(0 0 8px rgba(239, 68, 68, 0.4))",
    },
  };

  const c = colors[color];
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90" style={{ filter: score > 0 ? c.glow : "none" }}>
          <defs>
            <linearGradient id="ring-grad-blue" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="ring-grad-red" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={c.bg}
            strokeWidth="5"
          />
          {/* Progress ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={c.stroke}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-3xl font-black tabular-nums leading-none"
            style={{ color: c.text }}
          >
            {score}
          </span>
        </div>
      </div>
      <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
        {label}
      </span>
    </div>
  );
}
