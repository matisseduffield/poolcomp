"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function StreakBanner() {
  const streaks = useQuery(api.sessions.getStreaks);

  if (!streaks || streaks.currentStreak < 2) return null;

  const name = streaks.streakHolder === "matisse" ? "Matisse" : "Joe";
  const isMatisse = streaks.streakHolder === "matisse";

  const bgGrad = isMatisse
    ? "from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/15"
    : "from-red-500/10 via-red-500/5 to-transparent border-red-500/15";

  const nameColor = isMatisse ? "text-gradient-blue" : "text-gradient-red";
  const dotColor = isMatisse ? "bg-blue-400" : "bg-red-400";

  const fireEmojis = streaks.currentStreak >= 5 ? "🔥🔥🔥" : streaks.currentStreak >= 3 ? "🔥🔥" : "🔥";

  return (
    <div
      className={`glass-subtle rounded-2xl bg-gradient-to-r ${bgGrad} border px-4 py-3 flex items-center gap-3 animate-bounce-in`}
    >
      <div className="relative">
        <span className="text-base shrink-0">{fireEmojis}</span>
        <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${dotColor} animate-soft-pulse`} />
      </div>
      <span className="text-[13px] font-medium text-slate-400">
        <span className={`font-bold ${nameColor}`}>{name}</span> is on a{" "}
        <span className="text-gradient-gold font-black">{streaks.currentStreak}</span>{" "}
        session streak!
      </span>
    </div>
  );
}
