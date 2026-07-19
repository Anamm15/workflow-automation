import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, CircleDashed, Loader2, Sun, Moon, X } from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import clsx from 'clsx';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

export const Header = () => {
  const { 
    workflowName, 
    setWorkflowName, 
    status, 
    autosaveStatus, 
    validateWorkflow,
    saveDraft,
    publishWorkflow,
    testWorkflow
  } = useWorkflowStore();
  
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const id = params.id as string;

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkflowName(e.target.value);
  };

  const handleSaveDraft = async () => {
    if (id === 'new') return;
    setIsSaving(true);
    try {
      await saveDraft(id);
      toast.success("Draft saved successfully");
    } catch (error) {
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const onPublishClick = () => {
    if (!validateWorkflow()) {
      toast.error("Validation failed. Missing trigger or required fields.");
      return;
    }
    setIsPublishModalOpen(true);
  };

  const handleConfirmPublish = async () => {
    if (id === 'new') return;
    setIsPublishing(true);
    try {
      await publishWorkflow(id);
      toast.success("Workflow published successfully!");
      setIsPublishModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to publish workflow. Check for cyclic graphs.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleTestWorkflow = async () => {
    if (id === 'new') return;
    setIsTesting(true);
    try {
      await testWorkflow(id);
      toast.success("Test execution triggered successfully!");
    } catch (error) {
      toast.error("Failed to test workflow execution");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <>
      <header className="h-16 flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/workspaces" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-sm font-medium">
            <ArrowLeft size={16} />
            <span>Workflows</span>
          </Link>
          <div className="w-px h-6 bg-border mx-2" />

          <input
            type="text"
            value={workflowName}
            onChange={handleNameChange}
            className="bg-transparent border-none outline-none text-lg font-semibold text-foreground placeholder-muted-foreground focus:ring-0 min-w-[200px]"
            placeholder="Untitled Workflow"
          />

          <div className="flex items-center gap-2">
            {/* Status Badge */}
            <div className={clsx(
              'px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5',
              status === 'draft' && 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
              status === 'active' && 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
              status === 'archived' && 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
            )}>
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              <span className="capitalize">{status}</span>
            </div>

            {/* Autosave Status */}
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 ml-2">
              {(autosaveStatus === 'saving' || isSaving) && <Loader2 size={12} className="animate-spin" />}
              {autosaveStatus === 'saved' && !isSaving && <CheckCircle2 size={12} />}
              {autosaveStatus === 'unsaved' && !isSaving && <CircleDashed size={12} />}
              <span className="capitalize">{autosaveStatus === 'unsaved' ? 'Unsaved changes' : autosaveStatus}</span>
            </div>
          </div>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}
          <div className="w-px h-6 bg-border mx-1" />
          <button 
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            Save Draft
          </button>
          <button 
            onClick={handleTestWorkflow}
            disabled={isTesting}
            className="px-4 py-2 text-sm font-medium bg-muted text-foreground hover:bg-muted/80 border border-border transition-colors rounded-md shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isTesting && <Loader2 size={14} className="animate-spin" />}
            Test Workflow
          </button>
          <button
            onClick={onPublishClick}
            className="px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary-hover transition-colors rounded-md shadow-sm"
          >
            Publish
          </button>
        </div>
      </header>

      {/* Publish Confirmation Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-[24px] shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-black/5 dark:border-white/5">
              <h2 className="text-xl font-bold text-foreground">Publish Workflow</h2>
              <button 
                onClick={() => setIsPublishModalOpen(false)}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 text-sm text-muted-foreground">
              <p>Are you sure you want to publish this workflow? This will create a new version and perform a validation check for cyclic paths.</p>
            </div>

            <div className="p-4 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5 flex gap-3 justify-end">
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-foreground bg-background hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-black/10 dark:border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPublish}
                disabled={isPublishing}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing && <Loader2 size={16} className="animate-spin" />}
                Confirm Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
