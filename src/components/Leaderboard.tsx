"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function Leaderboard() {
  const scores = useQuery(api.sessions.getScores);
  const lifetime = useQuery(api.sessions.getLifetimeGames);
  const streaks = useQuery(api.sessions.getStreaks);

  if (scores === undefined || lifetime === undefined) {
    return (
      <section className="rounded-2xl bg-slate-800/60 border border-slate-700 p-6 md:p-8">
        <h2 className="text-xl font-bold text-yellow-300 mb-4 tracking-wide">
          🏆 Leaderboard
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  const totalSessions = scores.matisseSessions + scores.joeSessions;
  const matisseWinPct =
    totalSessions > 0
      ? Math.round((scores.matisseSessions / totalSessions) * 100)
      : 50;

  return (
    <section className="rounded-2xl bg-slate-800/60 border border-slate-700 p-6 md:p-8">
      <h2 className="text-xl font-bold text-yellow-300 mb-6 tracking-wide">
        🏆 Leaderboard
      </h2>

      {/* Session Score — big & bold */}
      <div className="flex items-end justify-center gap-8 mb-4">
        <div className="text-center">
          <p className="text-xs text-blue-300/70 font-semibold mb-1 uppercase tracking-wider">
            Matisse
          </p>
          <span className="text-6xl font-black text-blue-400 leading-none tabular-nums">
            {scores.matisseSessions}
          </span>
        </div>
        <span className="text-3xl text-slate-600 font-bold pb-2">–</span>
        <div className="text-center">
          <p className="text-xs text-red-300/70 font-semibold mb-1 uppercase tracking-wider">
            Joe
          </p>
          <span className="text-6xl font-black text-red-400 leading-none tabular-nums">
            {scores.joeSessions}
          </span>
        </div>
      </div>

      {/* Win percentage bar */}
      {totalSessions > 0 && (
        <div className="mb-6">
          <div className="h-2 rounded-full bg-slate-700 overflow-hidden flex">
            <div
              className="h-full bg-blue-500 transition-all duration-700 ease-out"
              style={{ width: `${matisseWinPct}%` }}
            />
            <div
              className="h-full bg-red-500 transition-all duration-700 ease-out"
              style={{ width: `${100 - matisseWinPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-blue-400/60 font-medium">
              {matisseWinPct}%
            </span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
              Session Wins
            </span>
            <span className="text-[10px] text-red-400/60 font-medium">
              {100 - matisseWinPct}%
            </span>
          </div>
        </div>
      )}

      {totalSessions === 0 && (
        <p className="text-center text-xs uppercase tracking-widest text-slate-500 mb-4">
          Session Wins
        </p>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Lifetime Games */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">
            Total Games Won
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-blue-300 tabular-nums">
              {lifetime.matisseGames}
            </span>
            <span className="text-slate-600 text-xs">vs</span>
            <span className="text-lg font-bold text-red-300 tabular-nums">
              {lifetime.joeGames}
            </span>
          </div>
        </div>

        {/* Best Streaks */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">
            Best Streak
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-blue-300 tabular-nums">
              {streaks?.bestMatisse ?? 0}
            </span>
            <span className="text-slate-600 text-xs">vs</span>
            <span className="text-lg font-bold text-red-300 tabular-nums">
              {streaks?.bestJoe ?? 0}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
