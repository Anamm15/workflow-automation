import { Suspense } from "react";
import { Header } from "./components/Header";
import { QuickMetrics, QuickMetricsSkeleton } from "./components/QuickMetrics";
import { RecentWorkspaces, RecentWorkspacesSkeleton } from "./components/RecentWorkspaces";
import { GridControls } from "./components/GridControls";
import { WorkspaceGrid, WorkspaceGridSkeleton } from "./components/WorkspaceGrid";
import { ActivityFeed, ActivityFeedSkeleton } from "./components/ActivityFeed";

export default function WorkspacesPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; view?: string };
}) {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
        {/* 1. Header Area */}
        <Header />

        {/* 2. Quick Metrics */}
        <Suspense fallback={<QuickMetricsSkeleton />}>
          <QuickMetrics />
        </Suspense>

        {/* 3. Recent Workspaces */}
        <Suspense fallback={<RecentWorkspacesSkeleton />}>
          <RecentWorkspaces />
        </Suspense>

        {/* 4. Data Grid & Activity Feed */}
        <div className="flex flex-col xl:flex-row gap-6 flex-1 mt-4">
          
          {/* Main Content Area (70%) */}
          <div className="w-full xl:w-[70%] flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-foreground mb-1">All Workspaces</h2>
            
            {/* Grid Controls (Client Component for URL State) */}
            <GridControls />
            
            {/* Data Grid with Suspense reacting to URL Search Params */}
            <Suspense 
              key={JSON.stringify(searchParams)} 
              fallback={<WorkspaceGridSkeleton view={searchParams.view} />}
            >
              <WorkspaceGrid searchParams={searchParams} />
            </Suspense>
          </div>

          {/* Activity Feed Sidebar (30%) */}
          <div className="w-full xl:w-[30%]">
            <Suspense fallback={<ActivityFeedSkeleton />}>
              <ActivityFeed />
            </Suspense>
          </div>
          
        </div>
      </div>
    </div>
  );
}
