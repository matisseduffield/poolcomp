"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function Leaderboard() {
  const scores = useQuery(api.sessions.getScores);
  const lifetime = useQuery(api.sessions.getLifetimeGames);

  if (scores === undefined || lifetime === undefined) {
    return (
      <section className="rounded-2xl bg-slate-800/60 border border-slate-700 p-6 md:p-8">
        <h2 className="text-xl font-bold text-yellow-300 mb-4 tracking-wide">
          Leaderboard
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-slate-800/60 border border-slate-700 p-6 md:p-8">
      <h2 className="text-xl font-bold text-yellow-300 mb-6 tracking-wide">
        Leaderboard
      </h2>

      {/* Session Score — big & bold */}
      <div className="flex items-end justify-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-blue-300 font-semibold mb-1">Matisse</p>
          <span className="text-6xl font-black text-blue-400 leading-none">
            {scores.matisseSessions}
          </span>
        </div>
        <span className="text-3xl text-slate-500 font-bold pb-2">–</span>
        <div className="text-center">
          <p className="text-sm text-red-300 font-semibold mb-1">Joe</p>
          <span className="text-6xl font-black text-red-400 leading-none">
            {scores.joeSessions}
          </span>
        </div>
      </div>

      <p className="text-center text-xs uppercase tracking-widest text-slate-500 mb-4">
        Session Wins
      </p>

      {/* Lifetime Games — sub-stat */}
      <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
        <p className="text-center text-sm text-slate-400 mb-2 font-medium">
          Total Games Won
        </p>
        <div className="flex items-center justify-center gap-6">
          <span className="text-lg font-bold text-blue-300">
            Matisse {lifetime.matisseGames}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-lg font-bold text-red-300">
            Joe {lifetime.joeGames}
          </span>
        </div>
      </div>
    </section>
  );
}
