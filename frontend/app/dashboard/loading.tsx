export default function DashboardLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-muted rounded-md" />
        <div className="h-9 w-32 bg-muted rounded-md" />
      </div>

      <div className="w-full bg-card border border-border rounded-xl overflow-hidden">
        <div className="border-b border-border bg-muted/50 p-4">
          <div className="h-5 w-64 bg-muted rounded" />
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-full bg-muted/70 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
