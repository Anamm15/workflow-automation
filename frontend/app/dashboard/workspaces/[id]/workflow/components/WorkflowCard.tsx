"use client";

import Link from "next/link";
import { Settings, Trash2, Play } from "lucide-react";

interface Workflow {
  id: string;
  name: string;
  status: string;
  lastEdited: string;
}

export function WorkflowCard({ wf }: { wf: Workflow }) {
  return (
    <Link href={`/workflow/${wf.id}`}>
      <div className="rounded-[24px] border border-black/5 dark:border-white/10 bg-card/40 p-6 backdrop-blur-xl transition-all hover:bg-card/60 hover:border-black/10 dark:hover:border-white/20 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5 h-full flex flex-col group relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="flex justify-between items-start mb-6">
          <div className="bg-primary/10 text-primary p-3 rounded-2xl">
            <Play size={24} fill="currentColor" className="opacity-80" />
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-500 transition-colors z-10" onClick={(e) => { e.preventDefault(); /* Mock update */ }}>
              <Settings size={16} />
            </button>
            <button className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors z-10" onClick={(e) => { e.preventDefault(); /* Mock delete */ }}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <h3 className="font-semibold text-lg text-foreground mb-2">{wf.name}</h3>

        <div className="mt-auto pt-6 flex items-center justify-between border-t border-black/5 dark:border-white/5">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${wf.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
            wf.status === 'error' ? 'bg-red-500/10 text-red-500' :
              'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400'
            }`}>
            {wf.status.charAt(0).toUpperCase() + wf.status.slice(1)}
          </span>
          <p className="text-xs text-zinc-500">Edited {wf.lastEdited}</p>
        </div>
      </div>
    </Link>
  );
}
