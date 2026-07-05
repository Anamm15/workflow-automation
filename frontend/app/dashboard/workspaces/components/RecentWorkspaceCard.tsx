"use client";

import { Workspace } from "../data/mockData";
import { MoreHorizontal, ShieldAlert, Key, Edit, LogOut, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function RecentWorkspaceCard({ workspace }: { workspace: Workspace }) {
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Key size={14} className="text-amber-500" />;
      case "admin":
        return <ShieldAlert size={14} className="text-emerald-500" />;
      default:
        return null;
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  return (
    <Link
      href={`/workspace/${workspace.id}`}
      className="relative flex flex-col justify-between overflow-hidden rounded-[20px] border border-black/5 dark:border-white/10 bg-card/40 p-6 backdrop-blur-xl transition-all duration-300 hover:bg-card/60 hover:border-black/10 dark:hover:border-white/20 hover:shadow-2xl hover:shadow-primary/5 min-h-[160px] group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMenuOpen(false);
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 to-purple-600/80 text-lg font-bold text-white shadow-lg">
            {getInitials(workspace.name)}
          </div>
          <div>
            <h3 className="font-semibold text-foreground truncate max-w-[150px] sm:max-w-[180px]">
              {workspace.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {getRoleIcon(workspace.role)}
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 capitalize">
                {workspace.role}
              </span>
            </div>
          </div>
        </div>

        {/* Meatball Menu Button */}
        <AnimatePresence>
          {(isHovered || menuOpen) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative"
            >
              <button
                onClick={handleMenuClick}
                className="rounded-full p-2 text-zinc-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground transition-colors"
              >
                <MoreHorizontal size={18} />
              </button>

              {/* Menu Dropdown UI Stub */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a1b23] p-1.5 shadow-2xl z-50 backdrop-blur-3xl"
                  >
                    <div className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground cursor-not-allowed">
                      <Edit size={14} /> Edit details
                    </div>
                    {workspace.role !== "owner" ? (
                      <div className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-amber-600 dark:text-amber-500 hover:bg-amber-500/10 cursor-not-allowed">
                        <LogOut size={14} /> Leave workspace
                      </div>
                    ) : (
                      <div className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-500/10 cursor-not-allowed">
                        <Trash2 size={14} /> Delete
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex -space-x-2">
          {[...Array(Math.min(4, workspace.membersCount))].map((_, i) => (
            <div
              key={i}
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#0a0a0b] bg-zinc-200 dark:bg-zinc-800"
              style={{
                backgroundImage: `url(https://api.dicebear.com/7.x/avataaars/svg?seed=${workspace.id}-${i})`,
              }}
            />
          ))}
          {workspace.membersCount > 4 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-white dark:ring-[#0a0a0b] bg-zinc-200 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              +{workspace.membersCount - 4}
            </div>
          )}
        </div>
        <p className="text-xs text-zinc-500">Last active {workspace.lastActive}</p>
      </div>
    </Link>
  );
}
