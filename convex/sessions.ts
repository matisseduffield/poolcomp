import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get the currently active session (or null)
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
  },
});

// Aggregate completed sessions into session-level scores
export const getScores = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    let matisseSessions = 0;
    let joeSessions = 0;

    for (const s of sessions) {
      if (s.winner === "matisse") matisseSessions++;
      else if (s.winner === "joe") joeSessions++;
    }

    return { matisseSessions, joeSessions };
  },
});

// Aggregate all games ever played into lifetime totals
export const getLifetimeGames = query({
  args: {},
  handler: async (ctx) => {
    const games = await ctx.db.query("games").collect();

    let matisseGames = 0;
    let joeGames = 0;

    for (const g of games) {
      if (g.winner === "matisse") matisseGames++;
      else if (g.winner === "joe") joeGames++;
    }

    return { matisseGames, joeGames };
  },
});

// Get all completed sessions ordered newest-first
export const getMatchHistory = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("status"), "completed"))
      .order("desc")
      .collect();
  },
});

// Start a new session (fails if one is already active)
export const create = mutation({
  args: {},
  handler: async (ctx) => {
    const active = await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (active) throw new Error("A session is already active");

    return await ctx.db.insert("sessions", {
      matisseWins: 0,
      joeWins: 0,
      status: "active",
    });
  },
});

// End the active session early and determine the winner
export const endEarly = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session || session.status !== "active") {
      throw new Error("No active session to end");
    }

    let winner: "matisse" | "joe" | "tie";
    if (session.matisseWins > session.joeWins) winner = "matisse";
    else if (session.joeWins > session.matisseWins) winner = "joe";
    else winner = "tie";

    await ctx.db.patch(sessionId, {
      status: "completed",
      winner,
    });
  },
});
