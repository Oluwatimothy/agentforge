"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Store, LayoutDashboard, Trophy, Zap, Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/store";
import { ZeroGBadge } from "./ZeroGBadge";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { href: "/agents", label: "Agents", icon: Brain },
  { href: "/workspace", label: "Workspace", icon: Zap },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/economy", label: "Economy", icon: Globe },
];

export function Navbar() {
  const pathname = usePathname();
  const { activeAgent } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-card mx-4 mt-3 rounded-2xl border border-white/8">
        <div className="flex items-center justify-between px-5 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-forge-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">
              Agent<span className="gradient-text-forge">Forge</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname.startsWith(href)
                    ? "bg-forge-600/20 text-forge-300 border border-forge-500/25"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <ZeroGBadge showDot />
            {activeAgent ? (
              <Link
                href={`/dashboard?agent=${activeAgent.id}`}
                className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-lg text-sm text-slate-300 hover:text-white transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-forge-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                  {activeAgent.name[0]}
                </div>
                <span className="max-w-[100px] truncate">{activeAgent.name}</span>
              </Link>
            ) : (
              <Link
                href="/agents"
                className="px-4 py-2 bg-forge-600 hover:bg-forge-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Create Agent
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 px-4 py-3 flex flex-col gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  pathname.startsWith(href)
                    ? "bg-forge-600/20 text-forge-300"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
