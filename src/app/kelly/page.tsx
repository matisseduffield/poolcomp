"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { showToast } from "../../components/Toast";
import { playClick, playCheer, playPocket, playRestore, playEliminate, playDeal } from "../../lib/sounds";
import ToastContainer from "../../components/Toast";
import AmbientBackground from "../../components/AmbientBackground";
import Confetti from "../../components/Confetti";

// ── Helpers ─────────────────────────────────────────
const STORAGE_KEY = "kelly-pool-players";

const PLAYER_COLORS = [
  "#f59e0b", "#3b82f6", "#ef4444", "#22c55e", "#a855f7",
  "#f97316", "#06b6d4", "#ec4899", "#84cc16", "#6366f1",
  "#14b8a6", "#f43f5e", "#eab308", "#8b5cf6", "#0ea5e9",
];

const RACK_ROWS = [[1], [2, 3], [4, 5, 6], [7, 8, 9, 10], [11, 12, 13, 14, 15]];

function loadSavedPlayers(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 2) return parsed;
    }
  } catch { /* ignore */ }
  return ["", ""];
}

function savePlayers(names: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
  } catch { /* ignore */ }
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m < 60) return `${m}m ${rem}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function PlayerSetup({ onStart }: { onStart: (names: string[], ballsPerPlayer: number) => void }) {
  const [players, setPlayers] = useState<string[]>(["", ""]);
  const [ballsPerPlayer, setBallsPerPlayer] = useState(1);
  const [loaded, setLoaded] = useState(false);

  // Load saved names on mount (client-only)
  useEffect(() => {
    setPlayers(loadSavedPlayers());
    setLoaded(true);
  }, []);

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

  const validCount = players.filter((n) => n.trim()).length;
  const trimmed = players.map(n => n.trim().toLowerCase()).filter(Boolean);
  const hasDuplicates = trimmed.length !== new Set(trimmed).size;
  const canStart = validCount >= 2 && !hasDuplicates;
  const maxBalls = validCount >= 2 ? Math.floor(15 / validCount) : 1;

  // Clamp ballsPerPlayer if player count changes
  const effectiveBpp = Math.min(ballsPerPlayer, maxBalls);

  return (
    <div className="glass-elevated rounded-3xl p-5 animate-slide-up">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
        <h2 className="text-sm font-bold text-amber-400/80 uppercase tracking-wider">New Game Setup</h2>
      </div>

      <div className="space-y-3 mb-5">
        {players.map((name, idx) => {
          const isDupe = name.trim() && trimmed.filter(t => t === name.trim().toLowerCase()).length > 1;
          return (
          <div key={idx} className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full flex-shrink-0 border border-white/10"
              style={{ background: PLAYER_COLORS[idx % PLAYER_COLORS.length] }}
            />
            <input
              type="text"
              value={name}
              onChange={(e) => updatePlayer(idx, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (canStart) {
                    const validNames = players.filter((n) => n.trim());
                    savePlayers(validNames);
                    onStart(validNames, effectiveBpp);
                  } else if (idx === players.length - 1 && players.length < 15) {
                    addPlayer();
                  }
                }
              }}
              placeholder={`Player ${idx + 1}`}
              className={`flex-1 h-11 rounded-xl bg-slate-800/60 border px-3.5
                         text-sm text-white placeholder:text-slate-600
                         focus:outline-none focus:ring-1
                         transition-all duration-200
                         ${isDupe
                           ? "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/30"
                           : "border-slate-700/40 focus:border-amber-500/40 focus:ring-amber-500/20"
                         }`}
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
          );
        })}
        {hasDuplicates && (
          <p className="text-[10px] text-red-400/80 font-medium px-1">Duplicate player names aren&apos;t allowed</p>
        )}
      </div>

      {/* Balls per player selector */}
      <div className="glass rounded-xl p-3.5 mb-5">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-2.5">Balls Per Player</p>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].filter(n => n <= maxBalls).map((n) => (
            <button
              key={n}
              onClick={() => setBallsPerPlayer(n)}
              className={`
                flex-1 h-10 rounded-lg text-sm font-bold transition-all duration-150 cursor-pointer
                ${effectiveBpp === n
                  ? "bg-amber-400/20 text-amber-400 border border-amber-500/30"
                  : "bg-slate-800/40 text-slate-500 border border-slate-700/30 hover:text-slate-300"
                }
              `}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-600 mt-2">
          {validCount} players × {effectiveBpp} ball{effectiveBpp > 1 ? "s" : ""} = {validCount * effectiveBpp} of 15 balls assigned
        </p>
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
            if (validNames.length >= 2) {
              savePlayers(players.filter((n) => n.trim()));
              onStart(validNames, effectiveBpp);
            }
          }}
          disabled={!canStart}
          className="flex-1 h-12 rounded-2xl btn-accent text-base font-extrabold
                     transition-all duration-150 cursor-pointer
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Deal Balls ({validCount} players)
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
  size,
  onClick,
}: {
  number: number;
  isPocketed: boolean;
  isLowest: boolean;
  isSecret?: boolean;
  size?: "sm" | "md" | "lg";
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
  const sizeClass = size === "lg" ? "w-14 h-14" : size === "sm" ? "w-9 h-9" : "w-11 h-11";
  const textSize = size === "lg" ? "text-sm" : size === "sm" ? "text-[9px]" : "text-[11px]";
  const stripeCircle = size === "lg" ? "w-6 h-6" : size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`
        relative ${sizeClass} rounded-full flex items-center justify-center
        transition-all duration-200 cursor-pointer
        ${isPocketed
          ? "opacity-30 scale-75"
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
          ${textSize} font-black leading-none
          ${isPocketed ? "text-slate-700" : ""}
          ${!isPocketed && isStripe ? `bg-white text-slate-900 ${stripeCircle} rounded-full flex items-center justify-center` : ""}
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

// ── Initial ball reveal flow (pass the phone around) ──────────────
function BallRevealFlow({
  game,
  onComplete,
}: {
  game: {
    _id: string;
    players: Array<{
      name: string;
      secretBalls?: number[];
      secretBall?: number;
      peekCount?: number;
    }>;
    ballsPerPlayer?: number;
  };
  onComplete: () => void;
}) {
  const recordPeek = useMutation(api.kelly.recordPeek);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const effectiveBpp = game.ballsPerPlayer ?? 1;

  const getPlayerBalls = (p: typeof game.players[number]): number[] =>
    p.secretBalls ?? (p.secretBall != null ? [p.secretBall] : []);

  const player = game.players[currentIdx];
  const isLast = currentIdx >= game.players.length - 1;

  const handleReveal = async () => {
    playClick();
    setRevealed(true);
    await recordPeek({ gameId: game._id as never, playerIndex: currentIdx });
  };

  const handleDone = () => {
    playClick();
    setRevealed(false);
    if (isLast) {
      onComplete();
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="mx-6 max-w-sm w-full rounded-3xl p-8 text-center space-y-5 bg-gradient-to-b from-slate-800/95 to-slate-900/95 border border-slate-600/30 animate-scale-in">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {game.players.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i < currentIdx
                  ? "w-2 h-2 bg-emerald-400"
                  : i === currentIdx
                    ? "w-2.5 h-2.5 bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]"
                    : "w-2 h-2 bg-slate-700"
              }`}
            />
          ))}
        </div>

        {!revealed ? (
          <>
            <div className="text-4xl">📱</div>
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                Player {currentIdx + 1} of {game.players.length}
              </p>
              <p className="text-2xl font-black text-white">Pass the phone to</p>
              <p className="text-3xl font-black text-gradient-gold">{player.name}</p>
            </div>
            <p className="text-xs text-slate-500">Make sure nobody else is looking!</p>
            <button
              onClick={handleReveal}
              className="w-full h-14 rounded-2xl btn-accent text-base font-extrabold
                         transition-all duration-150 cursor-pointer"
            >
              Reveal My Ball{effectiveBpp > 1 ? "s" : ""}
            </button>
          </>
        ) : (
          <>
            <div className="text-3xl">🤫</div>
            <p className="text-lg font-black text-emerald-400">{player.name}&apos;s Secret Ball{effectiveBpp > 1 ? "s" : ""}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Remember {effectiveBpp > 1 ? "these" : "this"}!</p>
            <div className="flex items-center justify-center gap-3 py-3">
              {getPlayerBalls(player).map((ball) => (
                <KellyBall
                  key={ball}
                  number={ball}
                  isPocketed={false}
                  isLowest={false}
                  isSecret={true}
                  size="lg"
                />
              ))}
            </div>
            <button
              onClick={handleDone}
              className="w-full h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 text-base font-extrabold
                         border border-emerald-500/30 transition-all duration-150 cursor-pointer
                         hover:bg-emerald-500/30"
            >
              {isLast ? "Start Game!" : "Done — Pass to Next Player"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main active game component ────────────────────
function ActiveKellyGame({
  game,
}: {
  game: {
    _id: string;
    players: Array<{
      name: string;
      secretBalls?: number[];
      secretBall?: number;
      isEliminated: boolean;
      order: number;
      peekCount?: number;
    }>;
    ballsPerPlayer?: number;
    ballsPocketed: number[];
    winner?: string;
    status: string;
    startedAt?: number;
    endedAt?: number;
  };
}) {
  const pocketBall = useMutation(api.kelly.pocketBall);
  const unpocketBall = useMutation(api.kelly.unpocketBall);
  const cancelGame = useMutation(api.kelly.cancelGame);
  const recordPeek = useMutation(api.kelly.recordPeek);
  const [showCancel, setShowCancel] = useState(false);
  // Per-player secret reveal
  const [peekingPlayer, setPeekingPlayer] = useState<number | null>(null);
  // Announcement state after pocketing
  const [announcement, setAnnouncement] = useState<{
    ballNumber: number;
    ownerName: string | null;
    eliminated: string | undefined;
    winner: string | null;
  } | null>(null);
  // Initial reveal flow
  const [showRevealFlow, setShowRevealFlow] = useState(false);
  const [revealCompleted, setRevealCompleted] = useState(false);
  // Confetti on win
  const [showConfetti, setShowConfetti] = useState(false);
  // Live elapsed time
  const [elapsed, setElapsed] = useState("");

  const allBalls = Array.from({ length: 15 }, (_, i) => i + 1);
  const effectiveBpp = game.ballsPerPlayer ?? 1;
  const progressPct = (game.ballsPocketed.length / 15) * 100;

  const getPlayerBalls = useCallback((p: typeof game.players[number]): number[] =>
    p.secretBalls ?? (p.secretBall != null ? [p.secretBall] : []), []);

  // Show initial reveal flow on first mount if no balls have been pocketed yet
  useEffect(() => {
    if (game.status === "active" && game.ballsPocketed.length === 0 && !revealCompleted) {
      // Check if anyone has peeked already (if so, the reveal was already done)
      const anyPeeks = game.players.some((p) => (p.peekCount ?? 0) > 0);
      if (!anyPeeks) {
        setShowRevealFlow(true);
      }
    }
  }, [game.status, game.ballsPocketed.length, game.players, revealCompleted]);

  // Auto-dismiss announcement after 2.5 seconds
  useEffect(() => {
    if (announcement && !announcement.winner) {
      const timer = setTimeout(() => setAnnouncement(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  // Live game timer
  useEffect(() => {
    if (game.status === "active" && game.startedAt) {
      const tick = () => setElapsed(formatDuration(Date.now() - game.startedAt!));
      tick();
      const iv = setInterval(tick, 1000);
      return () => clearInterval(iv);
    }
    if (game.status === "finished" && game.startedAt && game.endedAt) {
      setElapsed(formatDuration(game.endedAt - game.startedAt));
    }
  }, [game.status, game.startedAt, game.endedAt]);

  // Trigger confetti on win
  useEffect(() => {
    if (game.status === "finished" && game.winner) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(t);
    }
  }, [game.status, game.winner]);

  const handlePocket = async (ballNumber: number) => {
    playPocket();
    try {
      const result = await pocketBall({
        gameId: game._id as never,
        ballNumber,
      });

      setAnnouncement({
        ballNumber: result.ballNumber,
        ownerName: result.ownerName ?? null,
        eliminated: result.eliminated ?? undefined,
        winner: result.winner ?? null,
      });

      if (result.winner) {
        playCheer();
      } else if (result.eliminated) {
        playEliminate();
      }
    } catch (e: unknown) {
      showToast((e as Error).message, "info");
    }
  };

  const handleUnpocket = async (ballNumber: number) => {
    playRestore();
    try {
      await unpocketBall({ gameId: game._id as never, ballNumber });
    } catch (e: unknown) {
      showToast((e as Error).message, "info");
    }
  };

  const handleCancel = async () => {
    setShowCancel(false);
    playClick();
    await cancelGame({ gameId: game._id as never });
    showToast("Kelly game cancelled", "info");
  };

  const handlePeek = async (playerIndex: number) => {
    playClick();
    setPeekingPlayer(playerIndex);
    await recordPeek({ gameId: game._id as never, playerIndex });
  };

  if (game.status === "finished") {
    return (
      <div className="glass-elevated rounded-3xl p-5 animate-slide-up text-center">
        <Confetti active={showConfetti} />
        <div className="text-4xl mb-3">🏆</div>
        <h2 className="text-2xl font-black text-gradient-gold mb-1">{game.winner} Wins!</h2>
        <div className="flex items-center justify-center gap-3 text-slate-500 text-sm mb-5">
          <span>{game.ballsPocketed.length} balls pocketed</span>
          <span>&middot;</span>
          <span>{game.players.length} players</span>
          {effectiveBpp > 1 && <><span>&middot;</span><span>{effectiveBpp} balls each</span></>}
          {elapsed && <><span>&middot;</span><span>⏱ {elapsed}</span></>}
        </div>

        {/* Reveal all secret balls with actual colored balls */}
        <div className="space-y-2">
          {[...game.players]
            .sort((a, b) => {
              if (a.name === game.winner) return -1;
              if (b.name === game.winner) return 1;
              if (a.isEliminated && !b.isEliminated) return 1;
              if (!a.isEliminated && b.isEliminated) return -1;
              return 0;
            })
            .map((player, idx) => {
            const balls = getPlayerBalls(player);
            // Find original index for consistent color
            const origIdx = game.players.findIndex(p => p.name === player.name && p.order === player.order);
            return (
              <div
                key={idx}
                className={`flex items-center justify-between px-4 py-3 rounded-xl ${
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
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      background: PLAYER_COLORS[(origIdx >= 0 ? origIdx : idx) % PLAYER_COLORS.length],
                      opacity: player.isEliminated ? 0.3 : 1,
                    }}
                  />
                  <span className={`text-sm font-semibold ${player.isEliminated ? "line-through text-slate-600" : "text-white"}`}>
                    {player.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {balls.map((ball) => (
                    <KellyBall
                      key={ball}
                      number={ball}
                      isPocketed={game.ballsPocketed.includes(ball)}
                      isLowest={false}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Initial ball reveal flow */}
      {showRevealFlow && (
        <BallRevealFlow
          game={game}
          onComplete={() => {
            setShowRevealFlow(false);
            setRevealCompleted(true);
          }}
        />
      )}

      <div className="glass-elevated rounded-3xl p-5 animate-slide-up space-y-5">
        {/* Announcement overlay — auto-dismisses, tap anywhere to dismiss */}
        {announcement && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setAnnouncement(null)}
          >
            <div
              className={`mx-6 max-w-sm w-full rounded-3xl p-6 text-center space-y-3 animate-scale-in ${
                announcement.winner
                  ? "bg-gradient-to-b from-amber-950/90 to-slate-900/95 border border-amber-500/30"
                  : announcement.eliminated
                    ? "bg-gradient-to-b from-red-950/90 to-slate-900/95 border border-red-500/30"
                    : announcement.ownerName
                      ? "bg-gradient-to-b from-orange-950/90 to-slate-900/95 border border-orange-500/30"
                      : "bg-gradient-to-b from-slate-800/95 to-slate-900/95 border border-slate-600/30"
              }`}
            >
              <div className="text-4xl">
                {announcement.winner ? "🏆" : announcement.eliminated ? "💀" : announcement.ownerName ? "⚠️" : "✅"}
              </div>
              <div className="space-y-1">
                {announcement.winner ? (
                  <>
                    <p className="text-2xl font-black text-gradient-gold">{announcement.winner} Wins!</p>
                    <p className="text-sm text-slate-400">The <span className="text-amber-400 font-bold">{announcement.ballNumber}</span> ball was theirs!</p>
                  </>
                ) : announcement.eliminated ? (
                  <>
                    <p className="text-xl font-black text-red-400">{announcement.eliminated} Eliminated!</p>
                    <p className="text-sm text-slate-400">
                      The <span className="text-amber-400 font-bold">{announcement.ballNumber}</span> ball was {announcement.eliminated}&apos;s
                      {effectiveBpp > 1 ? " last secret ball" : " secret ball"}!
                    </p>
                  </>
                ) : announcement.ownerName ? (
                  <>
                    <p className="text-xl font-black text-orange-400">{announcement.ownerName}&apos;s Ball!</p>
                    <p className="text-sm text-slate-400">
                      The <span className="text-amber-400 font-bold">{announcement.ballNumber}</span> ball belongs to {announcement.ownerName}
                      {effectiveBpp > 1 ? " — they still have balls left" : ""}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xl font-black text-slate-300">Nobody&apos;s Ball</p>
                    <p className="text-sm text-slate-500">
                      The <span className="text-amber-400 font-bold">{announcement.ballNumber}</span> ball wasn&apos;t assigned to anyone
                    </p>
                  </>
                )}
              </div>
              {/* Auto-dismiss progress bar */}
              {!announcement.winner && (
                <div className="w-full h-0.5 bg-slate-700/50 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-slate-400/40 rounded-full animate-[shrink_2.5s_linear_forwards]" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Peek overlay */}
        {peekingPlayer !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in"
            onClick={() => setPeekingPlayer(null)}
          >
            <div
              className="mx-6 max-w-sm w-full rounded-3xl p-6 text-center space-y-4 bg-gradient-to-b from-emerald-950/90 to-slate-900/95 border border-emerald-500/30 animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-3xl">🤫</div>
              <p className="text-lg font-black text-emerald-400">{game.players[peekingPlayer].name}&apos;s Secret Ball{effectiveBpp > 1 ? "s" : ""}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Don&apos;t let anyone else see!</p>
              {/* Peek counter */}
              <div className="flex items-center justify-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-slate-500">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span className="text-[10px] text-slate-500 font-bold">
                  Viewed {game.players[peekingPlayer].peekCount ?? 0} time{(game.players[peekingPlayer].peekCount ?? 0) !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 py-3">
                {getPlayerBalls(game.players[peekingPlayer]).map((ball) => (
                  <div key={ball} className="relative">
                    <KellyBall
                      number={ball}
                      isPocketed={game.ballsPocketed.includes(ball)}
                      isLowest={false}
                      isSecret={true}
                      size="lg"
                    />
                    {game.ballsPocketed.includes(ball) && (
                      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-red-400 font-bold whitespace-nowrap">GONE</span>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setPeekingPlayer(null)}
                className="mt-2 h-11 px-8 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm font-bold
                           border border-emerald-500/20 transition-all duration-150 cursor-pointer
                           hover:bg-emerald-500/30"
              >
                Hide
              </button>
            </div>
          </div>
        )}

        {/* Header bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-live-dot" />
              <h2 className="text-sm font-bold text-emerald-400/90 uppercase tracking-wider">Kelly Pool</h2>
            </div>
            <div className="flex items-center gap-2">
              {elapsed && (
                <span className="text-[11px] text-slate-500 font-bold bg-slate-800/70 px-2.5 py-1 rounded-full border border-slate-700/40">
                  ⏱ {elapsed}
                </span>
              )}
              <span className="text-[11px] text-slate-400 font-bold bg-slate-800/70 px-3 py-1 rounded-full border border-slate-700/40">
                {15 - game.ballsPocketed.length} LEFT
              </span>
              {/* Re-reveal button */}
              <button
                onClick={() => setShowRevealFlow(true)}
                className="text-[11px] text-amber-400/60 font-bold bg-slate-800/70 px-3 py-1 rounded-full border border-slate-700/40
                           hover:text-amber-400 transition-colors cursor-pointer"
                title="Pass phone around again"
              >
                📱
              </button>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-800/60 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPct}%`,
                background: progressPct > 75
                  ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                  : progressPct > 40
                    ? "linear-gradient(90deg, #22c55e, #f59e0b)"
                    : "linear-gradient(90deg, #3b82f6, #22c55e)",
              }}
            />
          </div>

          {/* Recently pocketed feed */}
          {game.ballsPocketed.length > 0 && (
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider shrink-0">Pocketed:</span>
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {game.ballsPocketed.slice(-8).map((num, i, arr) => (
                  <div key={`${num}-${i}`} className={`transition-all duration-300 ${i === arr.length - 1 ? "animate-scale-in" : "opacity-50"}`}>
                    <KellyBall number={num} isPocketed={false} isLowest={false} size="sm" />
                  </div>
                ))}
                {game.ballsPocketed.length > 8 && (
                  <span className="text-[9px] text-slate-600 font-bold ml-1">+{game.ballsPocketed.length - 8}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Ball Table — Triangle Rack */}
        <div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-3 px-1">Tap to pocket · Tap pocketed to undo</p>
          <div className="flex flex-col items-center gap-2">
            {RACK_ROWS.map((row, ridx) => (
              <div key={ridx} className="flex items-center justify-center gap-2">
                {row.map((num) => (
                  <KellyBall
                    key={num}
                    number={num}
                    isPocketed={game.ballsPocketed.includes(num)}
                    isLowest={false}
                    onClick={
                      game.ballsPocketed.includes(num)
                        ? () => handleUnpocket(num)
                        : () => handlePocket(num)
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Players list — bigger and more prominent */}
        <div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-3 px-1">
            Players — tap to peek at secret ball{effectiveBpp > 1 ? "s" : ""}
          </p>
          <div className="space-y-2">
            {[...game.players]
              .map((player, origIdx) => ({ player, origIdx }))
              .sort((a, b) => {
                if (a.player.isEliminated && !b.player.isEliminated) return 1;
                if (!a.player.isEliminated && b.player.isEliminated) return -1;
                return 0;
              })
              .map(({ player, origIdx }) => {
              const balls = getPlayerBalls(player);
              const remaining = balls.filter((b) => !game.ballsPocketed.includes(b)).length;
              return (
                <button
                  key={origIdx}
                  onClick={() => !player.isEliminated && handlePeek(origIdx)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3.5 rounded-2xl
                    ${player.isEliminated
                      ? "bg-slate-800/30 opacity-50 cursor-not-allowed"
                      : "stat-card cursor-pointer hover:bg-slate-700/30 active:scale-[0.98]"
                    }
                    transition-all duration-200
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 border border-white/10"
                      style={{
                        background: PLAYER_COLORS[origIdx % PLAYER_COLORS.length],
                        opacity: player.isEliminated ? 0.3 : 1,
                      }}
                    />
                    <span className={`text-base font-bold ${player.isEliminated ? "line-through text-slate-600" : "text-white"}`}>
                      {player.name}
                    </span>
                    {player.isEliminated && (
                      <span className="text-[10px] text-red-400/80 font-bold bg-red-400/10 px-2 py-0.5 rounded-full">ELIMINATED</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {!player.isEliminated && (
                      <>
                        <span className={`text-sm font-bold tabular-nums ${
                          remaining === 0 ? "text-red-400" : "text-amber-400/80"
                        }`}>
                          {remaining}/{balls.length} left
                        </span>
                        <span className="text-emerald-400/50 flex items-center gap-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.5"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                          </svg>
                          <span className="text-[10px] font-bold">{player.peekCount ?? 0}</span>
                        </span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
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
    </>
  );
}

function KellyGameHistory() {
  const history = useQuery(api.kelly.getHistory);

  if (!history) return null;

  if (history.length === 0) {
    return (
      <div className="glass rounded-3xl p-5 animate-slide-up-d1 text-center">
        <div className="py-6 space-y-2">
          <span className="text-3xl">🎱</span>
          <p className="text-sm text-slate-500 font-medium">No games played yet</p>
          <p className="text-[10px] text-slate-600">Start a game above to begin tracking!</p>
        </div>
      </div>
    );
  }

  // Win leaderboard
  const winCounts: Record<string, number> = {};
  history.forEach((g) => {
    if (g.winner) winCounts[g.winner] = (winCounts[g.winner] || 0) + 1;
  });
  const leaderboard = Object.entries(winCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-5 animate-slide-up-d1">
      {/* Win Leaderboard */}
      {leaderboard.length > 1 && (
        <div className="glass rounded-3xl p-5">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2.5">
            <span className="text-base">👑</span>
            Leaderboard
          </h2>
          <div className="space-y-1.5">
            {leaderboard.map(([name, wins], idx) => (
              <div key={name} className="flex items-center justify-between px-3 py-2 rounded-lg stat-card">
                <div className="flex items-center gap-2.5">
                  <span className={`text-sm font-black tabular-nums w-5 text-right ${
                    idx === 0 ? "text-amber-400" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-orange-700" : "text-slate-600"
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-sm font-bold text-white">{name}</span>
                </div>
                <span className={`text-sm font-extrabold tabular-nums ${idx === 0 ? "text-amber-400" : "text-slate-500"}`}>
                  {wins} win{wins !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Games */}
      <div className="glass rounded-3xl p-5">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-slate-500">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Past Games
          <span className="text-[10px] text-slate-600 font-medium ml-auto normal-case tracking-normal">{history.length} played</span>
        </h2>
        <ul className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          {history.map((g) => {
            const duration = g.startedAt && g.endedAt ? formatDuration(g.endedAt - g.startedAt) : null;
            const ago = g.endedAt ? timeAgo(g.endedAt) : g.startedAt ? timeAgo(g.startedAt) : null;
            return (
              <li
                key={g._id}
                className="stat-card rounded-xl border-l-[3px] border-l-amber-500/50 px-3.5 py-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm">🏆</span>
                    <span className="text-sm font-bold text-white">{g.winner}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                    {g.ballsPocketed && (
                      <span>{g.ballsPocketed.length} balls</span>
                    )}
                    <span>{g.players.length}p</span>
                    {g.ballsPerPlayer && g.ballsPerPlayer > 1 && (
                      <span>×{g.ballsPerPlayer}</span>
                    )}
                  </div>
                </div>
                {(duration || ago) && (
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-600">
                    {duration && <span>⏱ {duration}</span>}
                    {ago && <span className="ml-auto">{ago}</span>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default function KellyPoolPage() {
  const activeGame = useQuery(api.kelly.getActive);
  const createGame = useMutation(api.kelly.createGame);
  const [showNewSetup, setShowNewSetup] = useState(false);

  const handleStart = async (names: string[], ballsPerPlayer: number) => {
    playDeal();
    setShowNewSetup(false);
    try {
      await createGame({ playerNames: names, ballsPerPlayer });
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
                Ball Tracker
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-lg mx-auto px-3 sm:px-4 pt-5 pb-10 safe-bottom">
        <div className="space-y-5">
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
                  onClick={() => handleStart(activeGame.players.map((p) => p.name), activeGame.ballsPerPlayer ?? 1)}
                  className="h-14 rounded-2xl btn-accent text-sm font-extrabold
                             transition-all duration-150 cursor-pointer animate-glow-pulse"
                >
                  Play Again
                </button>
                <button
                  onClick={() => setShowNewSetup(true)}
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
