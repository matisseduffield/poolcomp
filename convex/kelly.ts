import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ─────────────────────────────────────────

// Get the currently active kelly game
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    // Check for "setup" or "active" games first
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

// Create a new kelly game in setup mode
export const createGame = mutation({
  args: {
    playerNames: v.array(v.string()),
  },
  handler: async (ctx, { playerNames }) => {
    if (playerNames.length < 2) {
      throw new Error("Need at least 2 players");
    }
    if (playerNames.length > 15) {
      throw new Error("Maximum 15 players");
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
    // Fisher-Yates shuffle
    for (let i = availableBalls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableBalls[i], availableBalls[j]] = [availableBalls[j], availableBalls[i]];
    }

    // Shuffle player order too
    const shuffledIndices = Array.from({ length: playerNames.length }, (_, i) => i);
    for (let i = shuffledIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
    }

    const players = playerNames.map((name, idx) => ({
      name,
      secretBall: availableBalls[idx],
      isEliminated: false,
      order: shuffledIndices[idx],
    }));

    // Sort by order for turn tracking
    players.sort((a, b) => a.order - b.order);

    return await ctx.db.insert("kellyGames", {
      status: "active",
      players,
      currentTurnIndex: 0,
      ballsPocketed: [],
      lowestBallOnTable: 1,
      totalBalls: 15,
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

    const currentPlayer = game.players[game.currentTurnIndex];
    const newPocketed = [...game.ballsPocketed, ballNumber];

    // Log the action
    await ctx.db.insert("kellyHistory", {
      kellyGameId: gameId,
      action: "pocketed",
      ballNumber,
      playerName: currentPlayer.name,
      timestamp: Date.now(),
    });

    // Check if this was someone's secret ball
    const eliminatedPlayer = game.players.find(
      (p) => p.secretBall === ballNumber && !p.isEliminated
    );

    let updatedPlayers = [...game.players];
    let winner: string | undefined;

    if (eliminatedPlayer) {
      if (eliminatedPlayer.name === currentPlayer.name) {
        // Player pocketed their OWN secret ball — they win!
        winner = currentPlayer.name;
      } else {
        // Someone else's secret ball was pocketed — they're eliminated
        updatedPlayers = updatedPlayers.map((p) =>
          p.name === eliminatedPlayer.name ? { ...p, isEliminated: true } : p
        );
      }
    }

    // Compute new lowest ball on table
    const allBallNumbers = Array.from({ length: 15 }, (_, i) => i + 1);
    const remainingBalls = allBallNumbers.filter((b) => !newPocketed.includes(b));
    const newLowest = remainingBalls.length > 0 ? Math.min(...remainingBalls) : 15;

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
        lowestBallOnTable: newLowest,
        winner,
      });
      return { winner, eliminated: eliminatedPlayer?.name, ballNumber };
    }

    // Advance to next non-eliminated player (current player keeps shooting since they pocketed)
    // In rotation pool, pocketing any ball legally means you continue
    await ctx.db.patch(gameId, {
      players: updatedPlayers,
      ballsPocketed: newPocketed,
      lowestBallOnTable: newLowest,
    });

    return { winner: null, eliminated: eliminatedPlayer?.name, ballNumber };
  },
});

// Pass turn (miss or foul — no ball pocketed)
export const passTurn = mutation({
  args: {
    gameId: v.id("kellyGames"),
  },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game || game.status !== "active") {
      throw new Error("No active kelly game");
    }

    const currentPlayer = game.players[game.currentTurnIndex];

    // Log the action
    await ctx.db.insert("kellyHistory", {
      kellyGameId: gameId,
      action: "turn_passed",
      playerName: currentPlayer.name,
      timestamp: Date.now(),
    });

    // Advance to next non-eliminated player
    let nextIndex = game.currentTurnIndex;
    do {
      nextIndex = (nextIndex + 1) % game.players.length;
    } while (game.players[nextIndex].isEliminated && nextIndex !== game.currentTurnIndex);

    await ctx.db.patch(gameId, {
      currentTurnIndex: nextIndex,
    });
  },
});

// Advance turn explicitly (after pocketing, if desired)
export const advanceTurn = mutation({
  args: {
    gameId: v.id("kellyGames"),
  },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game || game.status !== "active") {
      throw new Error("No active kelly game");
    }

    let nextIndex = game.currentTurnIndex;
    do {
      nextIndex = (nextIndex + 1) % game.players.length;
    } while (game.players[nextIndex].isEliminated && nextIndex !== game.currentTurnIndex);

    await ctx.db.patch(gameId, {
      currentTurnIndex: nextIndex,
    });
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
