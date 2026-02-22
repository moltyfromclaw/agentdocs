import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { X402PaymentRequired } from './middleware/x402';

type Bindings = {
  ENVIRONMENT: string;
  CONVEX_URL: string;
  X402_PAYMENT_ADDRESS: string;
  ADMIN_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Payment'],
}));

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'AgentDocs API',
    version: '0.1.0',
    status: 'ok',
    docs: 'https://agentdocs.dev/docs',
  });
});

// Helper to call Convex
async function convexQuery(url: string, functionPath: string, args: any = {}) {
  const res = await fetch(`${url}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: functionPath,
      args,
      format: 'json',
    }),
  });
  const data = await res.json();
  if (data.status === 'error') {
    throw new Error(data.errorMessage || 'Convex query failed');
  }
  return data.value;
}

async function convexMutation(url: string, functionPath: string, args: any = {}) {
  const res = await fetch(`${url}/api/mutation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: functionPath,
      args,
      format: 'json',
    }),
  });
  const data = await res.json();
  if (data.status === 'error') {
    throw new Error(data.errorMessage || 'Convex mutation failed');
  }
  return data.value;
}

// ============ PUBLIC ROUTES ============

// List all use cases
app.get('/usecases', async (c) => {
  const useCases = await convexQuery(c.env.CONVEX_URL, 'useCases:list');
  return c.json(useCases);
});

// Get use case with services comparison
app.get('/usecase/:slug', async (c) => {
  const slug = c.req.param('slug');
  const useCase = await convexQuery(c.env.CONVEX_URL, 'useCases:get', { slug });
  
  if (!useCase) {
    return c.json({ error: 'Use case not found' }, 404);
  }
  
  return c.json(useCase);
});

// List all services
app.get('/services', async (c) => {
  const services = await convexQuery(c.env.CONVEX_URL, 'services:list');
  return c.json(services);
});

// Get service details
app.get('/service/:slug', async (c) => {
  const slug = c.req.param('slug');
  const service = await convexQuery(c.env.CONVEX_URL, 'services:get', { slug });
  
  if (!service) {
    return c.json({ error: 'Service not found' }, 404);
  }
  
  return c.json(service);
});

// Search snippets (basic - returns IDs and titles)
app.get('/search', async (c) => {
  const query = c.req.query('q');
  const language = c.req.query('lang');
  const useCaseSlug = c.req.query('usecase');
  
  if (!useCaseSlug) {
    return c.json({ error: 'usecase query param required' }, 400);
  }
  
  const snippets = await convexQuery(c.env.CONVEX_URL, 'snippets:byUseCase', {
    useCaseSlug,
    language: language || undefined,
  });
  
  // Basic text search filter
  let filtered = snippets;
  if (query) {
    const q = query.toLowerCase();
    filtered = snippets.filter((s: any) =>
      s.title.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.service?.name.toLowerCase().includes(q)
    );
  }
  
  // Return summary (not full code - that's premium)
  return c.json(filtered.map((s: any) => ({
    id: s._id,
    title: s.title,
    description: s.description,
    service: s.service?.slug,
    language: s.language,
    verified: s.verificationStatus === 'passed',
    verifiedAt: s.verifiedAt,
  })));
});

// Get basic snippet info (no code)
app.get('/snippet/:id', async (c) => {
  const id = c.req.param('id');
  
  const snippet = await convexQuery(c.env.CONVEX_URL, 'snippets:get', { id });
  
  if (!snippet) {
    return c.json({ error: 'Snippet not found' }, 404);
  }
  
  // Return metadata only (code is premium)
  return c.json({
    id: snippet._id,
    title: snippet.title,
    description: snippet.description,
    service: snippet.service,
    useCase: snippet.useCase,
    language: snippet.language,
    dependencies: snippet.dependencies,
    envVars: snippet.envVars,
    verified: snippet.verificationStatus === 'passed',
    verifiedAt: snippet.verifiedAt,
    // Tease the benchmarks
    hasBenchmarks: !!(snippet.benchmarkLatencyMs || snippet.benchmarkCostUsd),
  });
});

// ============ PREMIUM ROUTES (x402) ============

