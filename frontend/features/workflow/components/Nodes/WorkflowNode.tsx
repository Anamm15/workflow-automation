import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MoreHorizontal, AlertTriangle, Zap, Globe, Mail, MessageSquare, Clock, GitBranch, Repeat } from 'lucide-react';
import { NodeData } from '../../types';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import clsx from 'clsx';

import { toast } from 'sonner';

const iconMap: Record<string, any> = {
  webhook: Zap,
  http: Globe,
  email: Mail,
  slack: MessageSquare,
  schedule: Clock,
  if: GitBranch,
  delay: Clock,
  loop: Repeat
};

const categoryColorMap: Record<string, string> = {
  trigger: 'bg-indigo-500',
  action: 'bg-blue-500',
  logic: 'bg-amber-500',
};

export const WorkflowNode = ({ id, data, selected }: NodeProps<import('../../types').CustomNode>) => {
  const { removeNode } = useWorkflowStore();
  const Icon = iconMap[data.provider] || Zap;
  const headerColor = categoryColorMap[data.type] || 'bg-gray-500';

  const onMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.custom((t) => (
      <div className="bg-card border border-border p-4 rounded-xl shadow-lg flex flex-col gap-3 w-72">
        <div className="flex items-start gap-3">
          <div className="bg-error/10 text-error p-2 rounded-full shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Delete Node</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Are you sure you want to delete "{data.label}"? This action cannot be undone.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-end mt-1">
          <button
            onClick={() => toast.dismiss(t)}
            className="px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              removeNode(id);
              toast.dismiss(t);
            }}
            className="px-3 py-1.5 text-xs font-medium bg-error text-white hover:bg-error/90 rounded-md shadow-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'top-center' });
  };

  return (
    <div
      className={clsx(
        'group relative min-w-[280px] bg-card border rounded-xl shadow-md transition-all duration-200 overflow-visible',
        selected ? 'border-primary ring-2 ring-primary/20 shadow-lg scale-[1.02] z-20' : 'border-border hover:border-primary/50'
      )}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className={clsx('flex items-center justify-center w-7 h-7 rounded-md text-white shadow-sm', headerColor)}>
            <Icon size={14} strokeWidth={2.5} />
          </div>
          <div className="font-semibold text-sm text-foreground tracking-tight">
            {data.label}
          </div>
        </div>
        <button
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
          onClick={onMenuClick}
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Node Body */}
      <div className="px-4 py-3 bg-card rounded-b-xl">
        {data.summary ? (
          <div className="text-xs text-muted-foreground bg-muted/40 p-2 rounded-md font-mono mb-2 truncate border border-border/50">
            {data.summary}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground italic mb-2">
            No configuration yet.
          </div>
        )}

        {/* Validation Badge */}
        {!data.isValid && (
          <div className="flex items-center gap-1.5 text-xs text-error font-medium bg-error/10 px-2 py-1 rounded-md w-max border border-error/20">
            <AlertTriangle size={12} />
            <span>Missing Config</span>
          </div>
        )}
      </div>

      {/* Handles — styling via globals.css, 28px invisible hit area with 12px visible dot */}
      {data.type !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Left}
        />
      )}

      {/* If Condition Handle Logic */}
      {data.provider === 'if' ? (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={{ top: '30%' }}
            className="handle-true"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            style={{ top: '70%' }}
            className="handle-false"
          />
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Right}
        />
      )}
    </div>
  );
};
