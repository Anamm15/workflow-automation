"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, LayoutGrid, List } from "lucide-react";
import { useTransition, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function GridControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "all";
  const currentView = searchParams.get("view") || "grid";

  // Local state for debounced search
  const [searchValue, setSearchValue] = useState(currentSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== currentSearch) {
        updateUrl("search", searchValue);
      }
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [searchValue, currentSearch]);

  const updateUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="relative w-full sm:w-64">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search workspaces..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full rounded-xl border border-black/5 dark:border-white/10 bg-card/40 py-2 pl-9 pr-4 text-sm text-foreground outline-none backdrop-blur-xl transition-all focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="relative">
          <select
            value={currentStatus}
            onChange={(e) => updateUrl("status", e.target.value)}
            className="h-10 cursor-pointer appearance-none rounded-xl border border-black/5 dark:border-white/10 bg-card/40 pl-4 pr-10 text-sm text-foreground outline-none backdrop-blur-xl transition-all focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="disabled">Disabled</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
      </div>
      
      <div className="flex items-center rounded-xl border border-black/5 dark:border-white/10 bg-card/40 p-1 backdrop-blur-xl">
        <button
          onClick={() => updateUrl("view", "grid")}
          className={cn(
            "rounded-lg p-1.5 transition-colors",
            currentView === "grid" ? "bg-black/5 dark:bg-white/10 text-foreground" : "text-zinc-500 hover:text-foreground"
          )}
        >
          <LayoutGrid size={16} />
        </button>
        <button
          onClick={() => updateUrl("view", "list")}
          className={cn(
            "rounded-lg p-1.5 transition-colors",
            currentView === "list" ? "bg-black/5 dark:bg-white/10 text-foreground" : "text-zinc-500 hover:text-foreground"
          )}
        >
          <List size={16} />
        </button>
      </div>
      
      {/* Visual indicator of transition loading state */}
      {isPending && <div className="absolute right-4 top-4 h-2 w-2 animate-ping rounded-full bg-primary" />}
    </div>
  );
}
