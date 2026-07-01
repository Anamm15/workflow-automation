"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export type CustomNodeData = {
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
};

const statusConfig = {
  pending: {
    icon: Circle,
    color: "text-zinc-400",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/20",
  },
  "in-progress": {
    icon: Clock,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
};

export const CustomNode = memo(({ data, selected }: NodeProps) => {
  const customData = data as unknown as CustomNodeData;
  const config = statusConfig[customData.status];
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        "min-w-[240px] rounded-xl border p-4 backdrop-blur-md shadow-xl transition-all",
        "bg-slate-900/40 border-white/10 hover:border-white/20 hover:shadow-2xl",
        selected && "border-blue-500/50 shadow-blue-500/20",
        config.bg
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-slate-800 border-2 border-slate-400 rounded-full"
      />
      
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-slate-100 text-sm">
            {customData.title}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
            {customData.description}
          </p>
        </div>
        
        <div className={cn("mt-0.5 flex-shrink-0", config.color)}>
          <StatusIcon size={16} strokeWidth={2.5} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={cn(
            "text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border",
            config.color,
            config.border,
            config.bg
          )}
        >
          {customData.status.replace("-", " ")}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-slate-800 border-2 border-slate-400 rounded-full"
      />
    </div>
  );
});

CustomNode.displayName = "CustomNode";
