"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { SplitSquareHorizontal, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ConditionNodeData } from "./types";

export const ConditionNode = memo(({ data, selected }: NodeProps) => {
  const customData = data as unknown as ConditionNodeData;
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
      <Handle
        type="target"
        position={Position.Left}
        className="!w-4 !h-4 !bg-slate-900 !border-[3px] !border-orange-500 rounded-full z-50 pointer-events-auto cursor-crosshair hover:!scale-125 hover:!shadow-[0_0_12px_rgba(249,115,22,0.8)] transition-all"
      />
      
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="bg-orange-500/10 text-orange-400 p-1 rounded-md">
              <SplitSquareHorizontal size={14} />
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

      <div className="relative mt-4 flex flex-col gap-2 w-full text-[10px] uppercase font-bold tracking-wider text-right pr-4">
        <div className="text-green-400">
          True
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            className="!w-4 !h-4 !bg-slate-900 !border-[3px] !border-green-500 rounded-full z-50 pointer-events-auto cursor-crosshair hover:!scale-125 hover:!shadow-[0_0_12px_rgba(34,197,94,0.8)] transition-all"
            style={{ top: "60%" }}
          />
        </div>
        <div className="text-red-400">
          False
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            className="!w-4 !h-4 !bg-slate-900 !border-[3px] !border-red-500 rounded-full z-50 pointer-events-auto cursor-crosshair hover:!scale-125 hover:!shadow-[0_0_12px_rgba(239,68,68,0.8)] transition-all"
            style={{ top: "85%" }}
          />
        </div>
      </div>
    </div>
  );
});

ConditionNode.displayName = "ConditionNode";
