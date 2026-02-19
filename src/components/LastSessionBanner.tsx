"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function LastSessionBanner() {
  const history = useQuery(api.sessions.getMatchHistory);
  const activeSession = useQuery(api.sessions.getActive);

  // Only show when there's no active session and there's history
  if (!history || history.length === 0 || activeSession !== null) return null;

  const last = history[0];
  const isMatisse = last.winner === "matisse";
  const isJoe = last.winner === "joe";
  const winnerName = isMatisse ? "Matisse" : isJoe ? "Joe" : "Nobody";

  const borderColor = isMatisse
    ? "border-blue-500/20"
    : isJoe
      ? "border-red-500/20"
      : "border-slate-600/20";

  const iconBg = isMatisse
    ? "bg-blue-500/10"
    : isJoe
      ? "bg-red-500/10"
      : "bg-slate-500/10";

  const nameClass = isMatisse
    ? "text-gradient-blue"
    : isJoe
      ? "text-gradient-red"
      : "text-slate-400";

  const trophy = isMatisse || isJoe ? "🏆" : "🤝";

  return (
    <div
      className={`glass-subtle rounded-2xl border ${borderColor} px-4 py-3 flex items-center gap-3 animate-slide-up`}
    >
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <span className="text-lg">{trophy}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Last Session</p>
        <p className="text-sm text-slate-300 font-medium truncate">
          <span className={`font-bold ${nameClass}`}>{winnerName}</span>{" "}
          won {last.matisseWins}–{last.joeWins}
        </p>
      </div>
    </div>
  );
}
