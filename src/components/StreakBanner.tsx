"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function StreakBanner() {
  const streaks = useQuery(api.sessions.getStreaks);

  if (!streaks || streaks.currentStreak < 2) return null;

  const name = streaks.streakHolder === "matisse" ? "Matisse" : "Joe";
  const color =
    streaks.streakHolder === "matisse" ? "text-blue-400" : "text-red-400";
  const bgColor =
    streaks.streakHolder === "matisse"
      ? "from-blue-900/30 to-blue-900/10 border-blue-700/40"
      : "from-red-900/30 to-red-900/10 border-red-700/40";

  const fireEmojis = streaks.currentStreak >= 5 ? "🔥🔥🔥" : streaks.currentStreak >= 3 ? "🔥🔥" : "🔥";

  return (
    <div
      className={`rounded-xl bg-gradient-to-r ${bgColor} border px-4 py-3 flex items-center justify-between`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{fireEmojis}</span>
        <span className="text-sm font-semibold text-slate-300">
          <span className={`font-bold ${color}`}>{name}</span> is on a{" "}
          <span className="text-yellow-300 font-black">
            {streaks.currentStreak}
          </span>{" "}
          session win streak!
        </span>
      </div>
    </div>
  );
}
