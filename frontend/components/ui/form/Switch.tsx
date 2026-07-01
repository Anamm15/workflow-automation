import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./Label";
import { ErrorText } from "./ErrorText";

export interface SwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: React.ReactNode;
  description?: string;
  error?: string | boolean;
  className?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, error, id, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const switchId = id ?? generatedId;

    return (
      <div className={cn("w-full space-y-1.5", className)}>
        <div className="flex items-start justify-between gap-4">
          {/* Left content */}
          <div className="grid gap-1">
            {label && <Label htmlFor={switchId}>{label}</Label>}

            {description && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>

          {/* Switch */}
          <div className="relative inline-flex items-center">
            <input
              ref={ref}
              id={switchId}
              type="checkbox"
              disabled={disabled}
              className="peer sr-only"
              aria-invalid={!!error}
              {...props}
            />

            {/* Track */}
            <div
              className={cn(
                "h-6 w-11 rounded-full transition-colors duration-200",
                "bg-slate-200 dark:bg-slate-700",
                "peer-checked:bg-slate-900 dark:peer-checked:bg-slate-100",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-slate-400 peer-focus-visible:ring-offset-2",
                "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
                error && "bg-red-200 dark:bg-red-900 peer-checked:bg-red-500",
              )}
            />

            {/* Thumb */}
            <div
              className={cn(
                "pointer-events-none absolute left-0.5 top-0.5",
                "h-5 w-5 rounded-full bg-white shadow transition-transform",
                "peer-checked:translate-x-5",
              )}
            />
          </div>
        </div>

        {/* Error / Helper */}
        <ErrorText error={error} />
      </div>
    );
  },
);

Switch.displayName = "Switch";

export { Switch };
