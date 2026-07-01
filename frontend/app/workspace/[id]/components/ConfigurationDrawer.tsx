"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Node } from "@xyflow/react";

interface ConfigurationDrawerProps {
  selectedNode: Node | null;
  onClose: () => void;
  onUpdateNode: (id: string, newData: any) => void;
}

export function ConfigurationDrawer({ selectedNode, onClose, onUpdateNode }: ConfigurationDrawerProps) {
  if (!selectedNode) return null;

  const data = selectedNode.data as any;

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const url = formData.get("url") as string;
    
    // We update the node and set isConfigured to true if essential fields exist.
    const isConfigured = !!title && (selectedNode.type === "triggerNode" || selectedNode.type === "actionNode" ? !!url : true);

    onUpdateNode(selectedNode.id, {
      ...data,
      title,
      isConfigured,
      config: { url }
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="absolute right-0 top-0 h-full w-80 bg-slate-900/80 backdrop-blur-xl border-l border-white/10 z-30 shadow-2xl flex flex-col pointer-events-auto"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-slate-100">Configure Node</h2>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors rounded hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 flex flex-col gap-4 flex-1">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-medium">Node Type</label>
            <div className="text-sm text-slate-200 capitalize bg-slate-800/50 p-2 rounded-md border border-white/5">
              {selectedNode.type?.replace("Node", "")}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-medium">Title</label>
            <input 
              name="title"
              defaultValue={data.title}
              className="w-full bg-slate-950 border border-white/10 rounded-md px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g., Fetch Users"
            />
          </div>

          {(selectedNode.type === "actionNode" || selectedNode.type === "triggerNode") && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-medium">Webhook / API URL</label>
              <input 
                name="url"
                defaultValue={data.config?.url || ""}
                className="w-full bg-slate-950 border border-white/10 rounded-md px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500 transition-colors"
                placeholder="https://api.example.com/v1"
              />
            </div>
          )}

          <div className="mt-auto">
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-md py-2 text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}
