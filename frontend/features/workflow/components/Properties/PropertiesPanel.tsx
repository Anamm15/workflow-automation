import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, SlidersHorizontal, Info } from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

export const PropertiesPanel = () => {
  const { isPropertiesOpen, selectedNodeId, nodes, updateNodeData, toggleProperties } = useWorkflowStore();
  const [activeTab, setActiveTab] = React.useState<'config' | 'settings'>('config');

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (!selectedNode) return null;

  const handleConfigChange = (key: string, value: string) => {
    updateNodeData(selectedNode.id, {
      config: { ...selectedNode.data.config, [key]: value },
      // Mark as valid if this is the only required field (simplification)
      isValid: value.length > 0
    });
  };

  const handleSettingChange = (key: string, value: any) => {
    updateNodeData(selectedNode.id, {
      settings: { ...selectedNode.data.settings, [key]: value }
    });
  };

  return (
    <AnimatePresence>
      {isPropertiesOpen && (
        <motion.aside
          initial={{ x: 360, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 360, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-[360px] h-full bg-card/90 backdrop-blur-xl border-l border-border absolute right-0 top-0 z-40 flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{selectedNode.data.label}</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">{selectedNode.data.provider}</p>
            </div>
            <button
              onClick={toggleProperties}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border px-4">
            <button
              className={`flex items-center gap-2 py-3 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'config' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('config')}
            >
              <SlidersHorizontal size={16} />
              Configuration
            </button>
            <button
              className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={16} />
              Settings
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            {activeTab === 'config' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Credential</label>
                  <select className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="">Select credential...</option>
                    <option value="prod">Production Credential</option>
                    <option value="dev">Development Credential</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Summary</label>
                  <input
                    type="text"
                    value={selectedNode.data.summary || ''}
                    onChange={(e) => updateNodeData(selectedNode.id, { summary: e.target.value })}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/60"
                    placeholder="e.g. POST /api/users"
                  />
                </div>

                {/* Example dynamic field for HTTP Node */}
                {selectedNode.data.provider === 'http' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Method</label>
                      <select 
                        value={selectedNode.data.config?.method || 'GET'}
                        onChange={(e) => handleConfigChange('method', e.target.value)}
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>DELETE</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">URL</label>
                      <input
                        type="text"
                        value={selectedNode.data.config?.url || ''}
                        onChange={(e) => handleConfigChange('url', e.target.value)}
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                        placeholder="https://api.example.com"
                      />
                      <div className="flex items-start gap-1.5 mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                        <Info size={14} className="shrink-0 mt-0.5" />
                        <p>Use {'{{variable}}'} syntax to reference previous outputs.</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Fallback for others */}
                {selectedNode.data.provider !== 'http' && (
                  <div className="p-4 border border-dashed border-border rounded-lg text-center text-sm text-muted-foreground">
                    Dynamic schema fields for {selectedNode.data.provider} would render here.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Retry on Failure</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Automatically retry if node fails</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('retry', !selectedNode.data.settings?.retry)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${selectedNode.data.settings?.retry ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${selectedNode.data.settings?.retry ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                {selectedNode.data.settings?.retry && (
                  <div className="space-y-1.5 pl-4 border-l-2 border-primary/30">
                    <label className="text-sm font-medium text-foreground">Max Retries</label>
                    <input
                      type="number"
                      value={selectedNode.data.settings?.maxRetry || 3}
                      onChange={(e) => handleSettingChange('maxRetry', parseInt(e.target.value))}
                      className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      min={1} max={10}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Continue on Error</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Don't fail the workflow if this node fails</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('continueOnError', !selectedNode.data.settings?.continueOnError)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${selectedNode.data.settings?.continueOnError ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${selectedNode.data.settings?.continueOnError ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
