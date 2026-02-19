"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function Leaderboard() {
  const scores = useQuery(api.sessions.getScores);
  const lifetime = useQuery(api.sessions.getLifetimeGames);
  const streaks = useQuery(api.sessions.getStreaks);

  if (scores === undefined || lifetime === undefined) {
    return (
      <section className="glass rounded-3xl p-6 animate-fade-in">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-amber-400">
            <path d="M12 2L15 8.5L22 9.5L17 14.5L18 21.5L12 18L6 21.5L7 14.5L2 9.5L9 8.5L12 2Z" fill="currentColor" />
          </svg>
          Standings
        </h2>
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-[3px] border-amber-400/70 border-t-transparent rounded-full animate-spin" />
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
  const tied = scores.matisseSessions === scores.joeSessions;

  const totalGames = lifetime.matisseGames + lifetime.joeGames;
  const matisseGamePct = totalGames > 0 ? Math.round((lifetime.matisseGames / totalGames) * 100) : 50;

  return (
    <section className="glass rounded-3xl p-5 animate-slide-up-d1">
      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-amber-400">
          <path d="M12 2L15 8.5L22 9.5L17 14.5L18 21.5L12 18L6 21.5L7 14.5L2 9.5L9 8.5L12 2Z" fill="currentColor" />
        </svg>
        Standings
      </h2>

      {/* Main Score Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Matisse */}
        <div className={`relative stat-card rounded-2xl p-4 text-center overflow-hidden ${matisseLeads ? "ring-1 ring-blue-500/20" : ""}`}>
          {matisseLeads && (
            <div className="absolute top-2 right-2 animate-crown">
              <span className="text-sm">👑</span>
            </div>
          )}
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400/60 mb-2">Matisse</p>
          <span className="text-4xl font-black text-gradient-blue score-display block">
            {scores.matisseSessions}
          </span>
          <p className="text-[10px] text-slate-600 font-semibold mt-1">
            {totalSessions > 0
              ? `${matisseWinPct}% win rate`
              : "sessions"}
          </p>
          {matisseLeads && (
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/[0.03] to-transparent pointer-events-none" />
          )}
        </div>

        {/* Joe */}
        <div className={`relative stat-card rounded-2xl p-4 text-center overflow-hidden ${joeLeads ? "ring-1 ring-red-500/20" : ""}`}>
          {joeLeads && (
            <div className="absolute top-2 right-2 animate-crown">
              <span className="text-sm">👑</span>
            </div>
          )}
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400/60 mb-2">Joe</p>
          <span className="text-4xl font-black text-gradient-red score-display block">
            {scores.joeSessions}
          </span>
          <p className="text-[10px] text-slate-600 font-semibold mt-1">
            {totalSessions > 0
              ? `${100 - matisseWinPct}% win rate`
              : "sessions"}
          </p>
          {joeLeads && (
            <div className="absolute inset-0 bg-gradient-to-t from-red-500/[0.03] to-transparent pointer-events-none" />
          )}
        </div>
      </div>

      {/* Differential badge */}
      {!tied && totalSessions > 0 && (
        <div className="flex justify-center -mt-1 mb-3">
          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
            matisseLeads
              ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
              : "text-red-400 bg-red-500/10 border-red-500/20"
          }`}>
            {matisseLeads ? "Matisse" : "Joe"} leads by {Math.abs(scores.matisseSessions - scores.joeSessions)}
          </span>
        </div>
      )}

      {/* Session Win Bar */}
      {totalSessions > 0 && (
        <div className="mb-5 px-1">
          <div className="h-2 rounded-full bg-slate-800/80 overflow-hidden flex gap-[2px]">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${matisseWinPct}%`,
                background: "linear-gradient(90deg, #1d4ed8, #60a5fa)",
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
          <div className="flex justify-between mt-1.5 px-0.5">
            <span className="text-[10px] text-blue-400/50 font-bold tabular-nums">{matisseWinPct}%</span>
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.25em]">
              {tied ? "Tied" : "Sessions"}
            </span>
            <span className="text-[10px] text-red-400/50 font-bold tabular-nums">{100 - matisseWinPct}%</span>
          </div>
        </div>
      )}

      {totalSessions === 0 && (
        <div className="section-divider my-4" />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {/* Games Won */}
        <div className="stat-card rounded-xl p-3 text-center">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.15em] mb-1.5">Games Won</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-base font-black text-gradient-blue tabular-nums">{lifetime.matisseGames}</span>
            <span className="text-slate-700 text-[9px] font-bold">-</span>
            <span className="text-base font-black text-gradient-red tabular-nums">{lifetime.joeGames}</span>
          </div>
        </div>

        {/* Game Win Rate */}
        <div className="stat-card rounded-xl p-3 text-center">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.15em] mb-1.5">Game Win %</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-base font-black text-gradient-blue tabular-nums">{matisseGamePct}</span>
            <span className="text-slate-700 text-[9px] font-bold">-</span>
            <span className="text-base font-black text-gradient-red tabular-nums">{100 - matisseGamePct}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Best Streak */}
        <div className="stat-card rounded-xl p-3 text-center">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.15em] mb-1.5">Best Streak</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-base font-black text-gradient-blue tabular-nums">{streaks?.bestMatisse ?? 0}</span>
            <span className="text-slate-700 text-[9px] font-bold">-</span>
            <span className="text-base font-black text-gradient-red tabular-nums">{streaks?.bestJoe ?? 0}</span>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="stat-card rounded-xl p-3 text-center">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.15em] mb-1.5">Sessions</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-base font-black text-gradient-gold tabular-nums">{totalSessions}</span>
            <span className="text-slate-700 text-[9px] font-bold">played</span>
          </div>
        </div>
      </div>
    </section>
  );
}
