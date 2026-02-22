import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all snippets for a use case
export const byUseCase = query({
  args: { useCaseSlug: v.string(), language: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const useCase = await ctx.db
      .query("useCases")
      .withIndex("by_slug", (q) => q.eq("slug", args.useCaseSlug))
      .first();

    if (!useCase) return [];

    let snippetsQuery = ctx.db
      .query("snippets")
      .withIndex("by_useCase", (q) => q.eq("useCaseId", useCase._id));

    const snippets = await snippetsQuery.collect();

    // Filter by language if specified
    const filtered = args.language
      ? snippets.filter((s) => s.language === args.language)
      : snippets;

    // Enrich with service info
    const enriched = await Promise.all(
      filtered.map(async (snippet) => {
        const service = await ctx.db.get(snippet.serviceId);
        return {
          ...snippet,
          service: service ? { slug: service.slug, name: service.name } : null,
          useCase: { slug: useCase.slug, name: useCase.name },
        };
      })
    );

    return enriched;
  },
});

// Get a single snippet by ID
export const get = query({
  args: { id: v.id("snippets") },
  handler: async (ctx, args) => {
    const snippet = await ctx.db.get(args.id);
    if (!snippet) return null;

    const service = await ctx.db.get(snippet.serviceId);
    const useCase = await ctx.db.get(snippet.useCaseId);

    return {
      ...snippet,
      service: service ? { slug: service.slug, name: service.name } : null,
      useCase: useCase ? { slug: useCase.slug, name: useCase.name } : null,
    };
  },
});

// Get verified snippet with benchmarks (premium endpoint)
export const getVerified = query({
  args: { id: v.id("snippets") },
  handler: async (ctx, args) => {
    const snippet = await ctx.db.get(args.id);
    if (!snippet) return null;

    // Only return if verified
    if (snippet.verificationStatus !== "passed") {
      return { error: "Snippet not verified", status: snippet.verificationStatus };
    }

    const service = await ctx.db.get(snippet.serviceId);
    const useCase = await ctx.db.get(snippet.useCaseId);

    return {
      id: snippet._id,
      code: snippet.code,
      language: snippet.language,
      title: snippet.title,
      description: snippet.description,
      dependencies: snippet.dependencies,
      envVars: snippet.envVars,
      benchmarks: {
        latencyMs: snippet.benchmarkLatencyMs,
        costUsd: snippet.benchmarkCostUsd,
        qualityScore: snippet.benchmarkQualityScore,
      },
      verifiedAt: snippet.verifiedAt,
      service: service ? { slug: service.slug, name: service.name } : null,
      useCase: useCase ? { slug: useCase.slug, name: useCase.name } : null,
    };
  },
});

// Create a new snippet
export const create = mutation({
  args: {
    useCaseSlug: v.string(),
    serviceSlug: v.string(),
    language: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    code: v.string(),
    dependencies: v.optional(v.array(v.string())),
    envVars: v.optional(v.array(v.string())),
    sourceUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get or create use case
    let useCase = await ctx.db
      .query("useCases")
      .withIndex("by_slug", (q) => q.eq("slug", args.useCaseSlug))
      .first();

    if (!useCase) {
      const useCaseId = await ctx.db.insert("useCases", {
        slug: args.useCaseSlug,
        name: args.useCaseSlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      });
      useCase = await ctx.db.get(useCaseId);
    }

    // Get or create service
    let service = await ctx.db
      .query("services")
      .withIndex("by_slug", (q) => q.eq("slug", args.serviceSlug))
      .first();

    if (!service) {
      const serviceId = await ctx.db.insert("services", {
        slug: args.serviceSlug,
        name: args.serviceSlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      });
      service = await ctx.db.get(serviceId);
    }

    // Create snippet
    const snippetId = await ctx.db.insert("snippets", {
      useCaseId: useCase!._id,
      serviceId: service!._id,
      language: args.language,
      title: args.title,
      description: args.description,
      code: args.code,
      dependencies: args.dependencies,
      envVars: args.envVars,
      sourceUrl: args.sourceUrl,
      verificationStatus: "pending",
      version: "1.0.0",
    });

    return snippetId;
  },
});

// Update verification status
export const updateVerification = mutation({
  args: {
    id: v.id("snippets"),
    status: v.union(v.literal("pending"), v.literal("passed"), v.literal("failed")),
    error: v.optional(v.string()),
    latencyMs: v.optional(v.number()),
    costUsd: v.optional(v.number()),
    qualityScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      verificationStatus: args.status,
      verificationError: args.error,
      verifiedAt: args.status === "passed" ? Date.now() : undefined,
      benchmarkLatencyMs: args.latencyMs,
      benchmarkCostUsd: args.costUsd,
      benchmarkQualityScore: args.qualityScore,
    });
  },
});

// List all snippets (for admin)
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const snippets = await ctx.db
      .query("snippets")
      .order("desc")
      .take(args.limit || 50);

    return Promise.all(
      snippets.map(async (snippet) => {
        const service = await ctx.db.get(snippet.serviceId);
        const useCase = await ctx.db.get(snippet.useCaseId);
        return {
          ...snippet,
          service: service?.slug,
          useCase: useCase?.slug,
        };
      })
    );
  },
});