// Get verified snippet with full code and benchmarks
app.get('/verified/snippet/:id', async (c) => {
  const id = c.req.param('id');
  
  // Check for x402 payment
  const paymentHeader = c.req.header('X-Payment');
  
  if (!paymentHeader) {
    return X402PaymentRequired(c, {
      amount: '0.05',
      description: 'Verified code snippet with benchmarks',
      resource: `/verified/snippet/${id}`,
    });
  }
  
  // TODO: Verify payment on-chain
  // For now, accept any payment header
  
  const snippet = await convexQuery(c.env.CONVEX_URL, 'snippets:getVerified', { id });
  
  if (!snippet) {
    return c.json({ error: 'Snippet not found' }, 404);
  }
  
  if ('error' in snippet) {
    return c.json(snippet, 400);
  }
  
  // Log payment
  await convexMutation(c.env.CONVEX_URL, 'payments:log', {
    snippetId: id,
    amountUsd: 0.05,
    txHash: paymentHeader,
    endpoint: `/verified/snippet/${id}`,
  });
  
  return c.json(snippet);
});

// Get use case benchmarks comparison
app.get('/verified/benchmark/:usecase', async (c) => {
  const useCaseSlug = c.req.param('usecase');
  
  // Check for x402 payment
  const paymentHeader = c.req.header('X-Payment');
  
  if (!paymentHeader) {
    return X402PaymentRequired(c, {
      amount: '0.10',
      description: `Full benchmark comparison for ${useCaseSlug}`,
      resource: `/verified/benchmark/${useCaseSlug}`,
    });
  }
  
  const useCase = await convexQuery(c.env.CONVEX_URL, 'useCases:get', { slug: useCaseSlug });
  
  if (!useCase) {
    return c.json({ error: 'Use case not found' }, 404);
  }
  
  // Log payment
  await convexMutation(c.env.CONVEX_URL, 'payments:log', {
    amountUsd: 0.10,
    txHash: paymentHeader,
    endpoint: `/verified/benchmark/${useCaseSlug}`,
  });
  
  // Return full benchmark data
  return c.json({
    useCase: {
      slug: useCase.slug,
      name: useCase.name,
      description: useCase.description,
    },
    services: useCase.services.map((s: any) => ({
      ...s,
      recommendation: getRecommendation(s),
    })),
    lastUpdated: new Date().toISOString(),
  });
});

function getRecommendation(service: any) {
  if (!service.avgQualityScore) return null;
  if (service.avgQualityScore >= 90 && service.avgCostUsd && service.avgCostUsd < 0.01) {
    return 'best-value';
  }
  if (service.avgQualityScore >= 95) {
    return 'highest-quality';
  }
  if (service.avgLatencyMs && service.avgLatencyMs < 100) {
    return 'fastest';
  }
  return null;
}

// ============ ADMIN ROUTES ============

// Simple API key auth middleware
const adminAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  const apiKey = authHeader?.replace('Bearer ', '');
  
  if (!apiKey || apiKey !== c.env.ADMIN_API_KEY) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  await next();
};

// Create snippet
app.post('/admin/snippet', adminAuth, async (c) => {
  const body = await c.req.json();
  
  const snippetId = await convexMutation(c.env.CONVEX_URL, 'snippets:create', body);
  
  return c.json({ id: snippetId, status: 'created' });
});

// List all snippets
app.get('/admin/snippets', adminAuth, async (c) => {
  const limit = parseInt(c.req.query('limit') || '50');
  
  const snippets = await convexQuery(c.env.CONVEX_URL, 'snippets:list', { limit });
  
  return c.json(snippets);
});

// Payment stats
app.get('/admin/stats', adminAuth, async (c) => {
  const stats = await convexQuery(c.env.CONVEX_URL, 'payments:stats');
  return c.json(stats);
});

// Upsert use case
app.post('/admin/usecase', adminAuth, async (c) => {
  const body = await c.req.json();
  
  const id = await convexMutation(c.env.CONVEX_URL, 'useCases:upsert', body);
  return c.json({ id, status: 'upserted' });
});

// Upsert service
app.post('/admin/service', adminAuth, async (c) => {
  const body = await c.req.json();
  
  const id = await convexMutation(c.env.CONVEX_URL, 'services:upsert', body);
  return c.json({ id, status: 'upserted' });
});

export default app;
