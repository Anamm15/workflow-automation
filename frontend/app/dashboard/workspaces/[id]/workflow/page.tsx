import { WorkflowListClient } from "./components/WorkflowListClient";

export default async function WorkflowListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <WorkflowListClient workspaceId={id} />;
}
