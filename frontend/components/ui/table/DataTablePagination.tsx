import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  limit: string;
  setLimit?:
    | React.Dispatch<React.SetStateAction<string>>
    | ((limit: string) => void);
}

export function DataTablePagination({
  currentPage,
  totalPages,
  onPageChange,
  limit,
  setLimit,
}: DataTablePaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-sidebar-border bg-slate-50">
      {/* LIMIT SELECTION */}
      <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto">
        <Text size="body" color="muted" className="mr-5">
          Data per Halaman
        </Text>
        <input
          className="border border-gray-400 py-1.5 w-16 text-center rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          type="text"
          value={limit}
          onChange={(e) => setLimit?.(e.target.value)}
        />
      </div>

      {/* PAGINATION CONTROLS */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 w-8 bg-transparent border-transparent hover:bg-white hover:border-slate-200"
        >
          <ChevronLeft size={18} />
        </Button>

        <Text
          size="caption"
          weight="medium"
          className="text-slate-600 whitespace-nowrap mx-2"
        >
          Hal {currentPage} / {totalPages || 1}
        </Text>

        <Button
          variant="outline"
          size="icon"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 w-8 bg-transparent border-transparent hover:bg-white hover:border-slate-200"
        >
          <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
}
