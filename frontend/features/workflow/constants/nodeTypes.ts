import { LucideIcon, Zap, Globe, Mail, MessageSquare, Clock, GitBranch, Repeat } from 'lucide-react';

export type NodeCategory = 'Trigger' | 'Actions' | 'Logic';

export interface NodeTemplate {
  type: string;
  provider: string;
  title: string;
  description: string;
  category: NodeCategory;
  icon: any; // We'll cast to LucideIcon in UI
  color: string;
  defaultConfig?: Record<string, any>;
}

export const NODE_TEMPLATES: NodeTemplate[] = [
  // Triggers
  {
    type: 'trigger',
    provider: 'webhook',
    title: 'Webhook',
    description: 'Trigger workflow via HTTP request',
    category: 'Trigger',
    icon: Zap,
    color: 'bg-indigo-500',
  },
  {
    type: 'trigger',
    provider: 'schedule',
    title: 'Schedule',
    description: 'Run on a set interval or cron',
    category: 'Trigger',
    icon: Clock,
    color: 'bg-emerald-500',
  },
  
  // Actions
  {
    type: 'action',
    provider: 'http',
    title: 'HTTP Request',
    description: 'Make a REST API call',
    category: 'Actions',
    icon: Globe,
    color: 'bg-blue-500',
  },
  {
    type: 'action',
    provider: 'email',
    title: 'Send Email',
    description: 'Send an email via SMTP',
    category: 'Actions',
    icon: Mail,
    color: 'bg-rose-500',
  },
  {
    type: 'action',
    provider: 'slack',
    title: 'Slack Message',
    description: 'Post a message to Slack',
    category: 'Actions',
    icon: MessageSquare,
    color: 'bg-violet-500',
  },

  // Logic
  {
    type: 'logic',
    provider: 'if',
    title: 'If / Else',
    description: 'Branch based on conditions',
    category: 'Logic',
    icon: GitBranch,
    color: 'bg-amber-500',
  },
  {
    type: 'logic',
    provider: 'delay',
    title: 'Delay',
    description: 'Wait for a specific duration',
    category: 'Logic',
    icon: Clock,
    color: 'bg-amber-500',
  },
  {
    type: 'logic',
    provider: 'loop',
    title: 'Loop',
    description: 'Iterate over an array of items',
    category: 'Logic',
    icon: Repeat,
    color: 'bg-amber-500',
  }
];
