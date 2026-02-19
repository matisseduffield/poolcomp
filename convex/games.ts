import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all games for a specific session
export const getBySession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db
      .query("games")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .collect();
  },
});

// Record a single game win in the active session
export const recordWin = mutation({
  args: {
    sessionId: v.id("sessions"),
    winner: v.union(v.literal("matisse"), v.literal("joe")),
  },
  handler: async (ctx, { sessionId, winner }) => {
    const session = await ctx.db.get(sessionId);
    if (!session || session.status !== "active") {
      throw new Error("No active session");
    }

    const totalGames = session.matisseWins + session.joeWins;
    if (totalGames >= 5) {
      throw new Error("Session already has 5 games");
    }

    // Insert game record
    const gameNumber = totalGames + 1;
    await ctx.db.insert("games", {
      sessionId,
      winner,
      gameNumber,
    });

    // Update session tallies
    const newMatisseWins =
      session.matisseWins + (winner === "matisse" ? 1 : 0);
    const newJoeWins = session.joeWins + (winner === "joe" ? 1 : 0);

    // Session ends when someone hits 3 wins or all 5 games are played
    const isComplete =
      newMatisseWins >= 3 ||
      newJoeWins >= 3 ||
      newMatisseWins + newJoeWins >= 5;

    if (isComplete) {
      let sessionWinner: "matisse" | "joe" | "tie";
      if (newMatisseWins > newJoeWins) sessionWinner = "matisse";
      else if (newJoeWins > newMatisseWins) sessionWinner = "joe";
      else sessionWinner = "tie";

      await ctx.db.patch(sessionId, {
        matisseWins: newMatisseWins,
        joeWins: newJoeWins,
        status: "completed",
        winner: sessionWinner,
      });
    } else {
      await ctx.db.patch(sessionId, {
        matisseWins: newMatisseWins,
        joeWins: newJoeWins,
      });
    }

    return { gameNumber, isComplete };
  },
});

// Undo the last game in the active session
export const undoLast = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session || session.status !== "active") {
      throw new Error("No active session");
    }

    const games = await ctx.db
      .query("games")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .collect();

    if (games.length === 0) {
      throw new Error("No games to undo");
    }

    // Find the last game (highest gameNumber)
    const lastGame = games.reduce((a, b) =>
      a.gameNumber > b.gameNumber ? a : b
    );

    // Remove the game
    await ctx.db.delete(lastGame._id);

    // Update session tallies
    const newMatisseWins =
      session.matisseWins - (lastGame.winner === "matisse" ? 1 : 0);
    const newJoeWins =
      session.joeWins - (lastGame.winner === "joe" ? 1 : 0);

    await ctx.db.patch(sessionId, {
      matisseWins: newMatisseWins,
      joeWins: newJoeWins,
    });

    return { undoneWinner: lastGame.winner, gameNumber: lastGame.gameNumber };
  },
});
