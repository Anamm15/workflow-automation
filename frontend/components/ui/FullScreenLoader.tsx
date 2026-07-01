import { Spinner } from "@/components/ui/Spinner";

export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2">
        <Spinner size="xl" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
