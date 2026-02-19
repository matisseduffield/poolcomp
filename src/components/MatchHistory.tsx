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
      <section className="glass-card rounded-2xl p-5 animate-fade-in">
        <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
          <span className="text-lg">📋</span> Match History
        </h2>
        <div className="flex items-center justify-center py-10">
          <div className="w-7 h-7 border-[3px] border-amber-400/80 border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="glass-card rounded-2xl p-5 animate-slide-up">
      <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-lg">📋</span> Match History
        {history.length > 0 && (
          <span className="text-[10px] font-semibold text-slate-600 bg-slate-800/60 px-2 py-0.5 rounded-full ml-auto">
            {history.length}
          </span>
        )}
      </h2>

      {history.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-600 text-sm">No matches played yet</p>
        </div>
      ) : (
        <ul className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          {history.map((session) => {
            const date = timeAgo(session._creationTime);
            const winnerName =
              session.winner === "matisse"
                ? "Matisse"
                : session.winner === "joe"
                  ? "Joe"
                  : "Tied";

            const badgeColor =
              session.winner === "matisse"
                ? "bg-blue-500/15 text-blue-400 border-blue-500/20"
                : session.winner === "joe"
                  ? "bg-red-500/15 text-red-400 border-red-500/20"
                  : "bg-slate-500/15 text-slate-400 border-slate-500/20";

            return (
              <li
                key={session._id}
                className="flex items-center justify-between stat-card rounded-xl px-3.5 py-3"
              >
                <div className="flex items-center gap-3">
                  {/* Winner badge */}
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeColor}`}>
                    {winnerName}
                  </span>
                  <span className="text-sm font-semibold text-slate-300 tabular-nums">
                    {session.matisseWins}–{session.joeWins}
                  </span>
                </div>
                <span className="text-[11px] text-slate-600 font-medium">
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
