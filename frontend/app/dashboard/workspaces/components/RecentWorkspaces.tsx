import { fetchRecentWorkspaces } from "../data/mockData";
import { RecentWorkspaceCard } from "./RecentWorkspaceCard";

export async function RecentWorkspaces() {
  const workspaces = await fetchRecentWorkspaces();

  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold text-foreground mb-4">Jump back in</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((workspace) => (
          <RecentWorkspaceCard key={workspace.id} workspace={workspace} />
        ))}
      </div>
    </div>
  );
}

export function RecentWorkspacesSkeleton() {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold text-foreground mb-4">Jump back in</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col justify-between overflow-hidden rounded-[20px] border border-black/5 dark:border-white/5 bg-card/20 p-6 backdrop-blur-md animate-pulse min-h-[160px]"
          >
            <div className="flex gap-3">
              <div className="h-12 w-12 rounded-xl bg-black/10 dark:bg-white/10" />
              <div className="flex flex-col gap-2 flex-1 pt-1">
                <div className="h-4 w-32 bg-black/10 dark:bg-white/10 rounded-full" />
                <div className="h-3 w-16 bg-black/10 dark:bg-white/10 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-8 w-8 rounded-full bg-black/10 dark:bg-white/10 ring-2 ring-white dark:ring-[#0a0a0b]" />
                ))}
              </div>
              <div className="h-3 w-20 bg-black/10 dark:bg-white/10 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
