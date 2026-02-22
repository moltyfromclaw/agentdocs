import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Use cases (e.g., "transcription", "email-sending")
  useCases: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
  }).index("by_slug", ["slug"]),

  // Services (e.g., "deepgram", "openai-whisper")
  services: defineTable({
    slug: v.string(),
    name: v.string(),
    website: v.optional(v.string()),
    docsUrl: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
  }).index("by_slug", ["slug"]),

  // Snippets (the actual code)
  snippets: defineTable({
    useCaseId: v.id("useCases"),
    serviceId: v.id("services"),
    language: v.string(), // typescript, python, etc.
    title: v.string(),
    description: v.optional(v.string()),
    code: v.string(),
    dependencies: v.optional(v.array(v.string())), // ["@deepgram/sdk@3.0.0"]
    envVars: v.optional(v.array(v.string())), // ["DEEPGRAM_API_KEY"]

    // Verification status
    verifiedAt: v.optional(v.number()),
    verificationStatus: v.union(
      v.literal("pending"),
      v.literal("passed"),
      v.literal("failed")
    ),
    verificationError: v.optional(v.string()),

    // Benchmarks (nullable until verified)
    benchmarkLatencyMs: v.optional(v.number()),
    benchmarkCostUsd: v.optional(v.number()),
    benchmarkQualityScore: v.optional(v.number()), // 0-100

    // Metadata
    version: v.optional(v.string()),
    sourceUrl: v.optional(v.string()), // Original docs URL
  })
    .index("by_useCase", ["useCaseId"])
    .index("by_service", ["serviceId"])
    .index("by_language", ["language"])
    .index("by_verification", ["verificationStatus"])
    .index("by_useCase_service", ["useCaseId", "serviceId"]),

  // Verification runs (audit log)
  verificationRuns: defineTable({
    snippetId: v.id("snippets"),
    status: v.union(
      v.literal("running"),
      v.literal("passed"),
      v.literal("failed")
    ),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    runnerId: v.optional(v.string()),
    stdout: v.optional(v.string()),
    stderr: v.optional(v.string()),
    exitCode: v.optional(v.number()),
  }).index("by_snippet", ["snippetId"]),

  // x402 payment log
  payments: defineTable({
    snippetId: v.optional(v.id("snippets")),
    amountUsd: v.number(),
    txHash: v.optional(v.string()),
    payerAddress: v.optional(v.string()),
    endpoint: v.string(), // which endpoint was paid for
  }),

  // API usage tracking
  apiUsage: defineTable({
    apiKey: v.optional(v.string()),
    payerAddress: v.optional(v.string()),
    endpoint: v.string(),
    timestamp: v.number(),
  }).index("by_apiKey", ["apiKey"]),
});
