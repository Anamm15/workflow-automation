"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Loader2, UserPlus, Check, ChevronDown } from "lucide-react";
import { 
  useWorkspaceDetails, 
  useSearchUsers, 
  useAddMember, 
  useUpdateMemberRole,
  AccountResponse,
  WorkspaceMember
} from "@/app/dashboard/workspaces/hooks/useWorkspaceApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

type Role = "owner" | "admin" | "editor" | "viewer";

export function ManageMembersModal({ isOpen, onClose, workspaceId }: ManageMembersModalProps) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AccountResponse | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>("viewer");
  const [editingRoleFor, setEditingRoleFor] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch workspace details (includes members)
  const { data: workspaceDetails, isLoading: isLoadingWorkspace } = useWorkspaceDetails(workspaceId);
  const members = workspaceDetails?.members || [];

  // Current logged in user (assumed owner/admin for editing roles - backend will enforce anyway)
  // For UI simplicity, we allow the role dropdown if we are owner/admin. 
  // In a real scenario, we'd check `currentUserRole === 'owner' || 'admin'`. We'll just show it always and let backend handle 403.

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isFetching: isSearching } = useSearchUsers(debouncedQuery);
  const addMember = useAddMember();
  const updateMemberRole = useUpdateMemberRole();

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        // We might want to close search results if clicked outside, but we just let it stay 
        // or clear if needed. For now, it's fine.
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddMember = () => {
    if (!selectedUser) return;
    
    addMember.mutate({ workspaceId, userId: selectedUser.account_id, role: selectedRole }, {
      onSuccess: () => {
        toast.success(`${selectedUser.username} added as ${selectedRole}`);
        setSelectedUser(null);
        setSearchQuery("");
        setDebouncedQuery("");
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error?.message || "Failed to add member");
      }
    });
  };

  const handleUpdateRole = (memberId: string, userId: string, newRole: Role) => {
    updateMemberRole.mutate({ workspaceId, userId, role: newRole }, {
      onSuccess: () => {
        toast.success("Role updated");
        setEditingRoleFor(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error?.message || "Failed to update role");
      }
    });
  };

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : "?";

  // Filter out already existing members from search results
  const filteredResults = searchResults
    ?.filter(user => !members.some(m => m.user_id === user.account_id))
    .slice(0, 4) || [];

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-visible rounded-[24px] border border-black/5 dark:border-white/10 bg-white dark:bg-[#0a0a0b] p-6 shadow-2xl backdrop-blur-xl flex flex-col max-h-[85vh]"
          >
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h2 className="text-xl font-bold text-foreground">Manage Members</h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10 dark:text-zinc-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Section */}
            <div className="relative mb-6 shrink-0" ref={searchRef}>
              {!selectedUser ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search by username or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 pl-10 pr-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 animate-spin" size={16} />
                    )}
                  </div>
                  
                  {/* Search Recommendations Dropdown */}
                  <AnimatePresence>
                    {searchQuery && filteredResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 z-20 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#121214] shadow-xl overflow-hidden"
                      >
                        {filteredResults.map((user) => (
                          <div
                            key={user.account_id}
                            onClick={() => {
                              setSelectedUser(user);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-3 p-3 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                              {getInitials(user.username)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-foreground">{user.username}</span>
                              <span className="text-xs text-zinc-500">{user.email}</span>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {searchQuery && !isSearching && filteredResults.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 right-0 mt-2 z-20 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#121214] p-4 text-center text-sm text-zinc-500 shadow-xl"
                    >
                      No users found or already a member.
                    </motion.div>
                  )}
                </>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                      {getInitials(selectedUser.username)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">{selectedUser.username}</span>
                      <span className="text-xs text-zinc-500">{selectedUser.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as Role)}
                      className="bg-transparent border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 text-sm text-foreground outline-none"
                    >
                      <option value="viewer" className="dark:bg-[#121214]">Viewer</option>
                      <option value="editor" className="dark:bg-[#121214]">Editor</option>
                      <option value="admin" className="dark:bg-[#121214]">Admin</option>
                    </select>
                    <button
                      onClick={handleAddMember}
                      disabled={addMember.isPending}
                      className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white shadow-md hover:bg-primary-hover flex items-center gap-2 disabled:opacity-50"
                    >
                      {addMember.isPending ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                      Add
                    </button>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="rounded-lg p-1.5 text-zinc-500 hover:bg-black/10 dark:hover:bg-white/10"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* List Members Section */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3 px-1 shrink-0">
                Workspace Members ({members.length})
              </h3>
              
              <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-2 relative z-0">
                {isLoadingWorkspace ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin text-primary" size={24} />
                  </div>
                ) : (
                  members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300">
                          {getInitials(member.user_username)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">
                            {member.user_username}
                          </span>
                          <span className="text-xs text-zinc-500">{member.user_email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 relative">
                        {editingRoleFor === member.id ? (
                          <div className="flex items-center gap-1">
                            <select
                              defaultValue={member.role}
                              onChange={(e) => handleUpdateRole(member.id, member.user_id, e.target.value as Role)}
                              className="bg-white dark:bg-[#121214] border border-black/10 dark:border-white/20 rounded-lg px-2 py-1 text-xs text-foreground outline-none"
                            >
                              <option value="owner">Owner</option>
                              <option value="admin">Admin</option>
                              <option value="editor">Editor</option>
                              <option value="viewer">Viewer</option>
                            </select>
                            <button
                              onClick={() => setEditingRoleFor(null)}
                              className="p-1 rounded-md text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingRoleFor(member.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
                            disabled={updateMemberRole.isPending}
                          >
                            <span className="capitalize">{member.role}</span>
                            <ChevronDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
