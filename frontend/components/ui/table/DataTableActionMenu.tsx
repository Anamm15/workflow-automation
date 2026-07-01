import React, { forwardRef } from "react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { ActionItem } from "./MainTable";

interface DataTableActionMenuProps<T> {
  isOpen: boolean;
  position: { top: number; right: number } | null;
  row: T | undefined;

  /**
   * active rows ID
   */
  rowId: string | number | null;

  onClose: () => void;

  /**
   * Custom Actions List
   */
  actions: ActionItem<T>[];

  /**
   * Handler edit default
   */
  onEdit?: (id: string | number) => void;

  /**
   * Handler delete default
   */
  onDelete?: (id: string | number) => void;
}

export const DataTableActionMenu = forwardRef<
  HTMLDivElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DataTableActionMenuProps<any>
>(
  (
    { isOpen, position, row, rowId, onClose, actions, onEdit, onDelete },
    ref,
  ) => {
    if (!isOpen || !position || rowId === null) return null;

    //  logic menu position
    const isDropUp = position.top > window.innerHeight / 2;

    return (
      <div
        ref={ref}
        style={{
          position: "fixed",
          top: position.top,
          right: position.right + 16,
          transform: isDropUp ? "translateY(-100%)" : "none",
        }}
        className="z-50 w-48 rounded-md border border-sidebar-border bg-white py-1 shadow-xl ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in-95 duration-100 flex flex-col"
      >
        {/* HEADER MENU */}
        <div className="px-3 py-2">
          <Text
            size="caption"
            weight="bold"
            className="text-slate-400 uppercase tracking-wider"
          >
            Aksi Dokumen
          </Text>
        </div>

        {/* CUSTOM ACTIONS */}
        {actions.map((action, idx) => (
          <Button
            key={idx}
            variant="ghost"
            size="sm"
            onClick={() => {
              if (row) action.onClick(row);
              onClose();
            }}
            className={clsx(
              "w-full justify-start font-normal",
              action.className || "text-slate-700",
            )}
          >
            {action.icon && <action.icon className="mr-3 h-4 w-4 opacity-70" />}
            {action.label}
          </Button>
        ))}

        {/* SEPARATOR */}
        {actions.length > 0 && (onEdit || onDelete) && (
          <div className="my-1 border-t border-slate-100"></div>
        )}

        {/* EDIT BUTTON */}
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onEdit(rowId);
              onClose();
            }}
            className="w-full justify-start text-slate-700 font-normal"
          >
            Lihat / Edit
          </Button>
        )}

        {/* DELETE BUTTON */}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onDelete(rowId);
              onClose();
            }}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-normal"
          >
            Hapus Data
          </Button>
        )}
      </div>
    );
  },
);

DataTableActionMenu.displayName = "DataTableActionMenu";
