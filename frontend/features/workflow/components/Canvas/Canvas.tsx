import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '../../store/useWorkflowStore';
import { WorkflowNode } from '../Nodes/WorkflowNode';
import { InsertEdge } from '../Edges/InsertEdge';
import { NODE_TEMPLATES } from '../../constants/nodeTypes';
import { PlusCircle } from 'lucide-react';
import { useParams } from 'next/navigation';

const nodeTypes: import('@xyflow/react').NodeTypes = {
  workflow: WorkflowNode as any,
};

const edgeTypes = {
  insert: InsertEdge,
};

const WorkflowCanvasInner = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNode,
    isSidebarOpen
  } = useWorkflowStore();
  
  const { screenToFlowPosition, getViewport, setViewport } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const params = useParams();
  const id = params?.id as string;
  const [hasSavedViewport, setHasSavedViewport] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      const saved = localStorage.getItem(`workflow-viewport-${id}`);
      if (saved) setHasSavedViewport(true);
    }
  }, [id]);

  const onMoveEnd = useCallback(() => {
    if (id && id !== 'new') {
      const viewport = getViewport();
      localStorage.setItem(`workflow-viewport-${id}`, JSON.stringify(viewport));
    }
  }, [id, getViewport]);

  const onInit = useCallback(() => {
    if (id && id !== 'new') {
      const savedViewport = localStorage.getItem(`workflow-viewport-${id}`);
      if (savedViewport) {
        try {
          const viewport = JSON.parse(savedViewport);
          // Wait a tick for xyflow to be fully ready before restoring
          setTimeout(() => {
            setViewport(viewport);
          }, 50);
        } catch (e) {
          console.error("Failed to parse saved viewport", e);
        }
      }
    }
  }, [id, setViewport]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const payloadString = event.dataTransfer.getData('application/reactflow');
      
      if (!payloadString || !reactFlowBounds) return;
      
      const payload = JSON.parse(payloadString);
      const template = NODE_TEMPLATES.find(t => t.provider === payload.provider);
      if (!template) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: import('../../types').CustomNode = {
        id: `node-${Date.now()}`,
        type: 'workflow',
        position,
        data: {
          label: template.title,
          type: template.type,
          provider: template.provider,
          isValid: false, // Initially false until config is set
          config: template.defaultConfig || {},
          settings: {}
        },
      };

      addNode(newNode);
    },
    [screenToFlowPosition, addNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: import('@xyflow/react').Node) => {
    setSelectedNode(node.id);
  }, [setSelectedNode]);

  return (
    <div className="flex-1 h-full relative bg-background" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        onMoveEnd={onMoveEnd}
        onInit={onInit}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'insert' }}
        fitView={!hasSavedViewport}
        className="workflow-canvas"
      >
        <Background 
          variant={BackgroundVariant.Lines} 
          gap={24} 
          size={1} 
          color="rgba(59, 130, 246, 0.2)" 
        />
        <Controls 
          className="bg-card border-border fill-foreground rounded-lg shadow-sm overflow-hidden" 
          position="bottom-right"
          showInteractive={false}
        />
        <MiniMap 
          nodeColor={(n) => {
            if (n.data?.type === 'trigger') return '#6366f1';
            if (n.data?.type === 'action') return '#3b82f6';
            if (n.data?.type === 'logic') return '#f59e0b';
            return '#71717a';
          }}
          maskColor="rgba(0, 0, 0, 0.5)"
          className="bg-card/50 border border-border rounded-lg shadow-sm"
          position="bottom-left"
        />

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="bg-card/80 backdrop-blur-sm border border-border p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <PlusCircle size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Build your workflow</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop nodes from the {isSidebarOpen ? 'left panel' : 'sidebar'} to get started, or click the canvas.
              </p>
            </div>
          </div>
        )}
      </ReactFlow>
    </div>
  );
};

export const WorkflowCanvas = () => (
  <ReactFlowProvider>
    <WorkflowCanvasInner />
  </ReactFlowProvider>
);
