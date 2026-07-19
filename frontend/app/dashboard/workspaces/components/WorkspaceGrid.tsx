import { fetchWorkspaces } from "../data/mockData";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns";
import Link from "next/link";

export async function WorkspaceGrid({ searchParams }: { searchParams: { search?: string; status?: string; view?: string } }) {
  const search = searchParams.search || "";
  const status = searchParams.status || "all";
  const view = searchParams.view || "grid";

  const workspaces = await fetchWorkspaces(search, status);

  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-card/10 py-20">
        <h3 className="text-lg font-medium text-foreground">No workspaces found</h3>
        <p className="text-sm text-zinc-500 mt-2">Try adjusting your search or filters.</p>
      </div>
    );
  }

    if (view === "list") {
    return (
      <div className="rounded-[20px] border border-black/5 dark:border-white/10 bg-card/40 backdrop-blur-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/5 dark:bg-white/5 text-zinc-500 dark:text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Members</th>
              <th className="px-6 py-4 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {workspaces.map((w) => (
              <tr key={w.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">
                  <Link href={`/dashboard/workspaces/${w.id}/workflow`} className="hover:underline">
                    {w.name}
                  </Link>
                </td>
                <td className="px-6 py-4 capitalize text-zinc-700 dark:text-zinc-300">{w.role}</td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                      w.status === "active" ? "bg-emerald-500/10 text-emerald-500" :
                      w.status === "invited" ? "bg-amber-500/10 text-amber-500" : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
                    )}
                  >
                    {w.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{w.membersCount}</td>
                <td className="px-6 py-4 text-zinc-500">
                  {formatDistanceToNow(parseISO(w.createdAt), { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {workspaces.map((w) => (
        <Link key={w.id} href={`/dashboard/workspaces/${w.id}/workflow`}>
          <div
            className="rounded-[20px] border border-black/5 dark:border-white/10 bg-card/40 p-5 backdrop-blur-xl transition-colors hover:bg-card/60 hover:border-black/10 dark:hover:border-white/20 h-full flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-foreground truncate">{w.name}</h3>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                  w.status === "active" ? "bg-emerald-500/10 text-emerald-500" :
                  w.status === "invited" ? "bg-amber-500/10 text-amber-500" : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
                )}
              >
                {w.status}
              </span>
            </div>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5 dark:border-white/5">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">{w.role}</p>
              <p className="text-xs text-zinc-500">{w.membersCount} members</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function WorkspaceGridSkeleton({ view }: { view?: string }) {
  if (view === "list") {
    return (
      <div className="rounded-[20px] border border-black/5 dark:border-white/10 bg-card/40 backdrop-blur-xl overflow-hidden">
        <div className="h-12 bg-black/5 dark:bg-white/5 w-full" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex h-16 w-full items-center px-6 border-t border-black/5 dark:border-white/5">
            <div className="h-4 w-1/4 bg-black/10 dark:bg-white/10 rounded-full animate-pulse" />
            <div className="h-4 w-1/6 bg-black/10 dark:bg-white/10 rounded-full animate-pulse ml-auto" />
            <div className="h-4 w-1/6 bg-black/10 dark:bg-white/10 rounded-full animate-pulse ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-[20px] border border-black/5 dark:border-white/5 bg-card/20 p-5 backdrop-blur-md animate-pulse h-[130px] flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div className="h-5 w-32 bg-black/10 dark:bg-white/10 rounded-full" />
            <div className="h-5 w-16 bg-black/10 dark:bg-white/10 rounded-full" />
          </div>
          <div className="flex justify-between border-t border-black/5 dark:border-white/5 pt-4">
            <div className="h-3 w-16 bg-black/10 dark:bg-white/10 rounded-full" />
            <div className="h-3 w-16 bg-black/10 dark:bg-white/10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
