import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all use cases
export const list = query({
  handler: async (ctx) => {
    const useCases = await ctx.db.query("useCases").collect();
    
    // Enrich with snippet counts
    const enriched = await Promise.all(
      useCases.map(async (useCase) => {
        const snippets = await ctx.db
          .query("snippets")
          .withIndex("by_useCase", (q) => q.eq("useCaseId", useCase._id))
          .collect();
        
        const verifiedCount = snippets.filter(s => s.verificationStatus === "passed").length;
        
        return {
          ...useCase,
          snippetCount: snippets.length,
          verifiedCount,
        };
      })
    );
    
    return enriched;
  },
});

// Get a use case with all its services
export const get = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const useCase = await ctx.db
      .query("useCases")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (!useCase) return null;
    
    // Get all snippets for this use case
    const snippets = await ctx.db
      .query("snippets")
      .withIndex("by_useCase", (q) => q.eq("useCaseId", useCase._id))
      .collect();
    
    // Group by service with benchmarks
    const serviceMap = new Map<string, {
      service: any;
      snippets: any[];
      avgLatency: number | null;
      avgCost: number | null;
      avgQuality: number | null;
    }>();
    
    for (const snippet of snippets) {
      const service = await ctx.db.get(snippet.serviceId);
      if (!service) continue;
      
      if (!serviceMap.has(service.slug)) {
        serviceMap.set(service.slug, {
          service,
          snippets: [],
          avgLatency: null,
          avgCost: null,
          avgQuality: null,
        });
      }
      
      serviceMap.get(service.slug)!.snippets.push(snippet);
    }
    
    // Calculate averages for verified snippets
    const services = Array.from(serviceMap.values()).map(({ service, snippets }) => {
      const verified = snippets.filter(s => s.verificationStatus === "passed");
      const latencies = verified.map(s => s.benchmarkLatencyMs).filter(Boolean) as number[];
      const costs = verified.map(s => s.benchmarkCostUsd).filter(Boolean) as number[];
      const qualities = verified.map(s => s.benchmarkQualityScore).filter(Boolean) as number[];
      
      return {
        slug: service.slug,
        name: service.name,
        website: service.website,
        docsUrl: service.docsUrl,
        snippetCount: snippets.length,
        verifiedCount: verified.length,
        avgLatencyMs: latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : null,
        avgCostUsd: costs.length ? costs.reduce((a, b) => a + b, 0) / costs.length : null,
        avgQualityScore: qualities.length ? qualities.reduce((a, b) => a + b, 0) / qualities.length : null,
      };
    });
    
    // Sort by quality score descending
    services.sort((a, b) => (b.avgQualityScore || 0) - (a.avgQualityScore || 0));
    
    return {
      ...useCase,
      services,
    };
  },
});

// Create or update a use case
export const upsert = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("useCases")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        description: args.description,
        icon: args.icon,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("useCases", args);
    }
  },
});
