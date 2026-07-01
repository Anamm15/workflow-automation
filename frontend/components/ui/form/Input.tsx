import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | boolean;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, error, id, startIcon, endIcon, disabled, ...props },
    ref,
  ) => {
    return (
      <div className="w-full">
        <div className="relative">
          {startIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {startIcon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            type={type}
            disabled={disabled}
            className={cn(
              // Base state
              "flex w-full rounded-md border bg-white px-3 py-1.5 text-sm placeholder:text-slate-400",
              "border-sidebar-border text-foreground",
              // Focus state
              "focus:outline-none focus:border-primary",
              // Disabled state
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-100",
              // File input reset
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              // icon spacing
              startIcon && "pl-10",
              endIcon && "pr-10",
              // error state
              error && "border-danger focus:border-danger",
              className,
            )}
            {...props}
          />

          {endIcon && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {endIcon}
            </div>
          )}
        </div>
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
