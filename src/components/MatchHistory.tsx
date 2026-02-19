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

  // ordinal suffix
  const s = ["th", "st", "nd", "rd"];
  const v = day % 100;
  const suffix = s[(v - 20) % 10] || s[v] || s[0];

  return `${month} ${day}${suffix}`;
}

export default function MatchHistory() {
  const history = useQuery(api.sessions.getMatchHistory);

  if (history === undefined) {
    return (
      <section className="rounded-2xl bg-slate-800/60 border border-slate-700 p-6 md:p-8">
        <h2 className="text-xl font-bold text-yellow-300 mb-4 tracking-wide">
          Match History
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-slate-800/60 border border-slate-700 p-6 md:p-8">
      <h2 className="text-xl font-bold text-yellow-300 mb-4 tracking-wide">
        Match History
      </h2>

      {history.length === 0 ? (
        <p className="text-slate-500 text-center py-4">
          No matches played yet.
        </p>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
          {history.map((session) => {
            const date = formatDate(session._creationTime);
            const winnerName =
              session.winner === "matisse"
                ? "Matisse"
                : session.winner === "joe"
                  ? "Joe"
                  : "Tied";

            const winnerColor =
              session.winner === "matisse"
                ? "text-blue-400"
                : session.winner === "joe"
                  ? "text-red-400"
                  : "text-yellow-400";

            const score = `${session.matisseWins}-${session.joeWins}`;

            return (
              <li
                key={session._id}
                className="flex items-center justify-between bg-slate-900/40 rounded-lg px-4 py-3 border border-slate-700/40"
              >
                <span className="text-sm text-slate-400 font-medium">
                  {date}
                </span>
                <span className="text-sm font-semibold">
                  <span className={winnerColor}>{winnerName}</span>
                  {session.winner !== "tie" ? " won " : " "}
                  <span className="text-slate-300">{score}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
