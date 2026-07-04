"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { Search, Filter, Loader2 } from "lucide-react";

interface SearchFilterProps {
  initialQuery: string;
  initialStatus: string;
}

export function SearchFilter({ initialQuery, initialStatus }: SearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state purely for controlled inputs before debounce/submission
  const [query, setQuery] = useState(initialQuery);

  // Sync local state if URL changes externally (e.g. back button)
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (value: string) => {
    setQuery(value);
    
    // We use a non-blocking transition to push the new URL state
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      params.set("page", "1"); // Reset pagination on new search
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value !== "all") {
        params.set("status", value);
      } else {
        params.delete("status");
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input 
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search items..."
          className="bg-card border border-border text-sm text-foreground rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-primary/50 transition-colors w-64 shadow-inner"
        />
        {isPending && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-spin" />
        )}
      </div>

      <div className="relative flex items-center">
        <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <select 
          value={initialStatus}
          onChange={handleStatusChange}
          className="appearance-none bg-card border border-border text-sm text-foreground rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:border-primary/50 transition-colors cursor-pointer shadow-inner"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="error">Error</option>
        </select>
      </div>
    </div>
  );
}
