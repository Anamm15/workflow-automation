import { DataTable } from "./DataTable";

interface DataSuspenseWrapperProps {
  domain: string;
  query: string;
  page: number;
  status: string;
}

export async function DataSuspenseWrapper({ domain, query, page, status }: DataSuspenseWrapperProps) {
  // Simulate network delay to demonstrate Suspense streaming architecture
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Perform Server-First data fetching based on the exact URL state.
  // In a real gRPC scenario, this would be: await grpcClient.listWorkflows({ query, page, status })
  
  // Generating deterministic mock data based on the parameters
  const mockData = Array.from({ length: 10 }).map((_, i) => ({
    id: `item-${page}-${i}`,
    name: `${domain.slice(0, -1).toUpperCase()} ${query || "Item"} ${page}-${i + 1}`,
    status: status === "all" ? (i % 3 === 0 ? "inactive" : "active") : status,
    createdAt: new Date(Date.now() - i * 10000000).toISOString(),
    owner: "admin@nexusflow.com",
  }));

  const totalPages = 5;

  return (
    <div className="w-full h-full flex flex-col bg-card/40 border border-border rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
      <DataTable data={mockData} domain={domain} />
      
      {/* Pagination Footer */}
      <div className="p-4 border-t border-border flex items-center justify-between bg-card/80">
        <span className="text-xs text-muted-foreground">
          Showing page <strong className="text-foreground">{page}</strong> of {totalPages}
        </span>
        <div className="flex gap-2">
          {/* We would use Link tags with searchParams for pagination to maintain server-first approach */}
          <button 
            disabled={page <= 1}
            className="px-3 py-1.5 rounded bg-muted text-foreground text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80 transition-colors border border-border"
          >
            Previous
          </button>
          <button 
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded bg-muted text-foreground text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80 transition-colors border border-border"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
