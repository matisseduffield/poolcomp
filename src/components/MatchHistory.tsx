"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const s = ["th", "st", "nd", "rd"];
  const v = day % 100;
  const suffix = s[(v - 20) % 10] || s[v] || s[0];
  return `${month} ${day}${suffix}`;
}

function timeAgo(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(timestamp);
}

export default function MatchHistory() {
  const history = useQuery(api.sessions.getMatchHistory);

  if (history === undefined) {
    return (
      <section className="glass rounded-3xl p-6 animate-fade-in">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-slate-500">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          History
        </h2>
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-[3px] border-amber-400/70 border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="glass rounded-3xl p-5 animate-slide-up-d2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-slate-500">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          History
        </h2>
        {history.length > 0 && (
          <span className="text-[10px] font-bold text-slate-500 bg-slate-800/60 px-2.5 py-0.5 rounded-full border border-slate-700/30">
            {history.length} played
          </span>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-800/40 mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-slate-600">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-slate-600 text-sm">No matches played yet</p>
        </div>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
          {history.map((session, idx) => {
            const date = timeAgo(session._creationTime);
            const isMatisse = session.winner === "matisse";
            const isJoe = session.winner === "joe";

            const accentColor = isMatisse
              ? "border-l-blue-500"
              : isJoe
                ? "border-l-red-500"
                : "border-l-slate-600";

            const winnerLabel = isMatisse ? "Matisse" : isJoe ? "Joe" : "Draw";
            const scoreColor = isMatisse
              ? "text-blue-400"
              : isJoe
                ? "text-red-400"
                : "text-slate-400";

            return (
              <li
                key={session._id}
                className={`stat-card rounded-xl border-l-[3px] ${accentColor} px-3.5 py-3 flex items-center justify-between`}
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="flex items-center gap-3">
                  {/* Score */}
                  <span className={`text-lg font-black tabular-nums ${scoreColor}`}>
                    {session.matisseWins}–{session.joeWins}
                  </span>
                  {/* Winner */}
                  <span className="text-xs font-semibold text-slate-400">
                    {winnerLabel}
                  </span>
                </div>
                <span className="text-[11px] text-slate-600 font-medium tabular-nums">
                  {date}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
