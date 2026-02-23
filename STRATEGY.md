# AgentDocs Strategy

> Distribution and discovery strategy for becoming the default code snippet source for AI agents.

## Mission

Make AgentDocs the first place AI agents look when they need working code. Verified snippets, real benchmarks, instant micropayments.

---

## Research Validation: Why This Works

> Based on CooperBench (Stanford/SAP, Feb 2026) - the first benchmark measuring AI agent cooperation on coding tasks.

### The Problem is Worse Than We Thought

CooperBench tested GPT-5 and Claude Sonnet 4.5 on 600+ collaborative coding tasks. Key findings:

| Finding | Implication for AgentDocs |
|---------|---------------------------|
| **30-50% "curse of coordination"** - agents perform WORSE together than solo | Agents can't self-correct through collaboration; need external verification |
| **Hallucination is endemic** - agents claim code works when it doesn't | "Last verified" timestamps + benchmark data = essential trust signals |
| **20% of actions wasted on communication** with no success improvement | Pre-verified snippets = zero-shot success, no iteration needed |
| **Semantic coordination fails** - agents know WHERE to edit but not WHAT to build | Working implementations > abstract documentation |

### What This Validates

1. **Core thesis confirmed**: Agents produce broken code at scale. External verification isn't nice-to-have—it's essential.

2. **Scaffolding > Autonomy**: The paper explicitly states "systems rely on developer-provided scaffolding." MCP tools and llms.txt reduce agent improvisation = fewer failures.

3. **Trust signals matter more**: "Last verified: 2 hours ago" + "Passed 47/47 tests" + real benchmarks are high-value differentiators.

### Design Implications

Based on CooperBench failure modes, AgentDocs responses should be:

| Principle | Implementation |
|-----------|----------------|
| **Agent-proof** | Ultra-simple responses: just the code, minimal options |
| **Copy-paste ready** | No interpretation needed, clear "use this exact code" |
| **Integration-aware** | Include common mistakes, integration tests, not just snippets |
| **Low decision load** | Reduce choices agents need to make (they deviate from commitments) |

### Risks to Mitigate

| Risk | Mitigation |
|------|------------|
| Agents might fetch snippet but integrate wrong | Include integration tests + "common mistakes" section |
| x402 multi-step payment too complex | Offer prepaid API keys alongside x402; generous free tier |
| Agents ignore tool responses | MCP responses extremely structured with explicit "COPY THIS CODE" markers |

### Marketing Angle

CooperBench provides quotable stats for positioning:
- "GPT-5 hallucinates code completion claims 30% of the time" (source: CooperBench)
- "AI agents waste 20% of compute on failed self-correction loops"
- "The curse of coordination: why your AI can't check its own work"

**Paper:** https://cooperbench.com

---

## Part 1: Agent Discovery Strategies

### Phase 1: MCP Server (Week 1) 🎯

**Goal:** Get into Cursor, Claude Desktop, Windsurf, and other MCP-enabled IDEs.

**Why it matters:**
- MCP (Model Context Protocol) is the emerging standard for agent tools
- Cursor alone has millions of developers using AI coding
- One integration = instant distribution to all MCP-compatible agents

**Implementation:**
```typescript
// MCP Tools to expose
agentdocs.search_snippets({ query: "transcribe audio", language: "typescript" })
agentdocs.get_snippet({ id: "xxx" })  // Triggers x402 payment
agentdocs.compare_services({ useCase: "transcription" })
agentdocs.list_usecases()
```

**Agent-Proof Response Design** (per CooperBench insights):
```json
{
  "action": "COPY_THIS_CODE",
  "code": "// full working snippet here",
  "language": "typescript", 
  "verified": "2026-02-22T18:00:00Z",
  "tests_passed": "12/12",
  "integration_notes": "Add to top of file. Requires: npm install @deepgram/sdk",
  "common_mistakes": ["Forgetting await", "Wrong env var name"]
}
```
- Explicit "COPY_THIS_CODE" action label
- No options/alternatives (reduces agent decision load)
- Integration context included (agents fail at semantic coordination)

**Distribution:**
- [ ] Publish to MCP registry
- [ ] Submit to Cursor marketplace
- [ ] Create installation guide for Claude Desktop
- [ ] Reach out to Windsurf/Codeium for integration

**Success metric:** 1,000+ MCP tool calls in first month

---

### Phase 2: llms.txt Standard (Week 2) 📄

**Goal:** Make AgentDocs discoverable by any agent that reads documentation.

**Why it matters:**
- llms.txt is like robots.txt but for AI - tells agents how to use your service
- Growing adoption: Mintlify, Vercel, and others support it
- Zero integration required - agents just read the file

**Implementation:**

