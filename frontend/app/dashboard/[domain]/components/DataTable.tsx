"use client";

import { deleteItemAction } from "../../actions";
import { useTransition } from "react";
import { MoreHorizontal, Trash2, Edit2, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps {
  domain: string;
  data: Array<{
    id: string;
    name: string;
    status: string;
    createdAt: string;
    owner: string;
  }>;
}

export function DataTable({ data, domain }: DataTableProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      startTransition(async () => {
        // Trigger server action mutation which will explicitly revalidate the path
        await deleteItemAction(id, domain);
      });
    }
  };

  return (
    <div className="w-full overflow-x-auto relative">
      {isPending && (
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] z-10" />
      )}
      <table className="w-full text-left text-sm text-muted-foreground">
        <thead className="text-xs uppercase bg-muted/30 text-foreground border-b border-border">
          <tr>
            <th className="px-6 py-4 font-medium">Name / ID</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">Owner</th>
            <th className="px-6 py-4 font-medium">Created At</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b border-border hover:bg-muted/10 transition-colors group">
              <td className="px-6 py-4">
                <div className="font-medium text-foreground">{item.name}</div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">{item.id}</div>
              </td>
              <td className="px-6 py-4">
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                  item.status === "active" ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                  item.status === "inactive" ? "bg-muted text-muted-foreground border-border" :
                  "bg-red-500/10 text-red-500 border-red-500/20"
                )}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 text-foreground">
                {item.owner}
              </td>
              <td className="px-6 py-4">
                {new Date(item.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors">
                    <Play size={16} />
                  </button>
                  <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-muted-foreground hover:text-error hover:bg-error/10 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                No items found matching the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
