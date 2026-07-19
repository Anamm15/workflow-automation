import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import { WorkflowCard } from "./components/WorkflowCard";

// Mock data for workflows
const MOCK_WORKFLOWS = [
  { id: "wf-1", name: "User Onboarding", status: "active", lastEdited: "2 hours ago" },
  { id: "wf-2", name: "Data Sync to CRM", status: "draft", lastEdited: "1 day ago" },
  { id: "wf-3", name: "Weekly Report Generation", status: "error", lastEdited: "3 days ago" },
];

export default async function WorkflowListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <Link
              href="/dashboard/workspaces"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" /> Back to Workspaces
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Workflows
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage workflows for Workspace {id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
              <Plus size={18} />
              Create Workflow
            </button>
          </div>
        </div>

        {/* Workflow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {MOCK_WORKFLOWS.map((wf) => (
            <WorkflowCard key={wf.id} wf={wf} />
          ))}
        </div>
      </div>
    </div>
  );
}
