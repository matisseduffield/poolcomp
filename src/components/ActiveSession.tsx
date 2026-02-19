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

  // Loading state
  if (activeSession === undefined) {
    return (
      <section className="glass-card rounded-2xl p-5 animate-fade-in">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-2 h-2 rounded-full bg-slate-600" />
          <h2 className="text-base font-bold text-white">Active Session</h2>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="w-7 h-7 border-[3px] border-amber-400/80 border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  // No active session — show start button
  if (activeSession === null) {
    return (
      <section className="glass-card rounded-2xl p-5 animate-slide-up">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-2 h-2 rounded-full bg-slate-600" />
          <h2 className="text-base font-bold text-white">Active Session</h2>
        </div>
        <p className="text-slate-400 text-sm mb-5 text-center">No session in progress</p>
        <button
          onClick={handleNewSession}
          className="w-full h-14 rounded-2xl btn-accent text-base font-bold
                     active:scale-[0.97] transition-all duration-150
                     cursor-pointer animate-glow-pulse"
        >
          Start New Session
        </button>
      </section>
    );
  }

  return (
    <section className="glass-card-elevated rounded-2xl p-5 animate-slide-up">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-live-dot" />
          <h2 className="text-base font-bold text-white">Live Session</h2>
        </div>
        {totalPlayed > 0 && sessionActive && (
          <span className="text-[11px] text-slate-500 font-semibold bg-slate-800/60 px-2.5 py-1 rounded-full">
            GAME {totalPlayed + 1} OF 5
          </span>
        )}
      </div>

      {/* Score Display */}
      <div className="flex items-center justify-center gap-4 mb-5">
        <div className="flex-1 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-400/70 mb-1">
            Matisse
          </p>
          <span className="text-5xl font-black text-gradient-blue tabular-nums leading-none">
            {activeSession.matisseWins}
          </span>
        </div>
        <div className="flex flex-col items-center px-3">
          <div className="w-px h-6 bg-slate-700/60 mb-1.5" />
          <span className="text-[10px] font-bold text-slate-600 uppercase">vs</span>
          <div className="w-px h-6 bg-slate-700/60 mt-1.5" />
        </div>
        <div className="flex-1 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-red-400/70 mb-1">
            Joe
          </p>
          <span className="text-5xl font-black text-gradient-red tabular-nums leading-none">
            {activeSession.joeWins}
          </span>
        </div>
      </div>

      {/* Pool Balls */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-6 px-1">
        {balls.map((ball, i) => (
          <PoolBall key={i} number={i + 1} winner={ball.winner} />
        ))}
      </div>

      {/* Win Buttons */}
      {sessionActive && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={() => handleRecordWin("matisse")}
            disabled={isRecording}
            className="h-[56px] rounded-2xl btn-matisse text-white text-[15px] font-bold
                       active:scale-[0.96] transition-all duration-150
                       cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Matisse Wins
          </button>
          <button
            onClick={() => handleRecordWin("joe")}
            disabled={isRecording}
            className="h-[56px] rounded-2xl btn-joe text-white text-[15px] font-bold
                       active:scale-[0.96] transition-all duration-150
                       cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Joe Wins
          </button>
        </div>
      )}

      {/* Undo + End Session row */}
      {totalPlayed > 0 && sessionActive && (
        <div className="grid grid-cols-[auto_1fr] gap-2.5">
          <button
            onClick={handleUndo}
            className="h-11 px-4 rounded-xl btn-ghost text-slate-400 text-sm font-medium
                       active:scale-[0.96] transition-all duration-150
                       cursor-pointer flex items-center justify-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
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
            className="h-11 rounded-xl btn-ghost text-amber-400/80 text-sm font-medium
                       active:scale-[0.96] transition-all duration-150
                       cursor-pointer"
          >
            End Session Early
          </button>
        </div>
      )}

      {/* Session just completed — start new one */}
      {!sessionActive && activeSession.status === "active" && totalPlayed >= 5 && (
        <button
          onClick={handleNewSession}
          className="w-full h-14 rounded-2xl btn-accent text-base font-bold
                     active:scale-[0.97] transition-all duration-150
                     cursor-pointer mt-3 animate-glow-pulse"
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
        confirmColor="btn-accent"
        onConfirm={handleEndEarly}
        onCancel={() => setShowEndConfirm(false)}
      />
    </section>
  );
}
