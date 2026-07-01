import React from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { clsx } from "clsx";
import { Text } from "@/components/ui/Text";
import { Column } from "./MainTable";

interface DataTableHeaderProps<T> {
  /**
   * Column definitions
   */
  columns: Column<T>[];

  /**
   * State sorting for now
   */
  sortConfig: {
    key: string;
    direction: "asc" | "desc";
  } | null;

  /**
   * Handler when column header being clicked for sorting
   */
  onSort: (accessor: string) => void;

  /**
   * State checkbox "Select All"
   */
  isAllSelected: boolean;

  /**
   * Handler for checkbox "Select All"
   */
  onSelectAll: () => void;

  /**
   * Flag for disable checkbox if no data
   */
  hasData: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTableHeader<T extends Record<string, any>>({
  columns,
  sortConfig,
  onSort,
  isAllSelected,
  onSelectAll,
  hasData,
}: DataTableHeaderProps<T>) {
  return (
    <thead className="bg-slate-50 text-slate-500 border-b border-sidebar-border px-4">
      <tr>
        {/* CHECKBOX HEADER (Select All on Page) */}
        <th className="w-10 px-4 py-3">
          <input
            type="checkbox"
            className="rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
            checked={isAllSelected}
            onChange={onSelectAll}
            disabled={!hasData}
          />
        </th>

        {/* DYNAMIC COLUMNS */}
        {columns.map((col, idx) => {
          const isSortable = col.sortable !== false;
          const isActiveSort =
            sortConfig?.key === col.accessor &&
            typeof col.accessor === "string";

          return (
            <th
              key={idx}
              className={clsx(
                "px-4 py-3 transition-colors select-none",
                isSortable
                  ? "cursor-pointer hover:text-slate-700 hover:bg-slate-100"
                  : "",
                col.className,
              )}
              onClick={() =>
                isSortable && typeof col.accessor === "string"
                  ? onSort(col.accessor as string)
                  : undefined
              }
            >
              <div className="flex items-center gap-2">
                <Text as="span" weight="medium" size="body">
                  {col.header}
                </Text>

                {isSortable && (
                  <span className="text-slate-400">
                    {isActiveSort ? (
                      sortConfig?.direction === "asc" ? (
                        <ArrowUp size={14} className="text-primary" />
                      ) : (
                        <ArrowDown size={14} className="text-primary" />
                      )
                    ) : (
                      <ArrowUpDown size={14} className="opacity-50" />
                    )}
                  </span>
                )}
              </div>
            </th>
          );
        })}

        {/* ACTION COLUMN (Sticky Right) */}
        <th className="w-16 px-4 py-3 text-right sticky right-0 bg-slate-50 shadow-sm z-10">
          <Text as="span" weight="medium" size="body">
            Aksi
          </Text>
        </th>
      </tr>
    </thead>
  );
}
