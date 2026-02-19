"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import PoolBall from "./PoolBall";
import { playClick, playCheer } from "../lib/sounds";

export default function ActiveSession() {
  const activeSession = useQuery(api.sessions.getActive);
  const sessionGames = useQuery(
    api.games.getBySession,
    activeSession ? { sessionId: activeSession._id } : "skip"
  );
  const createSession = useMutation(api.sessions.create);
  const recordWin = useMutation(api.games.recordWin);
  const endEarly = useMutation(api.sessions.endEarly);

  // Build ball states from games
  const balls: Array<{ winner: "matisse" | "joe" | null }> = Array.from(
    { length: 5 },
    () => ({ winner: null })
  );
  if (sessionGames) {
    for (const g of sessionGames) {
      if (g.gameNumber >= 1 && g.gameNumber <= 5) {
        balls[g.gameNumber - 1] = { winner: g.winner };
      }
    }
  }

  const totalPlayed = activeSession
    ? activeSession.matisseWins + activeSession.joeWins
    : 0;

  const handleRecordWin = async (winner: "matisse" | "joe") => {
    if (!activeSession) return;
    playClick();
    const result = await recordWin({
      sessionId: activeSession._id,
      winner,
    });
    if (result.isComplete) {
      playCheer();
    }
  };

  const handleEndEarly = async () => {
    if (!activeSession) return;
    playClick();
    await endEarly({ sessionId: activeSession._id });
  };

  const handleNewSession = async () => {
    playClick();
    await createSession();
  };

  // No active session — show start button
  if (activeSession === null) {
    return (
      <section className="rounded-2xl bg-slate-800/60 border border-slate-700 p-6 md:p-8">
        <h2 className="text-xl font-bold text-yellow-300 mb-4 tracking-wide">
          Active Session
        </h2>
        <p className="text-slate-400 mb-6">No session in progress.</p>
        <button
          onClick={handleNewSession}
          className="w-full h-16 rounded-xl bg-yellow-400 text-slate-900 text-lg font-bold
                     hover:bg-yellow-300 active:scale-95 transition-all duration-150
                     min-h-[60px] cursor-pointer"
        >
          Start New Session
        </button>
      </section>
    );
  }

  // Loading state
  if (activeSession === undefined) {
    return (
      <section className="rounded-2xl bg-slate-800/60 border border-slate-700 p-6 md:p-8">
        <h2 className="text-xl font-bold text-yellow-300 mb-4 tracking-wide">
          Active Session
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-slate-800/60 border border-slate-700 p-6 md:p-8">
      <h2 className="text-xl font-bold text-yellow-300 mb-2 tracking-wide">
        Active Session
      </h2>

      {/* Current session score */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="text-center">
          <span className="text-3xl font-black text-blue-400">
            {activeSession.matisseWins}
          </span>
          <p className="text-sm text-blue-300 font-semibold">Matisse</p>
        </div>
        <span className="text-2xl text-slate-500 font-bold">—</span>
        <div className="text-center">
          <span className="text-3xl font-black text-red-400">
            {activeSession.joeWins}
          </span>
          <p className="text-sm text-red-300 font-semibold">Joe</p>
        </div>
      </div>

      {/* Pool Balls */}
      <div className="flex items-center justify-center gap-3 md:gap-5 mb-8">
        {balls.map((ball, i) => (
          <PoolBall key={i} number={i + 1} winner={ball.winner} />
        ))}
      </div>

      {/* Win Buttons */}
      {totalPlayed < 5 &&
        activeSession.matisseWins < 3 &&
        activeSession.joeWins < 3 && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => handleRecordWin("matisse")}
              className="h-16 rounded-xl bg-blue-600 text-white text-lg font-bold
                         hover:bg-blue-500 active:scale-95 transition-all duration-150
                         min-h-[60px] cursor-pointer shadow-lg shadow-blue-600/25"
            >
              Matisse Wins
            </button>
            <button
              onClick={() => handleRecordWin("joe")}
              className="h-16 rounded-xl bg-red-600 text-white text-lg font-bold
                         hover:bg-red-500 active:scale-95 transition-all duration-150
                         min-h-[60px] cursor-pointer shadow-lg shadow-red-600/25"
            >
              Joe Wins
            </button>
          </div>
        )}

      {/* End Session Early */}
      {totalPlayed > 0 &&
        totalPlayed < 5 &&
        activeSession.matisseWins < 3 &&
        activeSession.joeWins < 3 && (
          <button
            onClick={handleEndEarly}
            className="w-full h-14 rounded-xl bg-slate-700 text-yellow-300 text-base font-semibold
                       hover:bg-slate-600 active:scale-95 transition-all duration-150
                       min-h-[60px] cursor-pointer border border-slate-600"
          >
            End Session Early
          </button>
        )}
    </section>
  );
}
