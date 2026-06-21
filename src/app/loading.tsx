import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a18] flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin text-forge-400" />
        <span className="text-sm">Loading...</span>
      </div>
    </div>
  );
}
