"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import PoolBall from "./PoolBall";
import ConfirmDialog from "./ConfirmDialog";
import { showToast } from "./Toast";
import { playClick, playCheer, playUndo } from "../lib/sounds";

export default function ActiveSession() {
  const activeSession = useQuery(api.sessions.getActive);
  const sessionGames = useQuery(
    api.games.getBySession,
    activeSession ? { sessionId: activeSession._id } : "skip"
  );
  const createSession = useMutation(api.sessions.create);
  const recordWin = useMutation(api.games.recordWin);
  const endEarly = useMutation(api.sessions.endEarly);
  const undoLast = useMutation(api.games.undoLast);

  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

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

  const sessionActive =
    activeSession &&
    totalPlayed < 5 &&
    activeSession.matisseWins < 3 &&
    activeSession.joeWins < 3;

  const handleRecordWin = async (winner: "matisse" | "joe") => {
    if (!activeSession || isRecording) return;
    setIsRecording(true);
    playClick();
    try {
      const result = await recordWin({
        sessionId: activeSession._id,
        winner,
      });
      if (result.isComplete) {
        playCheer();
        const winnerName = winner === "matisse" ? "Matisse" : "Joe";
        showToast(`${winnerName} wins the session! 🎉`, "success");
      }
    } finally {
      setIsRecording(false);
    }
  };

  const handleEndEarly = async () => {
    if (!activeSession) return;
    setShowEndConfirm(false);
    playClick();
    await endEarly({ sessionId: activeSession._id });

    if (activeSession.matisseWins > activeSession.joeWins) {
      showToast("Session ended — Matisse wins!", "success");
    } else if (activeSession.joeWins > activeSession.matisseWins) {
      showToast("Session ended — Joe wins!", "success");
    } else {
      showToast("Session ended — Tied! No point awarded.", "info");
    }
  };

  const handleUndo = async () => {
    if (!activeSession) return;
    playUndo();
    try {
      const result = await undoLast({ sessionId: activeSession._id });
      const name = result.undoneWinner === "matisse" ? "Matisse" : "Joe";
      showToast(`Undid game ${result.gameNumber} (${name})`, "undo");
    } catch {
      showToast("Nothing to undo", "info");
    }
  };

  const handleNewSession = async () => {
    playClick();
    await createSession();
    showToast("New session started! 🎱", "success");
  };

  // No active session — show start button
  if (activeSession === null) {
    return (
      <section className="rounded-2xl bg-slate-800/60 border border-slate-700 p-6 md:p-8">
        <h2 className="text-xl font-bold text-yellow-300 mb-4 tracking-wide">
          🎱 Active Session
        </h2>
        <p className="text-slate-400 mb-6">No session in progress.</p>
        <button
          onClick={handleNewSession}
          className="w-full h-16 rounded-xl bg-yellow-400 text-slate-900 text-lg font-bold
                     hover:bg-yellow-300 active:scale-95 transition-all duration-150
                     min-h-[60px] cursor-pointer shadow-lg shadow-yellow-400/20"
        >
          🎱 Start New Session
        </button>
      </section>
    );
  }

  // Loading state
  if (activeSession === undefined) {
    return (
      <section className="rounded-2xl bg-slate-800/60 border border-slate-700 p-6 md:p-8">
        <h2 className="text-xl font-bold text-yellow-300 mb-4 tracking-wide">
          🎱 Active Session
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-slate-800/60 border border-slate-700 p-6 md:p-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-yellow-300 tracking-wide">
          🎱 Active Session
        </h2>
        {totalPlayed > 0 && sessionActive && (
          <span className="text-xs text-slate-500 font-medium">
            Game {totalPlayed + 1} of 5
          </span>
        )}
      </div>

      {/* Current session score */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="text-center min-w-[80px]">
          <p className="text-xs text-blue-300/70 font-semibold mb-1 uppercase tracking-wider">
            Matisse
          </p>
          <span className="text-4xl font-black text-blue-400 tabular-nums">
            {activeSession.matisseWins}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl text-slate-600 font-bold">vs</span>
        </div>
        <div className="text-center min-w-[80px]">
          <p className="text-xs text-red-300/70 font-semibold mb-1 uppercase tracking-wider">
            Joe
          </p>
          <span className="text-4xl font-black text-red-400 tabular-nums">
            {activeSession.joeWins}
          </span>
        </div>
      </div>

      {/* Pool Balls */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
        {balls.map((ball, i) => (
          <PoolBall key={i} number={i + 1} winner={ball.winner} />
        ))}
      </div>

      {/* Win Buttons */}
      {sessionActive && (
        <div className="grid grid-cols-2 gap-4 mb-3">
          <button
            onClick={() => handleRecordWin("matisse")}
            disabled={isRecording}
            className="h-16 rounded-xl bg-blue-600 text-white text-lg font-bold
                       hover:bg-blue-500 active:scale-95 transition-all duration-150
                       min-h-[60px] cursor-pointer shadow-lg shadow-blue-600/25
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Matisse Wins
          </button>
          <button
            onClick={() => handleRecordWin("joe")}
            disabled={isRecording}
            className="h-16 rounded-xl bg-red-600 text-white text-lg font-bold
                       hover:bg-red-500 active:scale-95 transition-all duration-150
                       min-h-[60px] cursor-pointer shadow-lg shadow-red-600/25
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Joe Wins
          </button>
        </div>
      )}

      {/* Undo + End Session row */}
      {totalPlayed > 0 && sessionActive && (
        <div className="grid grid-cols-[1fr_2fr] gap-3">
          <button
            onClick={handleUndo}
            className="h-14 rounded-xl bg-slate-700/80 text-slate-400 text-sm font-semibold
                       hover:bg-slate-600 hover:text-slate-300 active:scale-95 transition-all duration-150
                       min-h-[56px] cursor-pointer border border-slate-600/60 flex items-center justify-center gap-1.5"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="shrink-0"
            >
              <path
                d="M3 8h10M3 8l3-3M3 8l3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Undo
          </button>
          <button
            onClick={() => setShowEndConfirm(true)}
            className="h-14 rounded-xl bg-slate-700/80 text-yellow-300 text-sm font-semibold
                       hover:bg-slate-600 active:scale-95 transition-all duration-150
                       min-h-[56px] cursor-pointer border border-slate-600/60"
          >
            End Session Early
          </button>
        </div>
      )}

      {/* Session just completed — start new one */}
      {!sessionActive && activeSession.status === "active" && totalPlayed >= 5 && (
        <button
          onClick={handleNewSession}
          className="w-full h-16 rounded-xl bg-yellow-400 text-slate-900 text-lg font-bold
                     hover:bg-yellow-300 active:scale-95 transition-all duration-150
                     min-h-[60px] cursor-pointer mt-4 shadow-lg shadow-yellow-400/20"
        >
          Start Next Session
        </button>
      )}

      {/* Confirm End Session Dialog */}
      <ConfirmDialog
        open={showEndConfirm}
        title="End Session Early?"
        message={
          activeSession.matisseWins === activeSession.joeWins
            ? `It's tied ${activeSession.matisseWins}-${activeSession.joeWins}. No session point will be awarded.`
            : `${activeSession.matisseWins > activeSession.joeWins ? "Matisse" : "Joe"} leads ${activeSession.matisseWins}-${activeSession.joeWins} and will receive the session point.`
        }
        confirmLabel="End Session"
        cancelLabel="Keep Playing"
        confirmColor="bg-yellow-600 hover:bg-yellow-500"
        onConfirm={handleEndEarly}
        onCancel={() => setShowEndConfirm(false)}
      />
    </section>
  );
}
