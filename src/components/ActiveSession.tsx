"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import PoolBall from "./PoolBall";
import ScoreRing from "./ScoreRing";
import ConfirmDialog from "./ConfirmDialog";
import Confetti from "./Confetti";
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
  const cancelSession = useMutation(api.sessions.cancelSession);

  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

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
        setConfettiActive(true);
        setTimeout(() => setConfettiActive(false), 3500);
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

  const handleCancelSession = async () => {
    if (!activeSession) return;
    setShowCancelConfirm(false);
    playClick();
    await cancelSession({ sessionId: activeSession._id });
    showToast("Session cancelled — no points awarded", "info");
  };

  // ── Loading ──────────────────────────────────────
  if (activeSession === undefined) {
    return (
      <section className="glass rounded-3xl p-6 animate-fade-in">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-2 h-2 rounded-full bg-slate-700" />
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Session</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-[3px] border-amber-400/70 border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  // ── No active session ────────────────────────────
  if (activeSession === null) {
    return (
      <section className="glass rounded-3xl p-6 animate-slide-up text-center">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-2 h-2 rounded-full bg-slate-700" />
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Session</h2>
        </div>
        <div className="py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/50 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-slate-500">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm mb-6">No session in progress</p>
        </div>
        <button
          onClick={handleNewSession}
          className="w-full h-14 rounded-2xl btn-accent text-base font-extrabold
                     active:scale-[0.97] transition-all duration-150
                     cursor-pointer animate-glow-pulse"
        >
          Start New Session
        </button>
      </section>
    );
  }

  // ── Active session ───────────────────────────────
  return (
    <section className="glass-elevated rounded-3xl p-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-live-dot" />
          <h2 className="text-sm font-bold text-emerald-400/90 uppercase tracking-wider">Live</h2>
        </div>
        {totalPlayed > 0 && sessionActive && (
          <span className="text-[11px] text-slate-400 font-bold bg-slate-800/70 px-3 py-1 rounded-full border border-slate-700/40">
            GAME {totalPlayed + 1} / 5
          </span>
        )}
      </div>

      {/* Score Rings */}
      <div className="flex items-center justify-center gap-3 mb-5">
        <div className="flex-1 flex flex-col items-center">
          <ScoreRing
            score={activeSession.matisseWins}
            maxScore={3}
            color="blue"
            label="Matisse"
            size={110}
          />
        </div>

        {/* VS divider */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-slate-600/40 to-transparent" />
          <span className="text-[11px] font-black text-slate-600 uppercase">vs</span>
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-slate-600/40 to-transparent" />
        </div>

        <div className="flex-1 flex flex-col items-center">
          <ScoreRing
            score={activeSession.joeWins}
            maxScore={3}
            color="red"
            label="Joe"
            size={110}
          />
        </div>
      </div>

      {/* Pool Balls timeline */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 px-2">
        {balls.map((ball, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 ball-connector">
            <PoolBall number={i + 1} winner={ball.winner} isNext={!!sessionActive && i === totalPlayed} />
          </div>
        ))}
      </div>

      {/* Confetti celebration */}
      <Confetti active={confettiActive} />

      {/* Win Buttons */}
      {sessionActive && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={() => handleRecordWin("matisse")}
            disabled={isRecording}
            className="h-[56px] rounded-2xl btn-matisse text-white text-[15px] font-bold
                       transition-all duration-150
                       cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-60">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" fill="currentColor" />
            </svg>
            Matisse
          </button>
          <button
            onClick={() => handleRecordWin("joe")}
            disabled={isRecording}
            className="h-[56px] rounded-2xl btn-joe text-white text-[15px] font-bold
                       transition-all duration-150
                       cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-60">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" fill="currentColor" />
            </svg>
            Joe
          </button>
        </div>
      )}

      {/* Undo + End Session + Cancel */}
      {sessionActive && (
        <div className="flex flex-wrap items-center gap-2">
          {totalPlayed > 0 && (
            <button
              onClick={handleUndo}
              className="h-11 px-4 rounded-xl btn-ghost text-slate-400 text-sm font-medium
                         transition-all duration-150
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
          )}
          {totalPlayed > 0 && (
            <button
              onClick={() => setShowEndConfirm(true)}
              className="h-11 px-4 rounded-xl btn-ghost text-amber-400/80 text-sm font-medium
                         transition-all duration-150 cursor-pointer"
            >
              End Early
            </button>
          )}
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="h-11 px-4 rounded-xl btn-ghost text-red-400/70 text-sm font-medium
                       transition-all duration-150 cursor-pointer ml-auto
                       flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Cancel
          </button>
        </div>
      )}

      {/* Session completed — start new */}
      {!sessionActive && activeSession.status === "active" && totalPlayed >= 5 && (
        <button
          onClick={handleNewSession}
          className="w-full h-14 rounded-2xl btn-accent text-base font-extrabold
                     transition-all duration-150
                     cursor-pointer mt-3 animate-glow-pulse"
        >
          Start Next Session
        </button>
      )}

      {/* Confirm End */}
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

      {/* Confirm Cancel */}
      <ConfirmDialog
        open={showCancelConfirm}
        title="Cancel Session?"
        message="This will discard the entire session. No points will be awarded to either player."
        confirmLabel="Cancel Session"
        cancelLabel="Keep Playing"
        confirmColor="btn-ghost"
        onConfirm={handleCancelSession}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </section>
  );
}
