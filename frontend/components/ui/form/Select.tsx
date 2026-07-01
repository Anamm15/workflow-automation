import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string | boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, id, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          <select
            id={id}
            ref={ref}
            disabled={disabled}
            className={cn(
              // Base styles
              "flex w-full appearance-none rounded-md border bg-white px-3 py-1.5 text-sm",
              "border-sidebar-border text-foreground",

              // Focus state
              "outline-none focus:border-primary transition-colors",

              // Disabled
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-100",

              // Error state
              error && "border-danger focus:border-danger",

              // Space for chevron
              "pr-10",

              className,
            )}
            {...props}
          >
            {children}
          </select>

          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select };
