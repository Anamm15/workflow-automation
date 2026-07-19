import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, CircleDashed, Loader2, Sun, Moon } from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import clsx from 'clsx';
import Link from 'next/link';
import { useTheme } from 'next-themes';

export const Header = () => {
  const { workflowName, setWorkflowName, status, autosaveStatus, validateWorkflow } = useWorkflowStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkflowName(e.target.value);
  };

  const handleBlur = () => {
    // Autosave triggers on blur
    useWorkflowStore.getState().setAutosaveStatus('saving');
    setTimeout(() => {
      useWorkflowStore.getState().setAutosaveStatus('saved');
    }, 800);
  };

  const onPublish = () => {
    if (!validateWorkflow()) {
      alert("Validation failed. Missing trigger or required fields.");
      return;
    }
    useWorkflowStore.getState().setStatus('active');
    alert("Workflow published successfully!");
  };

  return (
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
          onBlur={handleBlur}
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
            {autosaveStatus === 'saving' && <Loader2 size={12} className="animate-spin" />}
            {autosaveStatus === 'saved' && <CheckCircle2 size={12} />}
            {autosaveStatus === 'unsaved' && <CircleDashed size={12} />}
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
        <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
          Save Draft
        </button>
        <button className="px-4 py-2 text-sm font-medium bg-muted text-foreground hover:bg-muted/80 border border-border transition-colors rounded-md shadow-sm">
          Test Workflow
        </button>
        <button
          onClick={onPublish}
          className="px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary-hover transition-colors rounded-md shadow-sm"
        >
          Publish
        </button>
      </div>
    </header>
  );
};
