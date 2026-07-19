"use client";

import Link from "next/link";
import { Settings, Trash2, Play } from "lucide-react";

interface Workflow {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface WorkflowCardProps {
  wf: Workflow;
  onEdit: (wf: Workflow) => void;
  onDelete: (wf: Workflow) => void;
}

export function WorkflowCard({ wf, onEdit, onDelete }: WorkflowCardProps) {
  const lastEdited = new Date(wf.updated_at).toLocaleDateString();

  return (
    <div className="rounded-[24px] border border-black/5 dark:border-white/10 bg-card/40 p-6 backdrop-blur-xl transition-all hover:bg-card/60 hover:border-black/10 dark:hover:border-white/20 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 h-full flex flex-col group relative overflow-hidden">
      <Link href={`/workflow/${wf.id}`} className="absolute inset-0 z-0" />

      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity z-0" />

      <div className="flex justify-between items-start mb-6 z-10 relative pointer-events-none">
        <div className="bg-primary/10 text-primary p-3 rounded-2xl pointer-events-auto">
          <Play size={24} fill="currentColor" className="opacity-80" />
        </div>
        <div className="flex gap-2 pointer-events-auto">
          <button
            className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-zinc-500 transition-colors"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(wf); }}
          >
            <Settings size={16} />
          </button>
          <button
            className="p-2 rounded-full bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-colors"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(wf); }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <h3 className="font-semibold text-lg text-foreground mb-2 z-10 relative pointer-events-none">{wf.name}</h3>
      {wf.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 z-10 relative pointer-events-none">{wf.description}</p>
      )}

      <div className="mt-auto pt-6 flex items-center justify-between border-t border-black/5 dark:border-white/5 z-10 relative pointer-events-none">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${wf.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
            wf.status === 'error' ? 'bg-red-500/10 text-red-500' :
              'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400'
          }`}>
          {wf.status.charAt(0).toUpperCase() + wf.status.slice(1)}
        </span>
        <p className="text-xs text-zinc-500">Edited {lastEdited}</p>
      </div>
    </div>
  );
}
