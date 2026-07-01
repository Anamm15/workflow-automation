import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Label } from "./Label";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: React.ReactNode;
  description?: string;
  error?: string | boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, disabled, id, ...props }, ref) => {
    // Generate unique ID if not provided
    const generatedId = React.useId();
    const uniqueId = id || generatedId;

    return (
      <div className={cn("flex items-start gap-3", className)}>
        <div className="relative mt-0.5">
          <input
            ref={ref}
            id={uniqueId}
            type="checkbox"
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />

          {/* Checkbox box */}
          <div
            className={cn(
              // Base styles
              "flex h-5 w-5 items-center justify-center rounded-md border bg-white transition-colors",
              "border-sidebar-border",

              // Focus state
              "peer-focus-visible:border-primary",

              // Check state
              "peer-checked:bg-primary peer-checked:border-primary",

              // Disabled state
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",

              // Error state
              error &&
                "border-danger peer-checked:bg-danger peer-checked:border-danger",
            )}
          >
            <Check
              className="h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
              strokeWidth={3}
            />
          </div>
        </div>

        <div className="grid gap-1 leading-snug">
          {label && (
            <Label htmlFor={uniqueId} required={props.required}>
              {label}
            </Label>
          )}

          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
