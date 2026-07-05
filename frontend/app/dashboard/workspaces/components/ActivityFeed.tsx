import { fetchActivityFeed } from "../data/mockData";
import { Clock } from "lucide-react";

export async function ActivityFeed() {
  const activities = await fetchActivityFeed();

  return (
    <div className="rounded-[20px] border border-black/5 dark:border-white/10 bg-card/40 p-6 backdrop-blur-xl h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Clock size={18} className="text-zinc-500 dark:text-zinc-400" />
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
      </div>

      <div className="flex flex-col gap-6 relative before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-black/10 dark:before:bg-white/5 flex-1">
        {activities.map((activity, i) => (
          <div key={activity.id} className="relative flex gap-4">
            <div className="relative mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-card ring-4 ring-white dark:ring-[#0a0a0b] z-10">
              <div className="h-2 w-2 rounded-full bg-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                <span className="font-semibold text-foreground">{activity.user}</span> {activity.action}
              </p>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="truncate max-w-[120px]">{activity.workspaceName}</span>
                <span>•</span>
                <span>{activity.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityFeedSkeleton() {
  return (
    <div className="rounded-[20px] border border-black/5 dark:border-white/5 bg-card/20 p-6 backdrop-blur-md h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-5 w-5 bg-black/10 dark:bg-white/10 rounded-full animate-pulse" />
        <div className="h-6 w-32 bg-black/10 dark:bg-white/10 rounded-full animate-pulse" />
      </div>

      <div className="flex flex-col gap-6 relative before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-black/10 dark:before:bg-white/5 flex-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="relative flex gap-4">
            <div className="relative mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-card ring-4 ring-white dark:ring-[#0a0a0b] z-10 animate-pulse">
              <div className="h-2 w-2 rounded-full bg-black/10 dark:bg-white/10" />
            </div>
            <div className="flex flex-col gap-2 flex-1 pt-1">
              <div className="h-4 w-3/4 bg-black/10 dark:bg-white/10 rounded-full animate-pulse" />
              <div className="h-3 w-1/2 bg-black/10 dark:bg-white/10 rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
