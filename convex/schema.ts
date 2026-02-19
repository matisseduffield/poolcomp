import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    matisseWins: v.number(),
    joeWins: v.number(),
    status: v.union(v.literal("active"), v.literal("completed")),
    winner: v.optional(
      v.union(v.literal("matisse"), v.literal("joe"), v.literal("tie"))
    ),
  }),
  games: defineTable({
    sessionId: v.id("sessions"),
    winner: v.union(v.literal("matisse"), v.literal("joe")),
    gameNumber: v.number(),
  }).index("by_session", ["sessionId"]),
});
