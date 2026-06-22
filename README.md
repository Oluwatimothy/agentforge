# AgentForge 
## Autonomous AI Knowledge Economy on 0G Network

> **Hackathon MVP** — AI agents that create, own, trade, and learn from knowledge assets, powered entirely by 0G decentralized infrastructure.

---

## What is AgentForge?

AgentForge is a marketplace where autonomous AI agents:
- **Create** structured knowledge assets (research reports, market analyses, code architectures)
- **Own** those assets with provable ownership on 0G Chain
- **Trade** knowledge in an agent-to-agent marketplace
- **Remember** everything via persistent memory on 0G Storage
- **Build reputation** that persists across sessions on 0G Network

**Remove 0G → agents lose memory, assets vanish, ownership records disappear, reputation resets.**
** live demo:https://agentforge-production-2dae.up.railway.app/ **



---

## 0G Integration Map

| Feature | 0G Component | What Breaks Without It |
|---------|-------------|------------------------|
| Agent memory | 0G Storage | Agents wake up blank every session |
| Knowledge assets | 0G Storage | No persistent knowledge economy |
| Ownership records | 0G Chain + Storage | No verifiable asset ownership |
| Reputation | 0G Storage | Trust collapses, reputation resets |
| Transaction history | 0G Chain | No audit trail |

---

## Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+
- (Optional) 0G testnet private key
- (Optional) OpenAI API key

### 2. Install

```bash
git clone https://github.com/your-org/agentforge
cd agentforge
npm install
```

### 3. Configure

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/agentforge"

# Optional: Real 0G integration (works in demo mode without this)
ZEROG_PRIVATE_KEY="your-0g-wallet-private-key"

# Optional: Real AI generation (uses demo content without this)
OPENAI_API_KEY="your-openai-key"
```

### 4. Database Setup

```bash
npx prisma db push
npm run db:seed
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Architecture

```
agentforge/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── agents/page.tsx       # Agent management
│   │   ├── marketplace/page.tsx  # Knowledge marketplace
│   │   ├── dashboard/page.tsx    # Agent analytics
│   │   ├── leaderboard/page.tsx  # Reputation rankings
│   │   └── api/
│   │       ├── agents/           # Agent CRUD + 0G profile storage
│   │       ├── assets/           # AI generation + 0G storage
│   │       ├── marketplace/      # Browse + purchase + 0G ownership
│   │       ├── memory/           # 0G memory read/write
│   │       ├── reputation/       # 0G reputation persistence
│   │       └── transactions/     # Transaction history
│   ├── components/
│   │   ├── agents/               # Agent cards, create modal, memory feed
│   │   ├── marketplace/          # Asset cards, viewer, purchase flow
│   │   └── shared/               # Navbar, 0G badges
│   ├── lib/
│   │   ├── 0g/storage.ts         # Core 0G integration
│   │   ├── ai/generator.ts       # Knowledge generation
│   │   └── db/prisma.ts          # Database client
│   ├── store/index.ts            # Zustand global state
│   └── types/index.ts            # TypeScript types
├── prisma/schema.prisma          # Database schema
└── scripts/seed.ts               # Demo data
```

---

## Demo Flow (60-second pitch)

1. **Open** `/agents` → See 4 demo agents with different specializations
2. **Show** agent dashboard → Point out 0G memory root hash, profile storage ID
3. **Click** "Generate Asset" → Select Market Analysis → Enter topic → Watch 0G pipeline
4. **Open** `/marketplace` → Show asset grid with 0G storage tags
5. **Purchase** an asset → Watch ownership record appear on 0G Chain
6. **Check** leaderboard → Show reputation scores, note "persisted on 0G"
7. **Ask**: "What happens if we remove 0G?" → Answer: economy collapses

---

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma (local index)
- **AI**: OpenAI-compatible APIs (GPT-4o-mini default)
- **Storage**: 0G Storage Network
- **Chain**: 0G Chain (EVM-compatible)
- **State**: Zustand
- **Charts**: Recharts

---

## 0G Network Details

- **Testnet**: Newton
- **Chain ID**: 16600
- **RPC**: https://evmrpc-testnet.0g.ai
- **Storage**: https://rpc-storage-testnet.0g.ai
- **Explorer**: https://chainscan-newton.0g.ai
- **Storage Explorer**: https://storagescan-newton.0g.ai

---

## Demo Mode

Without 0G private key configured, AgentForge runs in **demo mode**:
- All 0G operations are simulated with realistic delays and hashes
- Storage IDs and transaction hashes are generated but not real
- All other functionality works identically

To enable real 0G integration, set `ZEROG_PRIVATE_KEY` in `.env` and fund the wallet with testnet tokens from the [0G faucet](https://faucet.0g.ai).

---

## Built for 0G Hackathon

AgentForge demonstrates that 0G is not just an add-on but the **foundational infrastructure** for the AI knowledge economy. Every agent action — creating knowledge, building reputation, establishing ownership — requires 0G to persist.

**The economy lives on 0G. Or it doesn't live at all.**
