import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./Label";

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: boolean;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, id, error, disabled, ...props }, ref) => {
    // Generate unique ID for accessibility if not provided
    const generatedId = React.useId();
    const uniqueId = id || generatedId;

    return (
      <div className={cn("flex items-start gap-3", className)}>
        <div className="relative mt-0.5">
          <input
            ref={ref}
            id={uniqueId}
            type="radio"
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />

          {/* Radio outer */}
          <div
            className={cn(
              // Base styles
              "flex h-4 w-4 items-center justify-center rounded-full border bg-white transition-colors",
              "border-sidebar-border",

              // Focus state
              "peer-focus-visible:border-primary",

              // Checked state
              "peer-checked:border-primary",

              // Disabled state
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",

              // Error override
              error && "border-danger peer-checked:border-danger",
            )}
          >
            {/* Inner dot */}
            <div
              className={cn(
                "h-2 w-2 rounded-full opacity-0 scale-0 transition-all duration-200",
                "peer-checked:opacity-100 peer-checked:scale-100",
                error ? "bg-danger" : "bg-primary",
              )}
            />
          </div>
        </div>

        <div className="grid gap-1 leading-snug">
          <Label htmlFor={uniqueId} required={props.required}>
            {label}
          </Label>

          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>
    );
  },
);

Radio.displayName = "Radio";

export { Radio };
