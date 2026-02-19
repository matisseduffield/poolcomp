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

  const fireEmojis = streaks.currentStreak >= 5 ? "🔥🔥🔥" : streaks.currentStreak >= 3 ? "🔥🔥" : "🔥";

  return (
    <div
      className={`rounded-2xl bg-gradient-to-r ${bgGrad} border px-4 py-3 flex items-center gap-3 animate-bounce-in`}
    >
      <span className="text-base shrink-0">{fireEmojis}</span>
      <span className="text-[13px] font-medium text-slate-400">
        <span className={`font-bold ${nameColor}`}>{name}</span> is on a{" "}
        <span className="text-gradient-gold font-black">{streaks.currentStreak}</span>{" "}
        session streak!
      </span>
    </div>
  );
}
