"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Segment Error:", error);
  }, [error]);

  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
        <AlertTriangle className="text-red-400" size={32} />
      </div>
      <h2 className="text-2xl font-semibold text-slate-100 mb-2">Something went wrong!</h2>
      <p className="text-slate-400 max-w-md mb-8">
        We encountered an error loading this dashboard view. Our engineers have been notified.
      </p>
      
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-white/5 shadow-lg"
      >
        <RefreshCcw size={16} />
        <span>Try Again</span>
      </button>
    </div>
  );
}
