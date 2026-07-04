"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function TopNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  const segments = pathname?.split("/").filter(Boolean) || [];
  
  // Basic breadcrumb title logic
  const title = segments.length > 1 
    ? segments[1].charAt(0).toUpperCase() + segments[1].slice(1)
    : "Dashboard";

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-20 transition-colors">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Global search..."
            className="bg-card border border-border text-sm text-foreground rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-primary/50 transition-colors w-64 shadow-inner"
          />
        </div>
        
        {mounted && (
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-full"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}

        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-full">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border border-background" />
        </button>
      </div>
    </header>
  );
}
