import React from "react";
import { Search, Download, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DataTableToolbarProps {
  /**
   * Keyword pencarian saat ini
   */
  searchKeyword: string;

  /**
   * Handler ketika keyword pencarian berubah
   */
  onSearchChange?: (keyword: string) => void;

  /**
   * Array ID item yang sedang dipilih (untuk bulk action)
   */
  selectedIds: (string | number)[];

  /**
   * Handler untuk aksi bulk export
   */
  onBulkExport: (ids: (string | number)[]) => void;

  /**
   * Handler untuk aksi bulk delete
   */
  onBulkDelete: (ids: (string | number)[]) => void;

  /**
   * Handler untuk membuka form pembuatan data baru
   */
  onCreate: () => void;
}

export function DataTableToolbar({
  searchKeyword,
  onSearchChange,
  selectedIds,
  onBulkExport,
  onBulkDelete,
  onCreate,
}: DataTableToolbarProps) {
  return (
    <div className="p-4 border-b border-sidebar-border bg-white flex flex-col sm:flex-row gap-4 justify-between items-center">
      {/* SEARCH BAR */}
      <div className="relative w-full sm:w-72">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Cari data..."
          className="pl-9 pr-4 py-2.5 w-full border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all min-w-96"
          value={searchKeyword}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>

      {/* ACTION BUTTONS GROUP */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {/* Bulk Export */}
        <Button
          variant="outline"
          onClick={() => onBulkExport(selectedIds)}
          disabled={selectedIds.length === 0}
          startIcon={<Download size={16} />}
          className="bg-white text-slate-700"
          title="Export Data"
          size="lg"
        >
          <span className="hidden sm:inline">Export</span>
        </Button>

        {/* Bulk Delete */}
        <Button
          variant="outline"
          onClick={() => onBulkDelete(selectedIds)}
          disabled={selectedIds.length === 0}
          startIcon={<Trash2 size={16} />}
          // Override classes agar sesuai dengan desain border merah sebelumnya
          className="bg-white border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          title="Hapus Terpilih"
          size="lg"
        >
          <span className="hidden sm:inline">Hapus</span>
        </Button>

        {/* Separator Kecil */}
        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* Create Button */}
        <Button
          variant="primary"
          onClick={onCreate}
          startIcon={<Plus size={16} />}
          size="lg"
        >
          Baru
        </Button>
      </div>
    </div>
  );
}
