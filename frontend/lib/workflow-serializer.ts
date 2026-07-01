import { Node, Edge } from "@xyflow/react";

export interface WorkflowDAG {
  nodes: {
    id: string;
    type: string;
    data: Record<string, any>;
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
  }[];
}

export function serializeWorkflow(nodes: Node[], edges: Edge[]): WorkflowDAG {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type || "unknown",
      data: node.data,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    })),
  };
}
