import React, { useState } from 'react';
import { Search, GripVertical } from 'lucide-react';
import { NODE_TEMPLATES } from '../../constants/nodeTypes';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar = () => {
  const { isSidebarOpen } = useWorkflowStore();
  const [searchTerm, setSearchTerm] = useState('');

  const onDragStart = (event: React.DragEvent, nodeType: string, provider: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, provider }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredNodes = NODE_TEMPLATES.filter(node => 
    node.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    node.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedNodes = filteredNodes.reduce((acc, node) => {
    if (!acc[node.category]) acc[node.category] = [];
    acc[node.category].push(node);
    return acc;
  }, {} as Record<string, typeof NODE_TEMPLATES>);

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.aside
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-80 h-full bg-card/80 backdrop-blur-xl border-r border-border absolute left-0 top-0 z-40 flex flex-col shadow-xl"
        >
          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Node List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {Object.entries(groupedNodes).map(([category, nodes]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                  {category}
                </h3>
                <div className="space-y-2">
                  {nodes.map((node) => {
                    const Icon = node.icon;
                    return (
                      <div
                        key={node.provider}
                        draggable
                        onDragStart={(e) => onDragStart(e, node.type, node.provider)}
                        className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
                      >
                        <div className={`mt-0.5 w-8 h-8 rounded-md flex items-center justify-center text-white shrink-0 ${node.color} shadow-sm group-hover:scale-105 transition-transform`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground truncate">{node.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{node.description}</p>
                        </div>
                        <GripVertical size={14} className="text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredNodes.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No nodes found for "{searchTerm}"
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
