export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";
export type WorkspaceStatus = "active" | "invited" | "disabled";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: WorkspaceRole;
  status: WorkspaceStatus;
  membersCount: number;
  lastActive: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  workspaceId: string;
  workspaceName: string;
  action: string;
  user: string;
  timestamp: string;
}

export interface DashboardMetrics {
  totalWorkspaces: number;
  activeMembers: number;
  pendingInvites: number;
  resourceUsage: number; // percentage
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchWorkspaces(search: string, status: string): Promise<Workspace[]> {
  await sleep(2000); // Simulate latency
  const all: Workspace[] = [
    { id: "w-1", name: "Marketing Automation", slug: "marketing-automation", role: "owner", status: "active", membersCount: 8, lastActive: "2 hours ago", createdAt: "2026-01-10T10:00:00Z" },
    { id: "w-2", name: "Engineering Onboarding", slug: "eng-onboarding", role: "admin", status: "active", membersCount: 15, lastActive: "5 hours ago", createdAt: "2026-02-15T14:30:00Z" },
    { id: "w-3", name: "Q3 Sales Pipeline", slug: "q3-sales-pipeline", role: "editor", status: "active", membersCount: 4, lastActive: "1 day ago", createdAt: "2026-06-01T09:15:00Z" },
    { id: "w-4", name: "Legacy Internal Tools", slug: "legacy-tools", role: "viewer", status: "disabled", membersCount: 2, lastActive: "1 month ago", createdAt: "2025-11-20T08:00:00Z" },
    { id: "w-5", name: "HR Recruitment Flow", slug: "hr-flow", role: "admin", status: "active", membersCount: 12, lastActive: "3 days ago", createdAt: "2026-04-12T11:20:00Z" },
  ];

  return all.filter((w) => {
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "all" || w.status === status;
    return matchesSearch && matchesStatus;
  });
}
