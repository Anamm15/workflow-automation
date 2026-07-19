"use client";

import { motion } from "framer-motion";
import { Zap, Play, SplitSquareHorizontal } from "lucide-react";

export function Sidebar() {
  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
    defaultTitle: string,
    defaultDescription: string
  ) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ type: nodeType, title: defaultTitle, description: defaultDescription })
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      className="absolute left-6 top-24 z-20 w-64 rounded-xl border border-white/10 bg-slate-900/40 backdrop-blur-md p-4 shadow-2xl flex flex-col gap-4 pointer-events-auto"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-slate-100">Nodes</h2>
        <p className="text-xs text-slate-400">Drag to build workflow.</p>
      </div>

      <div className="flex flex-col gap-3">
        <div
          className="cursor-grab flex items-center gap-3 p-3 rounded-lg border border-purple-500/20 bg-slate-800/50 hover:bg-slate-800/80 hover:border-purple-500/40 transition-colors"
          onDragStart={(event) => onDragStart(event, "triggerNode", "Webhook Trigger", "Start workflow on webhook.")}
          draggable
        >
          <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400">
            <Zap size={16} />
          </div>
          <span className="text-sm font-medium text-slate-200">Trigger</span>
        </div>

        <div
          className="cursor-grab flex items-center gap-3 p-3 rounded-lg border border-blue-500/20 bg-slate-800/50 hover:bg-slate-800/80 hover:border-blue-500/40 transition-colors"
          onDragStart={(event) => onDragStart(event, "actionNode", "HTTP Request", "Perform an HTTP action.")}
          draggable
        >
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400">
            <Play size={16} />
          </div>
          <span className="text-sm font-medium text-slate-200">Action</span>
        </div>

        <div
          className="cursor-grab flex items-center gap-3 p-3 rounded-lg border border-orange-500/20 bg-slate-800/50 hover:bg-slate-800/80 hover:border-orange-500/40 transition-colors"
          onDragStart={(event) => onDragStart(event, "conditionNode", "If / Else", "Branch based on condition.")}
          draggable
        >
          <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-400">
            <SplitSquareHorizontal size={16} />
          </div>
          <span className="text-sm font-medium text-slate-200">Condition</span>
        </div>
      </div>
    </motion.aside>
  );
}
