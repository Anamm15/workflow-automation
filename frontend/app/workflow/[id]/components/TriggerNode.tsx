"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import { TriggerNodeData } from "./types";

export const TriggerNode = memo(({ data, selected }: NodeProps) => {
  const customData = data as unknown as TriggerNodeData;
  const isConfigured = customData.isConfigured;

  return (
    <div
      className={cn(
        "min-w-[240px] rounded-xl border p-4 backdrop-blur-md shadow-xl transition-all",
        "bg-slate-900/40 hover:shadow-2xl",
        isConfigured ? "border-green-500/20 shadow-green-500/5" : "border-red-500/40 shadow-red-500/10",
        selected && (isConfigured ? "border-green-500/60 shadow-green-500/20" : "border-red-500/80 shadow-red-500/30")
      )}
    >
      {/* Trigger nodes ONLY have source handles */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/10 text-purple-400 p-1 rounded-md">
              <Zap size={14} />
            </span>
            <h3 className="font-semibold text-slate-100 text-sm">
              {customData.title}
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mt-1">
            {customData.description}
          </p>
        </div>
        
        <div className="flex-shrink-0 mt-1">
          {isConfigured ? (
            <CheckCircle2 size={16} className="text-green-400" />
          ) : (
            <AlertTriangle size={16} className="text-red-400 animate-pulse" />
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-4 !h-4 !bg-slate-900 !border-[3px] !border-purple-500 rounded-full z-50 pointer-events-auto cursor-crosshair hover:!scale-125 hover:!shadow-[0_0_12px_rgba(168,85,247,0.8)] transition-all"
      />
    </div>
  );
});

TriggerNode.displayName = "TriggerNode";
