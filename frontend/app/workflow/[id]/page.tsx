'use client';

import React, { useEffect } from 'react';
import { Header } from '@/features/workflow/components/Header/Header';
import { Sidebar } from '@/features/workflow/components/Sidebar/Sidebar';
import { WorkflowCanvas } from '@/features/workflow/components/Canvas/Canvas';
import { PropertiesPanel } from '@/features/workflow/components/Properties/PropertiesPanel';
import { useWorkflowStore } from '@/features/workflow/store/useWorkflowStore';
import { use } from 'react';
import { toast } from 'sonner';

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const setWorkflowName = useWorkflowStore(state => state.setWorkflowName);

  const loadWorkflowData = useWorkflowStore(state => state.loadWorkflowData);
  const saveDraft = useWorkflowStore(state => state.saveDraft);

  useEffect(() => {
    if (id !== 'new') {
      loadWorkflowData(id);
    }
  }, [id, loadWorkflowData]);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (id !== 'new') {
          try {
            await saveDraft(id);
            toast.success("Draft saved successfully");
          } catch (err) {
            toast.error("Failed to save draft");
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [id, saveDraft]);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground">
      <Header />
      <div className="flex-1 relative flex">
        <Sidebar />
        <WorkflowCanvas />
        <PropertiesPanel />
      </div>
    </div>
  );
}
