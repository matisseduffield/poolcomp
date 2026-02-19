"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function Leaderboard() {
  const scores = useQuery(api.sessions.getScores);
  const lifetime = useQuery(api.sessions.getLifetimeGames);
  const streaks = useQuery(api.sessions.getStreaks);

  if (scores === undefined || lifetime === undefined) {
    return (
      <section className="glass-card rounded-2xl p-5 animate-fade-in">
        <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
          <span className="text-lg">🏆</span> Leaderboard
        </h2>
        <div className="flex items-center justify-center py-10">
          <div className="w-7 h-7 border-[3px] border-amber-400/80 border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  const totalSessions = scores.matisseSessions + scores.joeSessions;
  const matisseWinPct =
    totalSessions > 0
      ? Math.round((scores.matisseSessions / totalSessions) * 100)
      : 50;

  const matisseLeads = scores.matisseSessions > scores.joeSessions;
  const joeLeads = scores.joeSessions > scores.matisseSessions;

  return (
    <section className="glass-card rounded-2xl p-5 animate-slide-up">
      <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
        <span className="text-lg">🏆</span> Leaderboard
      </h2>

      {/* Session Score — big & bold */}
      <div className="flex items-center justify-center mb-4">
        {/* Matisse side */}
        <div className="flex-1 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-400/60 mb-1">
            Matisse
          </p>
          <div className="relative inline-block">
            <span className="text-5xl sm:text-6xl font-black text-gradient-blue leading-none tabular-nums">
              {scores.matisseSessions}
            </span>
            {matisseLeads && (
              <span className="absolute -top-3 -right-4 text-[10px]">👑</span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="flex flex-col items-center px-4">
          <div className="w-[1px] h-5 bg-slate-700/50" />
          <span className="text-[10px] font-bold text-slate-600 uppercase my-1">vs</span>
          <div className="w-[1px] h-5 bg-slate-700/50" />
        </div>

        {/* Joe side */}
        <div className="flex-1 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-red-400/60 mb-1">
            Joe
          </p>
          <div className="relative inline-block">
            <span className="text-5xl sm:text-6xl font-black text-gradient-red leading-none tabular-nums">
              {scores.joeSessions}
            </span>
            {joeLeads && (
              <span className="absolute -top-3 -right-4 text-[10px]">👑</span>
            )}
          </div>
        </div>
      </div>

      {/* Win percentage bar */}
      {totalSessions > 0 && (
        <div className="mb-5">
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${matisseWinPct}%`,
                background: "linear-gradient(90deg, #60a5fa, #3b82f6)",
              }}
            />
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${100 - matisseWinPct}%`,
                background: "linear-gradient(90deg, #ef4444, #f87171)",
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-blue-400/50 font-semibold tabular-nums">
              {matisseWinPct}%
            </span>
            <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-[0.2em]">
              Sessions
            </span>
            <span className="text-[10px] text-red-400/50 font-semibold tabular-nums">
              {100 - matisseWinPct}%
            </span>
          </div>
        </div>
      )}

      {totalSessions === 0 && (
        <p className="text-center text-[10px] uppercase tracking-[0.2em] text-slate-600 mb-5 font-semibold">
          Session Wins
        </p>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Lifetime Games */}
        <div className="stat-card rounded-xl p-3.5">
          <p className="text-[10px] text-slate-500 mb-2 font-semibold uppercase tracking-[0.15em]">
            Games Won
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-gradient-blue tabular-nums">
              {lifetime.matisseGames}
            </span>
            <span className="text-slate-700 text-[10px] font-bold">vs</span>
            <span className="text-lg font-black text-gradient-red tabular-nums">
              {lifetime.joeGames}
            </span>
          </div>
        </div>

        {/* Best Streaks */}
        <div className="stat-card rounded-xl p-3.5">
          <p className="text-[10px] text-slate-500 mb-2 font-semibold uppercase tracking-[0.15em]">
            Best Streak
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-gradient-blue tabular-nums">
              {streaks?.bestMatisse ?? 0}
            </span>
            <span className="text-slate-700 text-[10px] font-bold">vs</span>
            <span className="text-lg font-black text-gradient-red tabular-nums">
              {streaks?.bestJoe ?? 0}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
