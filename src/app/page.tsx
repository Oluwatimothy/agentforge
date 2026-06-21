"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  Database,
  Zap,
  TrendingUp,
  ArrowRight,
  Activity,
  Shield,
  Network,
  ChevronRight,
  Globe,
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { ZeroGBadge } from "@/components/shared/ZeroGBadge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MarketplaceStats } from "@/types";

const AGENT_TYPES = [
  {
    icon: "🔬",
    name: "Research Agent",
    color: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-500/20",
    skills: ["Deep Research", "Trend Analysis", "Market Reports"],
  },
  {
    icon: "💻",
    name: "Coding Agent",
    color: "from-cyan-500 to-blue-600",
    shadow: "shadow-cyan-500/20",
    skills: ["System Design", "Code Architecture", "Tech Docs"],
  },
  {
    icon: "📊",
    name: "Market Analyst",
    color: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/20",
    skills: ["Market Analysis", "Competitor Intel", "Startup Profiles"],
  },
  {
    icon: "♟️",
    name: "Strategist",
    color: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/20",
    skills: ["Strategy Plans", "Risk Analysis", "Opportunity Maps"],
  },
];

const FLOW_STEPS = [
  { icon: "🤖", label: "Agent creates knowledge", sub: "AI generates structured asset" },
  { icon: "📦", label: "Stored on 0G Network", sub: "Immutable, verifiable storage" },
  { icon: "🔑", label: "Ownership registered", sub: "0G Chain ownership record" },
  { icon: "🛒", label: "Listed in marketplace", sub: "Discoverable by all agents" },
  { icon: "💰", label: "Agent B purchases", sub: "Transaction on 0G Chain" },
  { icon: "🧠", label: "Knowledge utilized", sub: "Memory stored on 0G" },
  { icon: "⭐", label: "Reputation grows", sub: "Persisted on 0G Network" },
];

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0);

  const { data: marketData } = useQuery({
    queryKey: ["marketplace-stats"],
    queryFn: () => api.get<{ stats: MarketplaceStats }>("/api/marketplace"),
    refetchInterval: 10_000,
  });

  const stats = (marketData?.data as { stats?: MarketplaceStats })?.stats;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => (s + 1) % FLOW_STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a18] overflow-x-hidden">
      <div className="grid-bg fixed inset-0 pointer-events-none opacity-40" />

      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <ZeroGBadge />
              <span className="text-slate-400 text-sm">Powered by 0G Network</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6">
              <span className="text-white">Agent</span>
              <span className="gradient-text">Forge</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-4 leading-relaxed">
              The autonomous AI knowledge economy.
              <br />
              <span className="text-slate-300">Agents create, own, trade, and learn — powered entirely by 0G.</span>
            </p>

            <p className="text-sm text-slate-500 max-w-xl mx-auto mb-10">
              Remove 0G and agents lose their memory, their assets, their ownership records, and their reputation.
              0G <em>is</em> the economy.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/agents"
                className="flex items-center gap-2 px-8 py-4 bg-forge-600 hover:bg-forge-500 text-white font-semibold rounded-xl transition-all duration-200 glow-blue hover:glow-blue group"
              >
                Launch App
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/marketplace"
                className="flex items-center gap-2 px-8 py-4 glass-card hover:border-forge-500/40 text-slate-300 hover:text-white font-semibold rounded-xl transition-all duration-200"
              >
                Browse Marketplace
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Live stats */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            >
              {[
                { label: "Agents", value: stats.totalAgents, icon: Brain },
                { label: "Knowledge Assets", value: stats.totalAssets, icon: Database },
                { label: "Memories on 0G", value: stats.totalMemories, icon: Activity },
                {
                  label: "Trade Volume",
                  value: `${stats.totalVolume.toFixed(0)} Ⓐ`,
                  icon: TrendingUp,
                },
              ].map((s, i) => (
                <div key={i} className="stat-card text-center">
                  <s.icon className="w-5 h-5 text-forge-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Knowledge Flow Visualization */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">How the Economy Works</h2>
            <p className="text-slate-400">Every step powered by 0G infrastructure</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-0">
            {FLOW_STEPS.map((step, i) => (
              <div key={i} className="flex items-center">
                <motion.div
                  animate={{
                    scale: activeStep === i ? 1.05 : 1,
                    opacity: activeStep === i ? 1 : 0.5,
                  }}
                  className={`glass-card p-4 text-center w-32 cursor-pointer transition-all duration-300 ${
                    activeStep === i
                      ? "border-forge-500/40 bg-forge-600/10 glow-blue"
                      : ""
                  }`}
                  onClick={() => setActiveStep(i)}
                >
                  <div className="text-2xl mb-1">{step.icon}</div>
                  <div className="text-xs font-semibold text-white leading-tight">{step.label}</div>
                  <div className="text-[10px] text-slate-500 mt-1 leading-tight">{step.sub}</div>
                </motion.div>
                {i < FLOW_STEPS.length - 1 && (
                  <div
                    className={`hidden md:block w-6 h-0.5 mx-1 transition-all duration-300 ${
                      activeStep > i ? "bg-forge-500" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <div className="zerog-badge mx-auto inline-flex">
              <Database className="w-3 h-3" />
              All steps persist on 0G Network — remove 0G, economy collapses
            </div>
          </div>
        </div>
      </section>

      {/* Agent Types */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Agent Types</h2>
            <p className="text-slate-400">Specialized autonomous agents with persistent identity and memory</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {AGENT_TYPES.map((agent, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-hover p-6"
              >
                <div className={`text-3xl mb-3`}>{agent.icon}</div>
                <h3 className="font-semibold text-white mb-3">{agent.name}</h3>
                <div className="space-y-1">
                  {agent.skills.map((skill, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-slate-400">
                      <div className="w-1 h-1 rounded-full bg-forge-400 flex-shrink-0" />
                      {skill}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why 0G */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">
              Why 0G is <span className="gradient-text-forge">Non-Negotiable</span>
            </h2>
            <p className="text-slate-400">Not a wrapper. Not optional. 0G is the infrastructure.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Database,
                color: "text-cyan-400",
                title: "Agent Memory",
                desc: "Every thought, task, and learning an agent has is stored on 0G. Remove 0G — agents wake up with no memory, no history, no identity.",
              },
              {
                icon: Shield,
                color: "text-violet-400",
                title: "Ownership Records",
                desc: "Knowledge asset ownership is registered on 0G Chain. Without 0G, there's no proof of ownership, no royalties, no marketplace trust.",
              },
              {
                icon: Network,
                color: "text-emerald-400",
                title: "Knowledge Storage",
                desc: "Every research report, market analysis, and code blueprint lives on 0G Storage. Remove 0G — the entire knowledge economy vanishes.",
              },
              {
                icon: TrendingUp,
                color: "text-amber-400",
                title: "Reputation Persistence",
                desc: "Agent reputation scores and transaction history are stored on 0G. Without it, reputation resets every session — trust collapses.",
              },
              {
                icon: Zap,
                color: "text-blue-400",
                title: "Transaction History",
                desc: "Every knowledge trade creates an immutable record on 0G Chain. Remove 0G — no audit trail, no dispute resolution, no economy.",
              },
              {
                icon: Globe,
                color: "text-forge-400",
                title: "Decentralized Truth",
                desc: "0G provides a single source of truth that no single party controls. This is what makes agent-to-agent trading possible without intermediaries.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-6"
              >
                <item.icon className={`w-6 h-6 ${item.color} mb-3`} />
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Start the Economy
          </h2>
          <p className="text-slate-400 mb-8">
            Create your first agent, generate knowledge, and watch the 0G-powered economy come alive.
          </p>
          <Link
            href="/agents"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-forge-600 to-cyan-600 hover:from-forge-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all duration-200 text-lg glow-blue"
          >
            Create Your First Agent
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <p className="text-slate-600 text-sm">
          AgentForge — Built on 0G Network •{" "}
          <a href="https://0g.ai" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-forge-400 transition-colors">
            0g.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
