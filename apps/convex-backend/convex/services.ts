import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all services
export const list = query({
  handler: async (ctx) => {
    const services = await ctx.db.query("services").collect();
    
    // Enrich with snippet counts
    const enriched = await Promise.all(
      services.map(async (service) => {
        const snippets = await ctx.db
          .query("snippets")
          .withIndex("by_service", (q) => q.eq("serviceId", service._id))
          .collect();
        
        const verifiedCount = snippets.filter(s => s.verificationStatus === "passed").length;
        
        return {
          ...service,
          snippetCount: snippets.length,
          verifiedCount,
        };
      })
    );
    
    return enriched;
  },
});

// Get a service with all its snippets
export const get = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const service = await ctx.db
      .query("services")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (!service) return null;
    
    // Get all snippets for this service
    const snippets = await ctx.db
      .query("snippets")
      .withIndex("by_service", (q) => q.eq("serviceId", service._id))
      .collect();
    
    // Group by use case
    const useCaseMap = new Map<string, any[]>();
    
    for (const snippet of snippets) {
      const useCase = await ctx.db.get(snippet.useCaseId);
      if (!useCase) continue;
      
      if (!useCaseMap.has(useCase.slug)) {
        useCaseMap.set(useCase.slug, []);
      }
      
      useCaseMap.get(useCase.slug)!.push({
        ...snippet,
        useCase: { slug: useCase.slug, name: useCase.name },
      });
    }
    
    return {
      ...service,
      snippetsByUseCase: Object.fromEntries(useCaseMap),
    };
  },
});

// Create or update a service
export const upsert = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    website: v.optional(v.string()),
    docsUrl: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("services")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        website: args.website,
        docsUrl: args.docsUrl,
        logoUrl: args.logoUrl,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("services", args);
    }
  },
});
