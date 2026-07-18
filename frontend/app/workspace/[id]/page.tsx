'use client';

import React, { useEffect } from 'react';
import { Header } from '../../../features/workflow/components/Header/Header';
import { Sidebar } from '../../../features/workflow/components/Sidebar/Sidebar';
import { WorkflowCanvas } from '../../../features/workflow/components/Canvas/Canvas';
import { PropertiesPanel } from '../../../features/workflow/components/Properties/PropertiesPanel';
import { useWorkflowStore } from '../../../features/workflow/store/useWorkflowStore';
import { use } from 'react';

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const setWorkflowName = useWorkflowStore(state => state.setWorkflowName);
  
  useEffect(() => {
    // In a real app, you would fetch workflow data here using `id`
    // For now, we just set a mock name based on ID if needed, 
    // but the store already has 'Untitled Workflow'.
    if (id !== 'new') {
      setWorkflowName(`Workflow ${id}`);
    }
  }, [id, setWorkflowName]);

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
