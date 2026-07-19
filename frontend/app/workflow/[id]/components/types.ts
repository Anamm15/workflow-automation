export type BaseNodeData = {
  title: string;
  description: string;
  isConfigured?: boolean;
  config?: Record<string, any>;
};

export type TriggerNodeData = BaseNodeData & {
  triggerType?: "webhook" | "cron";
};

export type ActionNodeData = BaseNodeData & {
  actionType?: "http" | "grpc" | "postgres";
};

export type ConditionNodeData = BaseNodeData & {
  condition?: string;
};
