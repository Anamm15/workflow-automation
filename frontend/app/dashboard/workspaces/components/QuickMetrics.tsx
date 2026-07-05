import { fetchMetrics } from "../data/mockData";
import { Layers, Users, Mailbox, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

function MetricCard({
  title,
  value,
  icon: Icon,
  className,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] border border-black/5 dark:border-white/10 bg-card/40 p-6 backdrop-blur-xl transition-all duration-300 hover:bg-card/60 hover:border-black/10 dark:hover:border-white/20",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</h3>
        <div className="rounded-full bg-black/5 dark:bg-white/5 p-2.5 text-zinc-600 dark:text-zinc-300">
          <Icon size={18} />
        </div>
      </div>
      <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

export async function QuickMetrics() {
  const metrics = await fetchMetrics();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      <MetricCard title="Total Workspaces" value={metrics.totalWorkspaces} icon={Layers} />
      <MetricCard title="Active Members" value={metrics.activeMembers} icon={Users} />
      <MetricCard title="Pending Invites" value={metrics.pendingInvites} icon={Mailbox} />
      <MetricCard title="Resource Usage" value={`${metrics.resourceUsage}%`} icon={Activity} />
    </div>
  );
}

export function QuickMetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-[20px] border border-black/5 dark:border-white/5 bg-card/20 p-6 backdrop-blur-md animate-pulse h-[118px]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-24 bg-black/10 dark:bg-white/10 rounded-full" />
            <div className="h-9 w-9 bg-black/10 dark:bg-white/10 rounded-full" />
          </div>
          <div className="h-8 w-16 bg-black/10 dark:bg-white/10 rounded-full" />
        </div>
      ))}
    </div>
  );
}
