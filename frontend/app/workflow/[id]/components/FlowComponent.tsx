"use client";

import { useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  getOutgoers,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TriggerNode } from "./TriggerNode";
import { ActionNode } from "./ActionNode";
import { ConditionNode } from "./ConditionNode";
import { ConfigurationDrawer } from "./ConfigurationDrawer";
import { serializeWorkflow } from "@/lib/workflow-serializer";

// Register custom nodes
const nodeTypes = {
  triggerNode: TriggerNode,
  actionNode: ActionNode,
  conditionNode: ConditionNode,
};

// Initial setup with the new types
const initialNodes: Node[] = [
  {
    id: "1",
    type: "triggerNode",
    position: { x: 350, y: 100 },
    data: {
      title: "Webhook Trigger",
      description: "Listens for incoming webhooks.",
      isConfigured: true,
      config: { url: "/api/webhook/123" }
    },
  },
  {
    id: "2",
    type: "actionNode",
    position: { x: 350, y: 300 },
    data: {
      title: "Process Data",
      description: "Runs an HTTP action.",
      isConfigured: false,
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
    style: { stroke: "#60a5fa", strokeWidth: 2 },
    type: "smoothstep",
  },
];

function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition, getNode, getNodes, getEdges } = useReactFlow();
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            type: "smoothstep",
            style: { stroke: "#60a5fa", strokeWidth: 2 },
          },
          eds
        )
      ),
    [setEdges]
  );

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      const targetNode = getNode(connection.target);
      // Rule 1: Trigger nodes cannot have incoming connections
      if (targetNode?.type === "triggerNode") {
        return false;
      }

      // Rule 2: Prevent Circular Dependencies (Strict DAG)
      const nodesMap = getNodes();
      const edgesMap = getEdges();
      const target = nodesMap.find((node) => node.id === connection.target);
      
      const hasCycle = (node: Node, visited = new Set()): boolean => {
        if (visited.has(node.id)) return false;
        visited.add(node.id);

        for (const outgoer of getOutgoers(node, nodesMap, edgesMap)) {
          if (outgoer.id === connection.source) return true;
          if (hasCycle(outgoer, visited)) return true;
        }
        return false;
      };

      if (target && hasCycle(target)) {
        return false;
      }

      return true;
    },
    [getNode, getNodes, getEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const dataString = event.dataTransfer.getData("application/reactflow");
      
      if (!dataString || !reactFlowBounds) {
        return;
      }

      const { type, title, description } = JSON.parse(dataString);

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: { 
          title: title || "New Node", 
          description: description || "Node description.",
          isConfigured: false,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onUpdateNode = useCallback((id: string, newData: any) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return { ...n, data: newData };
        }
        return n;
      })
    );
  }, [setNodes]);

  const handleExport = () => {
    const dag = serializeWorkflow(nodes, edges);
    console.log("Exported Workflow JSON:", JSON.stringify(dag, null, 2));
    alert("Workflow exported! Check browser console for the JSON payload.");
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  return (
    <div className="w-full h-full relative overflow-hidden" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={() => setSelectedNodeId(null)}
        nodeTypes={nodeTypes}
        fitView
        colorMode="dark"
        className="bg-slate-950" // Deep space slate
      >
        <Background variant={BackgroundVariant.Lines} gap={24} size={1} color="#334155" />
        <Controls 
          className="bg-slate-900/50 border-white/10 backdrop-blur-md fill-slate-300"
        />
        <MiniMap 
          nodeColor={(n) => {
            if (n.data.isConfigured) return "#22c55e";
            return "#ef4444";
          }}
          maskColor="rgba(2, 6, 23, 0.7)"
          className="bg-slate-900/50 border-white/10 backdrop-blur-md"
        />
      </ReactFlow>

      {/* Export Button */}
      <button 
        onClick={handleExport}
        className="absolute bottom-6 right-6 z-10 bg-slate-100 hover:bg-white text-slate-900 font-semibold py-2 px-4 rounded-lg shadow-lg shadow-white/10 transition-all"
      >
        Export Workflow
      </button>

      {/* Configuration Drawer */}
      <ConfigurationDrawer 
        selectedNode={selectedNode}
        onClose={() => setSelectedNodeId(null)}
        onUpdateNode={onUpdateNode}
      />
    </div>
  );
}

export function FlowComponent() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
