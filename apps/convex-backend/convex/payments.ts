import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Log a payment
export const log = mutation({
  args: {
    snippetId: v.optional(v.id("snippets")),
    amountUsd: v.number(),
    txHash: v.optional(v.string()),
    payerAddress: v.optional(v.string()),
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("payments", args);
  },
});

// Get payment stats
export const stats = query({
  handler: async (ctx) => {
    const payments = await ctx.db.query("payments").collect();
    
    const totalRevenue = payments.reduce((sum, p) => sum + p.amountUsd, 0);
    const totalPayments = payments.length;
    
    // Group by endpoint
    const byEndpoint = payments.reduce((acc, p) => {
      acc[p.endpoint] = (acc[p.endpoint] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Last 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentPayments = payments.filter(p => p._creationTime > oneDayAgo);
    const last24hRevenue = recentPayments.reduce((sum, p) => sum + p.amountUsd, 0);
    
    return {
      totalRevenue,
      totalPayments,
      last24hRevenue,
      last24hPayments: recentPayments.length,
      byEndpoint,
    };
  },
});

// Log API usage (for rate limiting / analytics)
export const logUsage = mutation({
  args: {
    apiKey: v.optional(v.string()),
    payerAddress: v.optional(v.string()),
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("apiUsage", {
      ...args,
      timestamp: Date.now(),
    });
  },
});
