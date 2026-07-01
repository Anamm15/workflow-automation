"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { MoreVertical, Loader2 } from "lucide-react";
import { clsx } from "clsx";

// --- KOMPONEN UI & SUB-KOMPONEN ---
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTableHeader } from "./DataTableHeader";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableActionMenu } from "./DataTableActionMenu";

// --- TYPES ---
export interface ActionItem<T> {
  label: string;
  icon?: React.ElementType;
  onClick: (row: T) => void;
  className?: string;
}

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  sortable?: boolean;
}

interface MainTableProps<T> {
  // Data & Metadata
  data: T[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;

  columns: Column<T>[];
  keyField: keyof T;
  isLoading?: boolean;

  // Title & Search
  title?: string;
  searchKeyword?: string;
  onSearchChange?: (keyword: string) => void;

  // Actions
  onCreate: () => void;
  onBulkDelete: (ids: (string | number)[]) => void;
  onBulkExport: (ids: (string | number)[]) => void;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  actions?: ActionItem<T>[];

  // Limit
  limit?: string;
  setLimit?: React.Dispatch<React.SetStateAction<string>>;
}

// --- MAIN COMPONENT ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MainTable<T extends Record<string, any>>({
  data,
  currentPage,
  totalPages,
  onPageChange,
  columns,
  keyField,
  isLoading = false,
  title,
  searchKeyword = "",
  onSearchChange,
  onCreate,
  onEdit,
  onDelete,
  actions = [],
  onBulkDelete,
  onBulkExport,
  limit = "10",
  setLimit,
}: MainTableProps<T>) {
  // --- STATE ---
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // Menu State
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // --- EFFECTS ---

  // Reset selection when data changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIds([]);
  }, [data]);

  // Close menu on scroll/click outside
  useEffect(() => {
    const handleScroll = () => setOpenMenuId(null);
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    window.addEventListener("scroll", handleScroll, true);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- LOGIC: SORTING ---
  const processedData = useMemo(() => {
    const sorted = [...data];
    if (sortConfig) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [data, sortConfig]);

  // --- LOGIC: SELECTION ---
  const isAllSelected =
    processedData.length > 0 &&
    processedData.every((row) => selectedIds.includes(row[keyField]));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      const currentIds = processedData.map((row) => row[keyField]);
      setSelectedIds(currentIds);
    }
  };

  const handleSort = (key: keyof T | string) => {
    let direction: "asc" | "desc" = "asc";
    const keyString = String(key);
    if (
      sortConfig &&
      sortConfig.key === keyString &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key: keyString, direction });
  };

  // --- LOGIC: MENU POSITIONING ---
  const handleOpenMenu = (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string | number,
  ) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const isDropUp = spaceBelow < 200;

    setMenuPosition({
      top: isDropUp ? rect.top : rect.bottom,
      right: window.innerWidth - rect.right,
    });
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Mendapatkan data baris yang sedang aktif untuk menu
  const activeRow = useMemo(
    () => processedData.find((d) => d[keyField] === openMenuId),
    [processedData, openMenuId, keyField],
  );

  // --- RENDER ---
  return (
    <div className="w-full space-y-4 relative">
      {/* 1. TITLE */}
      {title && (
        <Text
          as="h2"
          size="heading"
          weight="bold"
          className="tracking-tight text-left text-slate-800"
        >
          {title}
        </Text>
      )}

      {/* CONTAINER UTAMA */}
      <div className="rounded-lg border border-sidebar-border bg-white shadow-sm overflow-hidden flex flex-col">
        {/* 2. TOOLBAR (Search & Main Actions) */}
        <DataTableToolbar
          searchKeyword={searchKeyword}
          onSearchChange={onSearchChange}
          selectedIds={selectedIds}
          onBulkExport={onBulkExport}
          onBulkDelete={onBulkDelete}
          onCreate={onCreate}
        />

        {/* 3. TABLE CONTENT */}
        <div className="overflow-x-auto min-h-75">
          <table className="w-full text-left text-sm whitespace-nowrap">
            {/* Header (Sorting & Select All) */}
            <DataTableHeader
              columns={columns}
              sortConfig={sortConfig}
              onSort={handleSort}
              isAllSelected={isAllSelected}
              onSelectAll={handleSelectAll}
              hasData={processedData.length > 0}
            />

            <tbody className="divide-y divide-sidebar-border relative">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + 2} className="p-8 text-center">
                    <Loader2 className="animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : processedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="p-8 text-center">
                    <Text color="muted">Tidak ada data ditemukan.</Text>
                  </td>
                </tr>
              ) : (
                processedData.map((row) => {
                  const id = row[keyField];
                  const isSelected = selectedIds.includes(id);

                  return (
                    <tr
                      key={String(id)}
                      className={clsx(
                        "transition-colors group",
                        isSelected
                          ? "bg-slate-50 hover:bg-slate-100"
                          : "hover:bg-slate-50",
                      )}
                    >
                      {/* Checkbox Cell */}
                      <td className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedIds((prev) =>
                              prev.includes(id)
                                ? prev.filter((x) => x !== id)
                                : [...prev, id],
                            );
                          }}
                        />
                      </td>

                      {/* Data Cells */}
                      {columns.map((col, idx) => (
                        <td
                          key={idx}
                          className={clsx(
                            "px-4 py-3 text-foreground",
                            col.className,
                          )}
                        >
                          {typeof col.accessor === "function"
                            ? col.accessor(row)
                            : row[col.accessor]}
                        </td>
                      ))}

                      {/* Row Action Button (Meatball Menu) */}
                      <td className="px-4 py-3 text-right sticky right-0 bg-white group-hover:bg-slate-50/90 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)]">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleOpenMenu(e, id)}
                          className={clsx(
                            "h-8 w-8",
                            openMenuId === id
                              ? "bg-slate-200 text-foreground"
                              : "text-slate-400",
                          )}
                        >
                          <MoreVertical size={18} />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. FOOTER (Pagination & Limit) */}
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          limit={limit}
          setLimit={setLimit}
        />
      </div>

      {/* 5. FLOATING MENU */}
      <DataTableActionMenu
        ref={menuRef}
        isOpen={openMenuId !== null}
        position={menuPosition}
        row={activeRow}
        rowId={openMenuId}
        onClose={() => setOpenMenuId(null)}
        actions={actions}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
