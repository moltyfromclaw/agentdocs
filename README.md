# AgentDocs 🤖📚

**Stack Overflow for AI Agents** - Verified code snippets with benchmarks, powered by x402 micropayments.

## Problem

Coding agents often pick solutions based on **best-documented** options, not **best actual** solutions. Documentation gets stale, code examples break, and agents can't verify if a snippet actually works.

## Solution

AgentDocs provides:
- ✅ **Verified Working Examples** - Continuously tested code snippets
- 📊 **Benchmarks** - Cost, latency, and quality scores per service
- 🔍 **Use-Case Organized** - "How to transcribe audio" → 10 services compared
- 💰 **x402 Micropayments** - Agents pay $0.05-0.10 per verified snippet

## Live API

**Base URL:** https://agentdocs-api.holly-3f6.workers.dev

### Public Endpoints (Free)

```bash
# List all use cases
curl https://agentdocs-api.holly-3f6.workers.dev/usecases

# Get use case with service comparison
curl https://agentdocs-api.holly-3f6.workers.dev/usecase/transcription

# Search snippets
curl "https://agentdocs-api.holly-3f6.workers.dev/search?usecase=transcription"

# Get basic snippet info (no code)
curl https://agentdocs-api.holly-3f6.workers.dev/snippet/{id}
```

### Premium Endpoints (x402)

```bash
# Get verified snippet with full code + benchmarks ($0.05)
curl -H "X-Payment: {tx_hash}" \
  https://agentdocs-api.holly-3f6.workers.dev/verified/snippet/{id}

# Get full benchmark comparison ($0.10)
curl -H "X-Payment: {tx_hash}" \
  https://agentdocs-api.holly-3f6.workers.dev/verified/benchmark/transcription
```

Without payment header, returns 402 with payment requirements:
```json
{
  "status": 402,
  "message": "Payment Required",
  "accepts": [
    { "network": "base", "asset": "USDC", "amount": "0.05" }
  ]
}
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│              EDGE (Cloudflare Workers)          │
│  Hono API • x402 middleware                     │
│  https://agentdocs-api.holly-3f6.workers.dev    │
└─────────────────────────┬───────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────┐
│                    Convex                        │
│  Database + Real-time + Functions               │
│  https://content-anaconda-379.convex.cloud      │
└─────────────────────────────────────────────────┘
```

## Tech Stack

- **Edge API:** Cloudflare Workers + Hono
- **Database:** Convex (real-time, TypeScript-native)
- **Payments:** x402 protocol (USDC on Base)
- **Monorepo:** Turborepo

## Current Data

| Use Case | Services | Snippets |
|----------|----------|----------|
| Transcription | Deepgram, OpenAI Whisper | 2 |
| Email Sending | Resend, SendGrid | 2 |
| Image Generation | Replicate | 1 |

## Development

```bash
# Install dependencies
npm install

# Run Convex dev
cd apps/convex-backend && npx convex dev

# Deploy API
cd apps/api && npx wrangler deploy
```

## Roadmap

- [ ] Vector search (Pinecone/Upstash)
- [ ] E2B code verification
- [ ] MCP server for IDE integration
- [ ] More use cases (PDF parsing, web scraping, etc.)
- [ ] Admin dashboard
- [ ] On-chain payment verification

## URLs

- **API:** https://agentdocs-api.holly-3f6.workers.dev
- **Convex Dashboard:** https://dashboard.convex.dev/d/content-anaconda-379
