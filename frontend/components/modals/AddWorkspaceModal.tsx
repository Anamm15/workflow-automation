"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useAddWorkspace } from "@/app/dashboard/workspaces/hooks/useWorkspaceApi";
import { toast } from "sonner";

interface AddWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddWorkspaceModal({ isOpen, onClose }: AddWorkspaceModalProps) {
  const [name, setName] = useState("");
  const addWorkspace = useAddWorkspace();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addWorkspace.mutate(name, {
      onSuccess: () => {
        toast.success("Workspace created successfully!");
        setName("");
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error?.message || "Failed to create workspace");
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-black/5 dark:border-white/10 bg-white/70 dark:bg-card/40 p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">New Workspace</h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10 dark:text-zinc-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="workspace-name" className="text-sm font-medium text-foreground">
                  Workspace Name
                </label>
                <input
                  id="workspace-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marketing Team, Engineering..."
                  className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/20 px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || addWorkspace.isPending}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addWorkspace.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
