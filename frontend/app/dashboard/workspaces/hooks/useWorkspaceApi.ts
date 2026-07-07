import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  role?: "owner" | "admin" | "editor" | "viewer";
  members_count?: number;
}

export interface WorkspaceMember {
  id: string;
  user_id: string;
  user_email: string;
  user_username: string;
  user_avatar?: string;
  role: "owner" | "admin" | "editor" | "viewer";
  status: string;
  joined_at: string;
}

export interface WorkspaceDetails {
  workspace: Workspace;
  members: WorkspaceMember[];
}

export interface AccountResponse {
  account_id: string;
  email: string;
  username: string;
  is_verified: boolean;
  joined_at: string;
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["users", "search", query],
    queryFn: async () => {
      if (!query) return [];
      const { data } = await api.get<{ data: AccountResponse[] }>(`/auth/search?q=${encodeURIComponent(query)}`);
      return data.data;
    },
    enabled: query.length > 1,
  });
}

export function useWorkspaceDetails(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      const { data } = await api.get<{ data: WorkspaceDetails }>(`/workspaces/${workspaceId}`);
      return data.data;
    },
    enabled: !!workspaceId,
  });
}

export function useAddWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post<{ data: Workspace }>("/workspaces", { name });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workspaceId, userId, role }: { workspaceId: string; userId: string; role: string }) => {
      const { data } = await api.post(`/workspaces/${workspaceId}/members`, { user_id: userId, role });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workspace", variables.workspaceId] });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workspaceId, userId, role }: { workspaceId: string; userId: string; role: string }) => {
      const { data } = await api.put(`/workspaces/${workspaceId}/members/${userId}`, { role });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workspace", variables.workspaceId] });
    },
  });
}

export interface DashboardMetrics {
  total_workspaces: number;
  active_members: number;
  pending_invites: number;
  resource_usage: number;
}

export interface WorkspaceActivity {
  id: string;
  workspace_id: string;
  workspace_name: string;
  user_id: string;
  user_name: string;
  action: string;
  created_at: string;
}

export interface DashboardInfo {
  metrics: DashboardMetrics;
  recent_workspaces: Workspace[];
  recent_activities: WorkspaceActivity[];
}

export function useDashboardInfo() {
  return useQuery({
    queryKey: ["dashboard_info"],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardInfo }>("/workspaces/dashboard");
      return data.data;
    },
  });
}