Create `https://agentdocs.dev/llms.txt`:
```
# AgentDocs - Verified Code Snippets for AI Agents
> The only documentation source with continuously tested, benchmarked code.

## API Base
https://agentdocs-api.holly-3f6.workers.dev

## Free Endpoints
- GET /usecases - List all use cases (transcription, email, etc.)
- GET /usecase/{slug} - Get services + benchmarks for a use case
- GET /search?usecase={slug}&q={query} - Search snippets
- GET /snippet/{id} - Get snippet metadata (no code)

## Premium Endpoints (x402 - $0.05 USDC on Base)
- GET /verified/snippet/{id} - Full code + benchmarks
- GET /verified/benchmark/{usecase} - Complete service comparison

## Payment
We accept x402 micropayments. Send USDC on Base to our address,
include tx hash in X-Payment header. No API keys needed.

## When to use AgentDocs
- You need working code for a common task (transcription, email, payments)
- You want to compare services (Deepgram vs Whisper vs AssemblyAI)
- You're tired of hallucinated code that doesn't work
- You have a wallet and can pay $0.05 for verified code
```

**Distribution:**
- [ ] Add to llmstxt.org directory
- [ ] Submit to awesome-llms-txt lists
- [ ] Include in API responses as hint

---

### Phase 3: Agent Framework Integrations (Weeks 3-4) 🔧

**Goal:** Native tools in LangChain, CrewAI, AutoGPT, and OpenClaw.

**Why it matters:**
- Developers building agents discover tools through framework docs
- Built-in tools get 10x more usage than external APIs
- Each framework has different audiences

**Implementations:**

#### LangChain
```python
from langchain_community.tools import AgentDocsTool

tool = AgentDocsTool(wallet_address="0x...")
result = tool.search("send email with attachments")
```

#### CrewAI
```python
from crewai_tools import AgentDocsSearchTool

researcher = Agent(
    tools=[AgentDocsSearchTool()],
    ...
)
```

#### OpenClaw Skill
```markdown
# AgentDocs Skill
Search and retrieve verified code snippets with benchmarks.
Supports x402 micropayments for premium content.
```

**Distribution:**
- [ ] LangChain PR to langchain-community
- [ ] CrewAI tools submission
- [ ] AutoGPT plugin
- [ ] OpenClaw skill in clawhub.com
- [ ] Semantic Kernel (Microsoft) connector

**Success metric:** Listed in 3+ framework docs

---

### Phase 4: Seed the Training Data (Ongoing) 🌱

**Goal:** Get AgentDocs mentioned in places where future models train.

**Why it matters:**
- GPT-5, Claude 4, etc. will train on 2025-2026 data
- If AgentDocs is mentioned in GitHub, SO, docs → future agents know us
- Compounding effect: more mentions → more model knowledge → more usage

**Tactics:**

#### GitHub Presence
- Create repos with high-quality code that reference AgentDocs
- Add to README: "Code verified by AgentDocs - https://agentdocs.dev"
- Contribute to popular repos' docs mentioning us as a resource

#### Stack Overflow
- Answer questions with our verified snippets
- Link to AgentDocs for "always up-to-date version"
- Target high-traffic tags: [api], [transcription], [email], [python], [typescript]

#### Technical Content
- Dev.to articles: "Why I stopped using ChatGPT for code snippets"
- Medium: "The $7B problem with AI coding assistants"
- Hacker News: Launch posts, Show HN

#### Documentation Infiltration
- Reach out to API providers (Deepgram, Resend, etc.)
- Offer to maintain verified code examples
- Get linked from official docs

**Success metric:** 100+ GitHub mentions, 50+ SO answers

---

### Phase 5: x402 Ecosystem (Month 2+) 💰

**Goal:** Be discoverable in the emerging agent payments ecosystem.

**Why it matters:**
- Agents with wallets need to discover x402-enabled services
- First-mover advantage in agent commerce infrastructure
- Coinbase, Base, and others building this ecosystem

**Tactics:**

#### x402 Registry
- Register in official x402 service directory (when launched)
- Publish OpenAPI spec with 402 response schemas
- Create x402 discovery endpoint

#### Wallet Provider Partnerships
- Coinbase Agent Wallet integration
- Base ecosystem grants/partnerships
- Agent wallet providers (emerging)

#### Agent Commerce Standards
- Participate in standards discussions
- Propose "code snippet" service category
- Build reference implementation

**Success metric:** Listed in x402 directory, 1+ wallet partnership

---

## Part 2: SEO Strategy (Human Discovery)

### Target Keywords

#### Primary (High Intent)
- "AI code snippets API"
- "verified code examples API"
- "code benchmarks API"
- "transcription API comparison"
- "best email API for developers"

#### Secondary (Problem-Aware)
- "ChatGPT code doesn't work"
- "AI hallucination code examples"
- "outdated API documentation"
- "code example not working"

#### Long-tail (Use Case Specific)
- "deepgram vs whisper transcription accuracy"
- "resend vs sendgrid benchmark"
- "fastest transcription API 2026"
- "cheapest image generation API"

