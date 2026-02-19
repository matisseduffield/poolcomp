import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper: normalize legacy secretBall (single) to secretBalls (array)
function getPlayerBalls(p: { secretBalls?: number[]; secretBall?: number }): number[] {
  return p.secretBalls ?? (p.secretBall != null ? [p.secretBall] : []);
}

// ── Queries ─────────────────────────────────────────

// Get the currently active kelly game
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const setupGame = await ctx.db
      .query("kellyGames")
      .filter((q) => q.eq(q.field("status"), "setup"))
      .first();
    if (setupGame) return setupGame;

    const activeGame = await ctx.db
      .query("kellyGames")
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
    if (activeGame) return activeGame;

    // Also return the most recently finished game so we can show the result
    const finishedGame = await ctx.db
      .query("kellyGames")
      .filter((q) => q.eq(q.field("status"), "finished"))
      .order("desc")
      .first();
    return finishedGame;
  },
});

// Get action log for a kelly game
export const getGameLog = query({
  args: { gameId: v.id("kellyGames") },
  handler: async (ctx, { gameId }) => {
    return await ctx.db
      .query("kellyHistory")
      .withIndex("by_game", (q) => q.eq("kellyGameId", gameId))
      .collect();
  },
});

// Get history of finished kelly games
export const getHistory = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("kellyGames")
      .filter((q) => q.eq(q.field("status"), "finished"))
      .order("desc")
      .collect();
  },
});

// ── Mutations ───────────────────────────────────────

// Create a new kelly game
export const createGame = mutation({
  args: {
    playerNames: v.array(v.string()),
    ballsPerPlayer: v.optional(v.number()),
  },
  handler: async (ctx, { playerNames, ballsPerPlayer: bpp }) => {
    const ballsPerPlayer = bpp ?? 1;
    if (playerNames.length < 2) {
      throw new Error("Need at least 2 players");
    }
    if (playerNames.length > 15) {
      throw new Error("Maximum 15 players");
    }
    const totalNeeded = playerNames.length * ballsPerPlayer;
    if (totalNeeded > 15) {
      throw new Error(`Not enough balls: ${playerNames.length} players × ${ballsPerPlayer} balls = ${totalNeeded}, but only 15 available`);
    }

    // Check no active game exists
    const existing = await ctx.db
      .query("kellyGames")
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "setup"),
          q.eq(q.field("status"), "active")
        )
      )
      .first();
    if (existing) {
      throw new Error("A kelly game is already in progress");
    }

    // Randomly assign secret balls (1-15) to players
    const availableBalls = Array.from({ length: 15 }, (_, i) => i + 1);
    for (let i = availableBalls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableBalls[i], availableBalls[j]] = [availableBalls[j], availableBalls[i]];
    }

    // Shuffle player order
    const shuffledIndices = Array.from({ length: playerNames.length }, (_, i) => i);
    for (let i = shuffledIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
    }

    const players = playerNames.map((name, idx) => ({
      name,
      secretBalls: availableBalls.slice(idx * ballsPerPlayer, (idx + 1) * ballsPerPlayer),
      isEliminated: false,
      order: shuffledIndices[idx],
      peekCount: 0,
    }));

    players.sort((a, b) => a.order - b.order);

    return await ctx.db.insert("kellyGames", {
      status: "active",
      players,
      ballsPerPlayer,
      currentTurnIndex: 0,
      ballsPocketed: [],
      lowestBallOnTable: 1,
      totalBalls: 15,
      startedAt: Date.now(),
    });
  },
});

