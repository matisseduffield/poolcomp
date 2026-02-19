import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Joe vs Matisse (best-of-5) ──────────────────
  sessions: defineTable({
    matisseWins: v.number(),
    joeWins: v.number(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("cancelled")),
    winner: v.optional(
      v.union(v.literal("matisse"), v.literal("joe"), v.literal("tie"))
    ),
  }),
  games: defineTable({
    sessionId: v.id("sessions"),
    winner: v.union(v.literal("matisse"), v.literal("joe")),
    gameNumber: v.number(),
  }).index("by_session", ["sessionId"]),

  // ── Kelly Pool ──────────────────────────────────
  kellyGames: defineTable({
    status: v.union(v.literal("setup"), v.literal("active"), v.literal("finished"), v.literal("cancelled")),
    players: v.array(v.object({
      name: v.string(),
      secretBall: v.number(),       // 1-15, assigned randomly
      isEliminated: v.boolean(),
      order: v.number(),            // turn order (0-based)
    })),
    currentTurnIndex: v.number(),   // index into players array
    ballsPocketed: v.array(v.number()), // ball numbers that have been pocketed
    lowestBallOnTable: v.number(),  // the current lowest numbered ball
    winner: v.optional(v.string()), // winner's name
    totalBalls: v.number(),         // usually 15
  }),
  kellyHistory: defineTable({
    kellyGameId: v.id("kellyGames"),
    action: v.string(),             // "pocketed", "foul", "turn_passed"
    ballNumber: v.optional(v.number()),
    playerName: v.string(),
    timestamp: v.number(),
  }).index("by_game", ["kellyGameId"]),
});
