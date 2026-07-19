"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ArrowLeft, Settings, X, Loader2, AlertCircle } from "lucide-react";
import { WorkflowCard } from "./WorkflowCard";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Workflow {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function WorkflowListClient({ workspaceId }: { workspaceId: string }) {
  const queryClient = useQueryClient();

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [workflowToEdit, setWorkflowToEdit] = useState<Workflow | null>(null);
  const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Fetch workflows
  const { data: workflows, isLoading, error } = useQuery({
    queryKey: ['workflows', workspaceId],
    queryFn: async () => {
      const res = await api.get(`/workflows?workspace_id=${workspaceId}`);
      return res.data.data as Workflow[];
    }
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (data: { workspace_id: string; name: string; description: string }) => {
      const res = await api.post('/workflows', data);
      return res.data.data as Workflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows', workspaceId] });
      toast.success("Workflow created successfully");
      closeCreateModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create workflow");
    }
  });

  // Edit Mutation
  const editMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; description: string }) => {
      const res = await api.patch(`/workflows/${data.id}`, {
        name: data.name,
        description: data.description,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows', workspaceId] });
      toast.success("Workflow updated successfully");
      closeEditModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update workflow");
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/workflows/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows', workspaceId] });
      toast.success("Workflow deleted successfully");
      setWorkflowToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete workflow");
      setWorkflowToDelete(null);
    }
  });

  const openCreateModal = () => {
    setName("");
    setDescription("");
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
  };

  const openEditModal = (wf: Workflow) => {
    setWorkflowToEdit(wf);
    setName(wf.name);
    setDescription(wf.description || "");
  };

  const closeEditModal = () => {
    setWorkflowToEdit(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ workspace_id: workspaceId, name, description });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workflowToEdit || !name.trim()) return;
    editMutation.mutate({ id: workflowToEdit.id, name, description });
  };

  const handleDelete = () => {
    if (!workflowToDelete) return;
    deleteMutation.mutate(workflowToDelete.id);
  };

  return (
    <div className="flex h-full w-full flex-col relative">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <Link
              href="/dashboard/workspaces"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" /> Back to Workspaces
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Workflows
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage workflows for Workspace {workspaceId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={openCreateModal}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors"
            >
              <Plus size={18} />
              Create Workflow
            </button>
          </div>
        </div>

        {/* Workflow Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 flex-col gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-muted-foreground animate-pulse">Loading workflows...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">
            Failed to load workflows. Please try again.
          </div>
        ) : !workflows || workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-black/10 dark:border-white/10 rounded-3xl">
            <h3 className="text-xl font-semibold text-foreground mb-2">No workflows yet</h3>
            <p className="text-muted-foreground mb-6">Create your first workflow to automate tasks.</p>
            <button 
              onClick={openCreateModal}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors"
            >
              <Plus size={18} />
              Create Workflow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {workflows.map((wf) => (
              <WorkflowCard 
                key={wf.id} 
                wf={wf} 
                onEdit={openEditModal} 
                onDelete={setWorkflowToDelete} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Settings Button */}
      <button 
        className="fixed bottom-8 right-8 p-4 bg-foreground text-background rounded-full shadow-2xl hover:scale-110 transition-transform z-40 flex items-center justify-center"
        title="Workspace Settings"
        onClick={() => toast("Workspace global settings clicked!")}
      >
        <Settings size={24} />
      </button>

      {/* Create / Edit Modal */}
      {(isCreateOpen || workflowToEdit) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-[24px] shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-black/5 dark:border-white/5">
              <h2 className="text-xl font-bold text-foreground">
                {isCreateOpen ? "Create Workflow" : "Edit Workflow"}
              </h2>
              <button 
                onClick={isCreateOpen ? closeCreateModal : closeEditModal}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={isCreateOpen ? handleCreate : handleEdit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                    Workflow Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. User Onboarding"
                    className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
                    Description <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe what this workflow does..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground resize-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={isCreateOpen ? closeCreateModal : closeEditModal}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={(isCreateOpen ? createMutation.isPending : editMutation.isPending) || !name.trim()}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(isCreateOpen ? createMutation.isPending : editMutation.isPending) && <Loader2 size={16} className="animate-spin" />}
                  {isCreateOpen ? "Create" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {workflowToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-[24px] shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-500 mb-4 mx-auto">
                <AlertCircle size={24} />
              </div>
              <h2 className="text-xl font-bold text-foreground text-center mb-2">Delete Workflow?</h2>
              <p className="text-center text-muted-foreground text-sm">
                Are you sure you want to delete <strong className="text-foreground">{workflowToDelete.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="p-4 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5 flex gap-3 justify-end">
              <button
                onClick={() => setWorkflowToDelete(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-foreground bg-background hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-black/10 dark:border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium shadow-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
