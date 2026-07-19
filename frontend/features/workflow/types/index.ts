import { Node, Edge } from '@xyflow/react';

export type WorkflowStatus = 'draft' | 'active' | 'archived';

export interface NodeData extends Record<string, unknown> {
  label: string;
  type: string; // e.g., 'trigger', 'action', 'logic'
  provider: string; // e.g., 'webhook', 'slack', 'delay'
  summary?: string;
  isValid?: boolean;
  config?: Record<string, any>;
  settings?: {
    retry?: boolean;
    maxRetry?: number;
    timeout?: number;
    idempotencyKey?: string;
    continueOnError?: boolean;
  };
}

export type CustomNode = Node<NodeData, 'workflow'>;
export type CustomEdge = Edge;

export interface WorkflowState {
  nodes: CustomNode[];
  edges: CustomEdge[];
  selectedNodeId: string | null;
  workflowName: string;
  status: WorkflowStatus;
  autosaveStatus: 'saved' | 'saving' | 'unsaved';
  isSidebarOpen: boolean;
  isPropertiesOpen: boolean;
  
  // Actions
  setNodes: (nodes: CustomNode[] | ((nodes: CustomNode[]) => CustomNode[])) => void;
  setEdges: (edges: CustomEdge[] | ((edges: CustomEdge[]) => CustomEdge[])) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  addNode: (node: CustomNode) => void;
  removeNode: (nodeId: string) => void;
  removeEdge: (edgeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  insertNodeBetweenEdges: (edgeId: string, newNode: CustomNode) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setWorkflowName: (name: string) => void;
  setStatus: (status: WorkflowStatus) => void;
  setAutosaveStatus: (status: 'saved' | 'saving' | 'unsaved') => void;
  toggleSidebar: () => void;
  toggleProperties: () => void;
  validateWorkflow: () => boolean;
  loadWorkflowData: (id: string) => Promise<void>;
  saveDraft: (id: string) => Promise<void>;
  publishWorkflow: (id: string) => Promise<void>;
  testWorkflow: (id: string) => Promise<void>;
}
