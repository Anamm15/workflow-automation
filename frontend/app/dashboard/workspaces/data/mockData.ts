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

export async function fetchMetrics(): Promise<DashboardMetrics> {
  await sleep(1500); // Simulate latency
  return {
    totalWorkspaces: 12,
    activeMembers: 48,
    pendingInvites: 3,
    resourceUsage: 64,
  };
}

export async function fetchRecentWorkspaces(): Promise<Workspace[]> {
  await sleep(1200); // Simulate latency
  return [
    {
      id: "w-1",
      name: "Marketing Automation",
      slug: "marketing-automation",
      role: "owner",
      status: "active",
      membersCount: 8,
      lastActive: "2 hours ago",
      createdAt: "2026-01-10T10:00:00Z",
    },
    {
      id: "w-2",
      name: "Engineering Onboarding",
      slug: "eng-onboarding",
      role: "admin",
      status: "active",
      membersCount: 15,
      lastActive: "5 hours ago",
      createdAt: "2026-02-15T14:30:00Z",
    },
    {
      id: "w-3",
      name: "Q3 Sales Pipeline",
      slug: "q3-sales-pipeline",
      role: "editor",
      status: "active",
      membersCount: 4,
      lastActive: "1 day ago",
      createdAt: "2026-06-01T09:15:00Z",
    },
  ];
}

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

export async function fetchActivityFeed(): Promise<Activity[]> {
  await sleep(1800); // Simulate latency
  return [
    { id: "a-1", workspaceId: "w-1", workspaceName: "Marketing Automation", action: "published workflow 'Lead Sync'", user: "Alice M.", timestamp: "10 mins ago" },
    { id: "a-2", workspaceId: "w-2", workspaceName: "Engineering Onboarding", action: "invited Bob to workspace", user: "You", timestamp: "2 hours ago" },
    { id: "a-3", workspaceId: "w-3", workspaceName: "Q3 Sales Pipeline", action: "failed to execute 'Daily Report'", user: "System", timestamp: "5 hours ago" },
    { id: "a-4", workspaceId: "w-1", workspaceName: "Marketing Automation", action: "updated trigger 'Webhook'", user: "Charlie D.", timestamp: "1 day ago" },
  ];
}