// Record a ball being pocketed
export const pocketBall = mutation({
  args: {
    gameId: v.id("kellyGames"),
    ballNumber: v.number(),
  },
  handler: async (ctx, { gameId, ballNumber }) => {
    const game = await ctx.db.get(gameId);
    if (!game || game.status !== "active") {
      throw new Error("No active kelly game");
    }
    if (ballNumber < 1 || ballNumber > 15) {
      throw new Error("Invalid ball number");
    }
    if (game.ballsPocketed.includes(ballNumber)) {
      throw new Error("Ball already pocketed");
    }

    const newPocketed = [...game.ballsPocketed, ballNumber];

    // Log the action
    await ctx.db.insert("kellyHistory", {
      kellyGameId: gameId,
      action: "pocketed",
      ballNumber,
      playerName: "game",
      timestamp: Date.now(),
    });

    // Check if this was someone's secret ball
    const ballOwner = game.players.find(
      (p) => getPlayerBalls(p).includes(ballNumber) && !p.isEliminated
    );

    let updatedPlayers = [...game.players];
    let winner: string | undefined;
    let eliminated: string | undefined;
    const ownerName: string | null = ballOwner ? ballOwner.name : null;

    if (ballOwner) {
      // Check if ALL of that player's secret balls are now pocketed
      const ownerRemainingBalls = getPlayerBalls(ballOwner).filter(
        (b) => !newPocketed.includes(b)
      );
      if (ownerRemainingBalls.length === 0) {
        // All their balls gone — eliminated
        updatedPlayers = updatedPlayers.map((p) =>
          p.name === ballOwner.name ? { ...p, isEliminated: true } : p
        );
        eliminated = ballOwner.name;
      }
    }

    // Check if only one non-eliminated player remains
    const activePlayers = updatedPlayers.filter((p) => !p.isEliminated);
    if (!winner && activePlayers.length === 1) {
      winner = activePlayers[0].name;
    }

    if (winner) {
      await ctx.db.patch(gameId, {
        status: "finished",
        players: updatedPlayers,
        ballsPocketed: newPocketed,
        winner,
        endedAt: Date.now(),
      });
      return { winner, eliminated, ballNumber, ownerName };
    }

    await ctx.db.patch(gameId, {
      players: updatedPlayers,
      ballsPocketed: newPocketed,
    });

    return { winner: null, eliminated, ballNumber, ownerName };
  },
});

// Un-pocket a ball (put it back on the table)
export const unpocketBall = mutation({
  args: {
    gameId: v.id("kellyGames"),
    ballNumber: v.number(),
  },
  handler: async (ctx, { gameId, ballNumber }) => {
    const game = await ctx.db.get(gameId);
    if (!game || game.status !== "active") {
      throw new Error("No active kelly game");
    }
    if (!game.ballsPocketed.includes(ballNumber)) {
      throw new Error("Ball is not pocketed");
    }

    const newPocketed = game.ballsPocketed.filter((b) => b !== ballNumber);

    // Check if any eliminated player should be un-eliminated
    // (if the ball being restored is one of their secret balls)
    let updatedPlayers = [...game.players];
    const affectedPlayer = updatedPlayers.find(
      (p) => getPlayerBalls(p).includes(ballNumber) && p.isEliminated
    );
    if (affectedPlayer) {
      // Restore them — they now have at least one ball back on the table
      updatedPlayers = updatedPlayers.map((p) =>
        p.name === affectedPlayer.name ? { ...p, isEliminated: false } : p
      );
    }

    await ctx.db.insert("kellyHistory", {
      kellyGameId: gameId,
      action: "unpocketed",
      ballNumber,
      playerName: "game",
      timestamp: Date.now(),
    });

    await ctx.db.patch(gameId, {
      players: updatedPlayers,
      ballsPocketed: newPocketed,
    });
  },
});

// Record a peek at someone's balls (increment peekCount)
export const recordPeek = mutation({
  args: {
    gameId: v.id("kellyGames"),
    playerIndex: v.number(),
  },
  handler: async (ctx, { gameId, playerIndex }) => {
    const game = await ctx.db.get(gameId);
    if (!game || game.status !== "active") {
      throw new Error("No active kelly game");
    }
    if (playerIndex < 0 || playerIndex >= game.players.length) {
      throw new Error("Invalid player index");
    }

    const updatedPlayers = [...game.players];
    const current = updatedPlayers[playerIndex];
    updatedPlayers[playerIndex] = {
      ...current,
      peekCount: (current.peekCount ?? 0) + 1,
    };

    await ctx.db.patch(gameId, { players: updatedPlayers });
  },
});

// Cancel the active kelly game
export const cancelGame = mutation({
  args: { gameId: v.id("kellyGames") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game || (game.status !== "active" && game.status !== "setup")) {
      throw new Error("No active kelly game to cancel");
    }

    // Delete all history for this game
    const logs = await ctx.db
      .query("kellyHistory")
      .withIndex("by_game", (q) => q.eq("kellyGameId", gameId))
      .collect();
    for (const log of logs) {
      await ctx.db.delete(log._id);
    }

    await ctx.db.patch(gameId, {
      status: "cancelled" as const,
    });
  },
});