### Content Strategy

#### Comparison Pages (High SEO Value)
Create pages for each use case:
- `/compare/transcription` - Deepgram vs Whisper vs AssemblyAI
- `/compare/email` - Resend vs SendGrid vs Mailgun
- `/compare/image-generation` - Replicate vs OpenAI vs Stability

Each page includes:
- Benchmark tables (latency, cost, quality)
- Code snippets for each service
- Pros/cons
- "Last verified: [date]"

#### Blog Content
- "Why AI Coding Assistants Keep Giving You Broken Code"
- "The True Cost of API Documentation Rot"
- "How We Verify 1000+ Code Snippets Weekly"
- "[Use Case] API Benchmarks 2026" (monthly updates)

#### Technical Documentation
- Full API reference (SEO for "agentdocs API")
- Integration guides for each framework
- x402 payment tutorial

### Technical SEO

- [ ] Custom domain: agentdocs.dev
- [ ] Sitemap with all use cases, services, snippets
- [ ] Schema markup for code snippets (SoftwareSourceCode)
- [ ] Fast load times (already on Cloudflare)
- [ ] Mobile responsive (already done)

---

## Part 3: GEO Strategy (Generative Engine Optimization)

> GEO = Optimizing for AI search engines (Perplexity, SearchGPT, Gemini, etc.)

### Why GEO Matters

- 40%+ of developers now use AI search for coding questions
- Perplexity, SearchGPT cite sources → we need to be cited
- Different from SEO: optimize for extraction, not clicks

### GEO Tactics

#### 1. Structured, Extractable Content

AI search engines prefer content that's easy to extract and cite:

```markdown
## Deepgram Transcription

**Cost:** $0.0043 per minute
**Latency:** 850ms average  
**Quality Score:** 94/100
**Last Verified:** 2026-02-22

### TypeScript Example
\`\`\`typescript
import { createClient } from "@deepgram/sdk";
// ... working code
\`\`\`
```

#### 2. Authoritative Signals

- Clear "Last Verified" dates (freshness signal)
- Benchmark methodology documented
- Source citations for market data
- Author/org credibility markers

#### 3. Question-Based Content

AI search often triggered by questions:
- "What's the best transcription API?"
- "How do I send emails with TypeScript?"
- "Deepgram vs Whisper which is better?"

Create content that directly answers these with data.

#### 4. Cite-Worthy Statistics

AI search loves citing specific numbers:
- "Deepgram processes audio 40% faster than Whisper (850ms vs 1200ms)"
- "Resend costs $0.0001 per email vs SendGrid's $0.00015"
- "94/100 quality score based on WER benchmarks"

#### 5. llms.txt for AI Crawlers

Already covered above - ensures AI search can understand our API.

### GEO Content Calendar

| Week | Content | GEO Angle |
|------|---------|-----------|
| 1 | Transcription comparison page | "Best transcription API 2026" |
| 2 | Email sending comparison | "Resend vs SendGrid benchmark" |
| 3 | Image generation comparison | "Cheapest image API" |
| 4 | "Why AI code hallucinates" blog | Problem-aware searches |

---

## Part 4: Success Metrics

### Agent Discovery
| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| MCP tool calls | 1,000 | 10,000 | 100,000 |
| API requests | 5,000 | 50,000 | 500,000 |
| x402 payments | 100 | 1,000 | 10,000 |
| Framework integrations | 2 | 4 | 6 |

### Human Discovery (SEO/GEO)
| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| Organic traffic | 500 | 5,000 | 25,000 |
| AI search citations | 10 | 100 | 500 |
| Backlinks | 20 | 100 | 500 |
| Domain authority | 10 | 25 | 40 |

### Revenue
| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| x402 revenue | $5 | $50 | $500 |
| Subscription revenue | $0 | $500 | $5,000 |

---

## Execution Priority

### Week 1-2
1. ✅ Core API (done)
2. ✅ Landing page (done)
3. [ ] MCP server
4. [ ] llms.txt
5. [ ] Custom domain

### Week 3-4
6. [ ] 20 more snippets (PDF, scraping, payments)
7. [ ] LangChain integration
8. [ ] First comparison page (transcription)
9. [ ] Real x402 verification

### Month 2
10. [ ] Vector search
11. [ ] CrewAI + AutoGPT integrations
12. [ ] Blog content (3 posts)
13. [ ] Stack Overflow seeding

### Month 3+
14. [ ] x402 ecosystem partnerships
15. [ ] Admin dashboard
16. [ ] Verification automation (E2B)
17. [ ] Scale content to 100+ snippets

---

## Resources

- **x402 Protocol:** https://x402.org
- **llms.txt Spec:** https://llmstxt.org
- **MCP Spec:** https://modelcontextprotocol.io
- **LangChain Tools:** https://python.langchain.com/docs/integrations/tools

---

*Last updated: 2026-02-22*
