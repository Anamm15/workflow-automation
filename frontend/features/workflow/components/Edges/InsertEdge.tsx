import React, { useState } from 'react';
import { BaseEdge, getSmoothStepPath, EdgeProps } from '@xyflow/react';
import { Plus, X, AlertTriangle } from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { toast } from 'sonner';

const BUTTON_SIZE = 24;
const GAP = 6;

export const InsertEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [hovered, setHovered] = useState(false);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { toggleSidebar, isSidebarOpen, removeEdge } = useWorkflowStore();

  const onInsertClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    if (!isSidebarOpen) toggleSidebar();
    alert(`Node insertion clicked on edge ${id}. Please select a node from the left sidebar or drag it here!`);
  };

  const onDeleteClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    toast.custom((t) => (
      <div className="bg-card border border-border p-4 rounded-xl shadow-lg flex flex-col gap-3 w-72">
        <div className="flex items-start gap-3">
          <div className="bg-error/10 text-error p-2 rounded-full shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Delete Connection</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Are you sure you want to remove this connection? This action cannot be undone.
            </p>
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
              removeEdge(id);
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

  // Total width of the button group: two buttons + gap
  const groupWidth = BUTTON_SIZE * 2 + GAP;
  const groupHeight = BUTTON_SIZE;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ strokeWidth: 2, stroke: '#52525b', ...style }} />
      <foreignObject
        width={groupWidth}
        height={groupHeight}
        x={labelX - groupWidth / 2}
        y={labelY - groupHeight / 2}
        className="edgebutton-foreignobject overflow-visible"
        requiredExtensions="http://www.w3.org/1999/xhtml"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex items-center justify-center h-full w-full gap-1.5">
          {/* Insert Node Button */}
          <button
            className="w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all hover:scale-110 shadow-sm cursor-pointer z-50"
            onClick={onInsertClick}
            title="Insert Node"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>

          {/* Delete Connection Button — visible on hover */}
          <button
            className={`w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-error hover:border-error transition-all hover:scale-110 shadow-sm cursor-pointer z-50 ${
              hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
            }`}
            onClick={onDeleteClick}
            title="Delete Connection"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      </foreignObject>
    </>
  );
};
