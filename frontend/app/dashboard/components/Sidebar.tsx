"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Settings, Activity, Users, Zap } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard/workflows", label: "Workflows", icon: Zap },
  { href: "/dashboard/analytics", label: "Analytics", icon: Activity },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen border-r border-border bg-background flex flex-col py-6 transition-colors">
      <div className="px-6 mb-8 flex items-center gap-3">
        <Image src="/img/logo.png" alt="NexusFlow Logo" width={32} height={32} className="rounded-md" />
        <h1 className="text-foreground font-semibold tracking-tight text-lg">
          NexusFlow
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg group text-sm font-medium transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <Icon 
                size={18} 
                className={cn(
                  "relative z-10 transition-colors", 
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} 
              />
              <span 
                className={cn(
                  "relative z-10 transition-colors", 
                  isActive ? "text-foreground font-semibold" : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 pt-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted border border-border" />
          <div className="flex flex-col">
            <span className="text-sm text-foreground font-medium leading-none">Admin User</span>
            <span className="text-xs text-muted-foreground mt-1">admin@nexusflow.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
