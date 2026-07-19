import { create } from 'zustand';
import {
  Connection,
  EdgeChange,
  NodeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType
} from '@xyflow/react';
import { WorkflowState, CustomNode, CustomEdge } from '../types';
import { api } from '@/lib/api';

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  workflowName: 'Untitled Workflow',
  status: 'draft',
  autosaveStatus: 'saved',
  isSidebarOpen: true,
  isPropertiesOpen: false,

  setNodes: (nodes) => set((state) => ({ 
    nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes 
  })),

  setEdges: (edges) => set((state) => ({ 
    edges: typeof edges === 'function' ? edges(state.edges) : edges 
  })),

  onNodesChange: (changes: NodeChange<CustomNode>[]) => {
    set((state) => {
      const newNodes = applyNodeChanges(changes, state.nodes) as CustomNode[];
      
      // If a selected node is deleted, close properties
      let propertiesOpen = state.isPropertiesOpen;
      let selectedNodeId = state.selectedNodeId;
      if (changes.some(c => c.type === 'remove' && c.id === state.selectedNodeId)) {
        propertiesOpen = false;
        selectedNodeId = null;
      }
      
      return { 
        nodes: newNodes,
        isPropertiesOpen: propertiesOpen,
        selectedNodeId: selectedNodeId
      };
    });
  },

  onEdgesChange: (changes: EdgeChange<CustomEdge>[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges) as CustomEdge[],
    });
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge({ 
        ...connection, 
        type: 'insert',
        markerEnd: { type: MarkerType.ArrowClosed }
      }, get().edges) as CustomEdge[],
    });
  },

  addNode: (node: CustomNode) => {
    set({
      nodes: [...get().nodes, node],
    });
  },

  removeNode: (nodeId: string) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      isPropertiesOpen: state.selectedNodeId === nodeId ? false : state.isPropertiesOpen
    }));
  },

  removeEdge: (edgeId: string) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
    }));
  },

  updateNodeData: (nodeId: string, data: any) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      }),
      autosaveStatus: 'unsaved'
    }));
  },

  insertNodeBetweenEdges: (edgeId: string, newNode: CustomNode) => {
    const { edges, nodes } = get();
    const oldEdge = edges.find((e) => e.id === edgeId);
    if (!oldEdge) return;

    const sourceNode = nodes.find(n => n.id === oldEdge.source);
    const targetNode = nodes.find(n => n.id === oldEdge.target);

    // Default position if calculating fails
    let position = { x: 0, y: 0 };
    if (sourceNode && targetNode) {
      position = {
        x: sourceNode.position.x + (targetNode.position.x - sourceNode.position.x) / 2,
        y: sourceNode.position.y + (targetNode.position.y - sourceNode.position.y) / 2,
      };
    }
    
    const nodeWithPos = { ...newNode, position };

    const newEdges: CustomEdge[] = [
      {
        id: `e-${oldEdge.source}-${newNode.id}`,
        source: oldEdge.source,
        target: newNode.id,
        sourceHandle: oldEdge.sourceHandle,
        type: 'insert',
        markerEnd: { type: MarkerType.ArrowClosed }
      },
      {
        id: `e-${newNode.id}-${oldEdge.target}`,
        source: newNode.id,
        target: oldEdge.target,
        targetHandle: oldEdge.targetHandle,
        type: 'insert',
        markerEnd: { type: MarkerType.ArrowClosed }
      }
    ];

    set({
      nodes: [...nodes, nodeWithPos],
      edges: [...edges.filter((e) => e.id !== edgeId), ...newEdges],
    });
  },

  setSelectedNode: (nodeId: string | null) => {
    set({
      selectedNodeId: nodeId,
      isPropertiesOpen: !!nodeId
    });
  },

  setWorkflowName: (name: string) => {
    set({ workflowName: name, autosaveStatus: 'unsaved' });
  },

  setStatus: (status: 'draft' | 'active' | 'archived') => {
    set({ status });
  },

  setAutosaveStatus: (status: 'saved' | 'saving' | 'unsaved') => {
    set({ autosaveStatus: status });
  },

  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  toggleProperties: () => {
    set((state) => ({ isPropertiesOpen: !state.isPropertiesOpen }));
  },

  validateWorkflow: () => {
    const { nodes } = get();
    // Validate trigger exists
    const hasTrigger = nodes.some(n => n.data.type === 'trigger');
    if (!hasTrigger) return false;
    
    // Check if nodes are disconnected (except trigger)
    // Complex validation would go here. For now, simple true if there are nodes.
    return nodes.length > 0;
  },

  loadWorkflowData: async (id: string) => {
    try {
      const res = await api.get(`/workflows/${id}`);
      const data = res.data.data;
      if (data) {
        set({ workflowName: data.name, status: data.status });
        if (data.draft_json && typeof data.draft_json === 'object') {
          const draft = data.draft_json;
          if (draft.nodes) set({ nodes: draft.nodes });
          if (draft.edges) set({ edges: draft.edges });
        }
      }
    } catch (error) {
      console.error("Failed to load workflow data", error);
    }
  },

  saveDraft: async (id: string) => {
    const { nodes, edges, workflowName } = get();
    set({ autosaveStatus: 'saving' });
    try {
      await api.patch(`/workflows/${id}`, {
        name: workflowName,
        draft_json: { nodes, edges }
      });
      set({ autosaveStatus: 'saved' });
    } catch (error) {
      console.error("Failed to save draft", error);
      set({ autosaveStatus: 'unsaved' });
      throw error;
    }
  },

  publishWorkflow: async (id: string) => {
    try {
      await api.post(`/workflows/${id}/publish`);
      set({ status: 'active' });
    } catch (error) {
      console.error("Failed to publish workflow", error);
      throw error;
    }
  },

  testWorkflow: async (id: string) => {
    try {
      await api.post(`/workflows/${id}/test`, { payload: {} });
    } catch (error) {
      console.error("Failed to test workflow", error);
      throw error;
    }
  }
}));
