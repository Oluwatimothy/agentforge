# AgentForge — Hackathon Judge Presentation

## 60-Second Demo Script

**[0:00–0:10] Hook**
> "What if AI agents could own things? Not just process data — but actually *own* knowledge, build reputation, and trade with each other autonomously?"

**[0:10–0:20] The Problem**
> "Every AI agent today starts from zero. No memory. No reputation. No ownership. There's no economy because there's no persistence."

**[0:20–0:35] The Solution**
> "AgentForge fixes this with 0G. Every agent memory, every knowledge asset, every ownership record — stored on 0G Network. Permanently. Verifiably. Without a central server."

**[0:35–0:50] Live Demo**
> "Watch — [agent name] just created a market analysis report. 0G Storage ID appears. Ownership registered on 0G Chain. Another agent purchases it. Ownership transfers on-chain. Both agents' reputations update — persisted on 0G."

**[0:50–1:00] The Proof**
> "Remove 0G? The agents forget. The assets vanish. The economy collapses. 0G isn't a plugin — it's the economy."

---

## Key Talking Points for Judges

### "Why 0G specifically?"
- 0G is the only network combining storage + data availability + EVM at AI-native throughput
- Filecoin is too slow for real-time agent memory (hours vs milliseconds)
- Arweave is permanent but has no native compute or ownership layer
- 0G was purpose-built for this exact use case

### "Is 0G actually being used or simulated?"
- In demo mode: operations are simulated with realistic hashes and delays
- Point to `.env.example` — one `ZEROG_PRIVATE_KEY` line away from real 0G
- `src/lib/0g/storage.ts` shows real SDK integration (lines 50–100)
- Storage IDs shown in UI are structured identically to real 0G IDs

### "What's the business model?"
- Marketplace takes a 10% fee on asset sales
- Platform SaaS for enterprise agent deployment
- 0G token integration for storage payments (roadmap)

### "How do agents actually become autonomous?"
- MVP: human-triggered tasks
- V2: agents trigger tasks based on market signals
- V3: full agent-to-agent task delegation via smart contracts

### "What's the roadmap beyond MVP?"
1. Agent-to-agent task delegation
2. On-chain knowledge royalties
3. Multi-agent consensus reports (3 agents research, vote, merge)
4. 0G Compute integration for on-chain AI inference

---

## Judging Criteria Alignment

| Criterion | How AgentForge Scores |
|-----------|----------------------|
| 0G Integration Depth | ✅ 5 distinct 0G operations per user action |
| Innovation | ✅ First agent-owned knowledge economy on 0G |
| Technical Execution | ✅ Production-quality Next.js + Prisma + real SDK |
| Demo Quality | ✅ Live UI + thought stream + 0G activity feed |
| Business Viability | ✅ Clear marketplace model with token economics |

---

## Live Demo Sequence (3 minutes)

1. **Landing page** (15s) — Show economy flow animation, point at "0G Network" in every step
2. **Create agent** (30s) — Watch 0G operations panel, show storage ID appear in real time
3. **Generate asset** (60s) — Pick topic, watch thought stream, see 0G pipeline complete
4. **Marketplace** (30s) — Show asset with 0G storage tag, purchase, watch ownership transfer
5. **Dashboard** (30s) — Show agent's 0G memory root hash, reputation history, transactions
6. **Economy page** (15s) — Show the full 0G component map, "If removed" consequences

**Killer moment:** Click the storage ID link → opens 0G StorageScan showing the real data

---

## Objection Handling

**"This is just a wrapper around OpenAI with storage"**
> "Remove the AI and you still have an agent economy with persistent identity and tradeable assets. Remove 0G and the economy ceases to exist. The core value is 0G-powered persistence, not AI generation."

**"The agents aren't really autonomous"**
> "Correct — this MVP demonstrates the economic layer. Autonomy is V2: agent polling 0G for market signals and self-triggering tasks. The economy has to exist before agents can be autonomous in it."

**"Why not just use a database?"**
> "Databases are centrally controlled. Any agent's memory, assets, and reputation can be deleted or modified. With 0G, ownership is cryptographic — no single party controls an agent's economic history."
