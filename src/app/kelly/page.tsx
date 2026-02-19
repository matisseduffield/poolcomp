"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { showToast } from "../../components/Toast";
import { playClick, playCheer } from "../../lib/sounds";
import ToastContainer from "../../components/Toast";
import AmbientBackground from "../../components/AmbientBackground";

function PlayerSetup({ onStart }: { onStart: (names: string[]) => void }) {
  const [players, setPlayers] = useState<string[]>(["", ""]);

  const addPlayer = () => {
    if (players.length >= 15) return;
    setPlayers([...players, ""]);
  };

  const removePlayer = (idx: number) => {
    if (players.length <= 2) return;
    setPlayers(players.filter((_, i) => i !== idx));
  };

  const updatePlayer = (idx: number, name: string) => {
    const updated = [...players];
    updated[idx] = name;
    setPlayers(updated);
  };

  const canStart = players.filter((n) => n.trim()).length >= 2;

  return (
    <div className="glass-elevated rounded-3xl p-5 animate-slide-up">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
        <h2 className="text-sm font-bold text-amber-400/80 uppercase tracking-wider">New Game Setup</h2>
      </div>

      <div className="space-y-3 mb-5">
        {players.map((name, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 w-5 text-right tabular-nums">{idx + 1}</span>
            <input
              type="text"
              value={name}
              onChange={(e) => updatePlayer(idx, e.target.value)}
              placeholder={`Player ${idx + 1}`}
              className="flex-1 h-11 rounded-xl bg-slate-800/60 border border-slate-700/40 px-3.5
                         text-sm text-white placeholder:text-slate-600
                         focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20
                         transition-all duration-200"
            />
            {players.length > 2 && (
              <button
                onClick={() => removePlayer(idx)}
                className="w-9 h-9 rounded-lg flex items-center justify-center
                           text-slate-600 hover:text-red-400 hover:bg-red-400/10
                           transition-all duration-150 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        {players.length < 15 && (
          <button
            onClick={addPlayer}
            className="h-11 px-4 rounded-xl btn-ghost text-slate-400 text-sm font-medium
                       transition-all duration-150 cursor-pointer flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add Player
          </button>
        )}
        <button
          onClick={() => {
            const validNames = players.filter((n) => n.trim());
            if (validNames.length >= 2) onStart(validNames);
          }}
          disabled={!canStart}
          className="flex-1 h-12 rounded-2xl btn-accent text-base font-extrabold
                     transition-all duration-150 cursor-pointer
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Deal Balls ({players.filter((n) => n.trim()).length} players)
        </button>
      </div>
    </div>
  );
}

function KellyBall({
  number,
  isPocketed,
  isLowest,
  isSecret,
  onClick,
}: {
  number: number;
  isPocketed: boolean;
  isLowest: boolean;
  isSecret?: boolean;
  onClick?: () => void;
}) {
  // Color coding for pool balls
  const solidColors: Record<number, string> = {
    1: "#fbbf24", // yellow
    2: "#3b82f6", // blue
    3: "#ef4444", // red
    4: "#7c3aed", // purple
    5: "#f97316", // orange
    6: "#22c55e", // green
    7: "#991b1b", // dark red
    8: "#1e293b", // black
    9: "#fbbf24", // yellow stripe
    10: "#3b82f6", // blue stripe
    11: "#ef4444", // red stripe
    12: "#7c3aed", // purple stripe
    13: "#f97316", // orange stripe
    14: "#22c55e", // green stripe
    15: "#991b1b", // dark red stripe
  };

  const isStripe = number >= 9;
  const color = solidColors[number] || "#fff";

  return (
    <button
      onClick={onClick}
      disabled={isPocketed || !onClick}
      className={`
        relative w-11 h-11 rounded-full flex items-center justify-center
        transition-all duration-200 cursor-pointer
        ${isPocketed
          ? "opacity-20 scale-75 cursor-not-allowed"
          : isLowest
            ? "ring-2 ring-amber-400/60 animate-pulse-ring shadow-[0_0_12px_rgba(251,191,36,0.2)]"
            : isSecret
              ? "ring-2 ring-emerald-400/50 shadow-[0_0_12px_rgba(52,211,153,0.15)]"
              : "hover:scale-110 active:scale-95"
        }
      `}
      style={{
        background: isPocketed
          ? "rgba(30,41,59,0.5)"
          : isStripe
            ? `linear-gradient(135deg, white 20%, ${color} 40%, ${color} 60%, white 80%)`
            : `radial-gradient(circle at 35% 35%, ${color}ee, ${color})`,
        boxShadow: isPocketed ? "none" : `0 2px 8px ${color}44`,
      }}
    >
      {/* Number circle for stripes / center for solids */}
      <span
        className={`
          text-[11px] font-black leading-none
          ${isPocketed ? "text-slate-700" : ""}
          ${!isPocketed && isStripe ? "bg-white text-slate-900 w-5 h-5 rounded-full flex items-center justify-center" : ""}
          ${!isPocketed && !isStripe && number === 8 ? "text-white" : ""}
          ${!isPocketed && !isStripe && number !== 8 ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" : ""}
        `}
      >
        {number}
      </span>

      {/* Shine highlight */}
      {!isPocketed && (
        <div
          className="absolute top-1 left-1.5 w-3 h-2 rounded-full opacity-40"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.7), transparent)" }}
        />
      )}
    </button>
  );
}

function ActiveKellyGame({
  game,
}: {
  game: {
    _id: string;
    players: Array<{
      name: string;
      secretBall: number;
      isEliminated: boolean;
      order: number;
    }>;
    currentTurnIndex: number;
    ballsPocketed: number[];
    lowestBallOnTable: number;
    winner?: string;
    status: string;
  };
}) {
  const pocketBall = useMutation(api.kelly.pocketBall);
  const passTurn = useMutation(api.kelly.passTurn);
  const advanceTurn = useMutation(api.kelly.advanceTurn);
  const cancelGame = useMutation(api.kelly.cancelGame);
  const [showCancel, setShowCancel] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [lastPocketed, setLastPocketed] = useState(false);

  const currentPlayer = game.players[game.currentTurnIndex];
  const allBalls = Array.from({ length: 15 }, (_, i) => i + 1);
  const activePlayers = game.players.filter((p) => !p.isEliminated);

  // Find viewer's secret ball (show all since it's a shared device)
  const handlePocket = async (ballNumber: number) => {
    playClick();
    try {
      const result = await pocketBall({
        gameId: game._id as never,
        ballNumber,
      });
      setLastPocketed(true);

      if (result.eliminated && !result.winner) {
        showToast(`${result.eliminated} eliminated! Their secret ball was ${ballNumber}`, "info");
      }
      if (result.winner) {
        playCheer();
        showToast(`🏆 ${result.winner} wins the game!`, "success");
      }
    } catch (e: unknown) {
      showToast((e as Error).message, "info");
    }
  };

  const handleMiss = async () => {
    playClick();
    setLastPocketed(false);
    await passTurn({ gameId: game._id as never });
  };

  const handleEndTurn = async () => {
    playClick();
    setLastPocketed(false);
    await advanceTurn({ gameId: game._id as never });
  };

  const handleCancel = async () => {
    setShowCancel(false);
    playClick();
    await cancelGame({ gameId: game._id as never });
    showToast("Kelly game cancelled", "info");
  };

  if (game.status === "finished") {
    return (
      <div className="glass-elevated rounded-3xl p-5 animate-slide-up text-center">
        <div className="text-4xl mb-3">🏆</div>
        <h2 className="text-2xl font-black text-gradient-gold mb-2">{game.winner} Wins!</h2>
        <p className="text-slate-500 text-sm mb-5">
          {game.ballsPocketed.length} balls pocketed &middot; {game.players.length} players
        </p>

        {/* Reveal all secret balls */}
        <div className="space-y-1.5">
          {game.players.map((player, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between px-3.5 py-2 rounded-xl ${
                player.name === game.winner
                  ? "bg-amber-400/10 border border-amber-500/20"
                  : player.isEliminated
                    ? "stat-card opacity-50"
                    : "stat-card"
              }`}
            >
              <div className="flex items-center gap-2">
                {player.name === game.winner && <span className="text-sm">🏆</span>}
                {player.isEliminated && <span className="text-[10px] text-red-400/60 font-bold">OUT</span>}
                <span className={`text-sm font-semibold ${player.isEliminated ? "line-through text-slate-600" : "text-white"}`}>
                  {player.name}
                </span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800/50 text-slate-400">
                🎱 {player.secretBall}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-elevated rounded-3xl p-5 animate-slide-up space-y-5">
      {/* Turn indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-live-dot" />
          <h2 className="text-sm font-bold text-emerald-400/90 uppercase tracking-wider">Kelly Pool</h2>
        </div>
        <span className="text-[11px] text-slate-400 font-bold bg-slate-800/70 px-3 py-1 rounded-full border border-slate-700/40">
          {15 - game.ballsPocketed.length} BALLS LEFT
        </span>
      </div>

      {/* Current player */}
      <div className="glass rounded-2xl p-4 text-center">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-1">Now Shooting</p>
        <p className="text-2xl font-black text-white">{currentPlayer.name}</p>
        <p className="text-xs text-amber-400/70 font-semibold mt-1">
          Must hit the <span className="text-amber-400 font-black">{game.lowestBallOnTable}</span> ball first
        </p>
      </div>

      {/* Ball Table */}
      <div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-3 px-1">Tap a ball to pocket it</p>
        <div className="grid grid-cols-5 gap-2.5 justify-items-center">
          {allBalls.map((num) => (
            <KellyBall
              key={num}
              number={num}
              isPocketed={game.ballsPocketed.includes(num)}
              isLowest={num === game.lowestBallOnTable}
              onClick={game.ballsPocketed.includes(num) ? undefined : () => handlePocket(num)}
            />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2.5">
        {lastPocketed ? (
          <button
            onClick={handleEndTurn}
            className="flex-1 h-12 rounded-2xl btn-accent text-sm font-bold
                       transition-all duration-150 cursor-pointer
                       flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            End Turn
          </button>
        ) : (
          <button
            onClick={handleMiss}
            className="flex-1 h-12 rounded-2xl btn-ghost text-slate-400 text-sm font-bold
                       border border-slate-700/40 transition-all duration-150 cursor-pointer
                       flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Miss / Foul
          </button>
        )}
      </div>

      {/* Players list */}
      <div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-3 px-1">
          Players
          <button
            onClick={() => setShowSecret(!showSecret)}
            className="ml-2 text-amber-400/50 hover:text-amber-400 transition-colors cursor-pointer"
          >
            {showSecret ? "hide secrets" : "show secrets"}
          </button>
        </p>
        <div className="space-y-1.5">
          {game.players.map((player, idx) => (
            <div
              key={idx}
              className={`
                flex items-center justify-between px-3.5 py-2.5 rounded-xl
                ${player.isEliminated
                  ? "bg-slate-800/30 opacity-50"
                  : idx === game.currentTurnIndex
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "stat-card"
                }
                transition-all duration-200
              `}
            >
              <div className="flex items-center gap-2.5">
                {idx === game.currentTurnIndex && !player.isEliminated && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
                <span className={`text-sm font-semibold ${player.isEliminated ? "line-through text-slate-600" : "text-white"}`}>
                  {player.name}
                </span>
                {player.isEliminated && (
                  <span className="text-[10px] text-red-400/60 font-bold">OUT</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {showSecret && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    player.isEliminated
                      ? "bg-slate-800/50 text-slate-600"
                      : "bg-amber-400/10 text-amber-400/80"
                  }`}>
                    🎱 {player.secretBall}
                  </span>
                )}
                <span className="text-[9px] text-slate-600 font-bold">#{player.order + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel */}
      <div className="pt-2 border-t border-slate-700/20">
        {!showCancel ? (
          <button
            onClick={() => setShowCancel(true)}
            className="w-full h-10 rounded-xl btn-ghost text-red-400/60 text-xs font-medium
                       transition-all duration-150 cursor-pointer"
          >
            Cancel Game
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setShowCancel(false)}
              className="flex-1 h-10 rounded-xl btn-ghost text-slate-400 text-xs font-medium
                         transition-all duration-150 cursor-pointer"
            >
              Keep Playing
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 h-10 rounded-xl bg-red-500/20 text-red-400 text-xs font-bold
                         border border-red-500/20 transition-all duration-150 cursor-pointer"
            >
              Yes, Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function KellyGameHistory() {
  const history = useQuery(api.kelly.getHistory);

  if (!history || history.length === 0) return null;

  return (
    <div className="glass rounded-3xl p-5 animate-slide-up-d1">
      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2.5">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-slate-500">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Past Games
      </h2>
      <ul className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
        {history.map((game) => (
          <li
            key={game._id}
            className="stat-card rounded-xl border-l-[3px] border-l-amber-500/50 px-3.5 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm">🏆</span>
              <span className="text-sm font-bold text-white">{game.winner}</span>
            </div>
            <span className="text-[11px] text-slate-600 font-medium">
              {game.players.length} players
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function KellyPoolPage() {
  const activeGame = useQuery(api.kelly.getActive);
  const createGame = useMutation(api.kelly.createGame);
  const [showNewSetup, setShowNewSetup] = useState(false);

  const handleStart = async (names: string[]) => {
    playClick();
    setShowNewSetup(false);
    try {
      await createGame({ playerNames: names });
      showToast("Balls dealt! Game on! 🎱", "success");
    } catch (e: unknown) {
      showToast((e as Error).message, "info");
    }
  };

  return (
    <div className="min-h-dvh safe-top relative overflow-x-hidden">
      <AmbientBackground />

      {/* Header */}
      <header className="sticky top-0 z-30 glass-elevated relative header-glow">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <div className="flex flex-col -space-y-0.5">
              <h1 className="text-lg font-black tracking-tight text-gradient-gold">
                Kelly Pool
              </h1>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-[0.15em]">
                Rotation Game
              </span>
            </div>
          </div>
          {/* Info tooltip */}
          <div className="relative group">
            <button className="w-9 h-9 rounded-full glass flex items-center justify-center text-slate-400 cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-lg mx-auto px-3 sm:px-4 pt-5 pb-10 safe-bottom">
        <div className="space-y-5">
          {/* Rules card */}
          <div className="glass rounded-2xl p-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-base">🎱</span>
              </div>
              <div className="text-xs text-slate-500 leading-relaxed">
                <p className="font-semibold text-slate-400 mb-1">How to play</p>
                <p>
                  Each player is secretly assigned a numbered ball. Players take turns shooting —
                  you must always hit the <span className="text-amber-400 font-bold">lowest numbered ball</span> on
                  the table first.
                  Pocket your own secret ball to <span className="text-emerald-400 font-bold">win</span>.
                  If someone else pockets your ball, you&apos;re <span className="text-red-400 font-bold">eliminated</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Game area */}
          {activeGame === undefined && (
            <div className="glass rounded-3xl p-6 animate-fade-in">
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-[3px] border-amber-400/70 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}

          {activeGame === null && <PlayerSetup onStart={handleStart} />}

          {activeGame && activeGame.status !== "finished" && !showNewSetup && (
            <ActiveKellyGame game={activeGame as never} />
          )}

          {showNewSetup && <PlayerSetup onStart={handleStart} />}

          {activeGame && activeGame.status === "finished" && !showNewSetup && (
            <>
              <ActiveKellyGame game={activeGame as never} />
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleStart(activeGame.players.map((p) => p.name))}
                  className="h-14 rounded-2xl btn-accent text-sm font-extrabold
                             transition-all duration-150 cursor-pointer animate-glow-pulse"
                >
                  Play Again
                </button>
                <button
                  onClick={() => {
                    // Force a new setup by creating a game with empty (triggers null state)
                    // Actually, just reload — the finished game returns from getActive
                    // We need to show the setup screen. Let's use state.
                    setShowNewSetup(true);
                  }}
                  className="h-14 rounded-2xl btn-ghost text-sm font-bold
                             border border-slate-700/30 transition-all duration-150 cursor-pointer"
                >
                  New Players
                </button>
              </div>
            </>
          )}

          <KellyGameHistory />
        </div>
      </main>

      <ToastContainer />
    </div>
  );
}
