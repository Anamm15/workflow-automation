"use client";

import { motion } from "framer-motion";
import { FlowComponent } from "./components/FlowComponent";
import { Sidebar } from "./components/Sidebar";
import { use } from "react";

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  // In Next.js 15+ App Router, params is a Promise that needs to be unwrapped.
  // We use `use` here if we needed the ID, but for the canvas we just render it.
  const resolvedParams = use(params);

  return (
    <main className="w-full h-screen bg-slate-950 overflow-hidden flex flex-col relative text-slate-100">
      
      {/* Header overlay for context */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute top-0 left-0 w-full p-6 z-10 pointer-events-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center pointer-events-auto shadow-lg backdrop-blur-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight pointer-events-auto">
              Workspace Flow
            </h1>
            <p className="text-xs text-slate-400 pointer-events-auto">
              ID: {resolvedParams.id}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Canvas Container with slide-up fade-in */}
      <Sidebar />
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
        className="flex-1 w-full h-full"
      >
        <FlowComponent />
      </motion.div>
    </main>
  );
}
