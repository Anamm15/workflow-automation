"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AddWorkspaceModal } from "@/components/modals/AddWorkspaceModal";

export function Header() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Workspaces</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your environments, team members, and workflows.
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:bg-primary-hover hover:shadow-primary/50"
        >
          <Plus size={18} />
          New Workspace
        </button>
      </div>

      <AddWorkspaceModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </>
  );
}
