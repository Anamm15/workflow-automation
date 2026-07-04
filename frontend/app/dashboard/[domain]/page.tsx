import { Suspense } from "react";
import { SearchFilter } from "./components/SearchFilter";
import { DataSuspenseWrapper } from "./components/DataSuspenseWrapper";
import DashboardLoading from "../loading";

// Define strict types for the search parameters
type PageProps = {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function DomainDashboardPage(props: PageProps) {
  // Await the params and searchParams objects (Next.js 15+ requirement)
  const params = await props.params;
  const searchParams = await props.searchParams;

  const domain = params.domain;
  
  // Extract canonical state from URL
  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const status = typeof searchParams.status === "string" ? searchParams.status : "all";

  // Create a unique cache key for the suspense boundary based on the exact state
  const suspenseKey = JSON.stringify({ query, page, status });

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground capitalize">
            {domain}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and view your {domain} configuration.
          </p>
        </div>

        <SearchFilter initialQuery={query} initialStatus={status} />
      </div>

      <div className="flex-1 min-h-[400px]">
        {/* We use a key on Suspense to automatically trigger the fallback when searchParams change */}
        <Suspense key={suspenseKey} fallback={<DashboardLoading />}>
          <DataSuspenseWrapper 
            domain={domain} 
            query={query} 
            page={page} 
            status={status} 
          />
        </Suspense>
      </div>
    </div>
  );
}
