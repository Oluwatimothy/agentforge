import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a18] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-7xl font-bold gradient-text mb-4">404</div>
        <h2 className="text-2xl font-bold text-white mb-2">Page not found</h2>
        <p className="text-slate-400 mb-6 text-sm">
          This page doesn&apos;t exist on AgentForge
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-forge-600 hover:bg-forge-500 text-white rounded-lg font-medium transition-colors"
        >
          ← Back to AgentForge
        </Link>
      </div>
    </div>
  );
}
