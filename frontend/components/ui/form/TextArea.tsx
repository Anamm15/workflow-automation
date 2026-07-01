import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string | boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, id, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          id={id}
          ref={ref}
          disabled={disabled}
          className={cn(
            // Base styles
            "flex w-full min-h-20 resize-y rounded-md border bg-white px-3 py-1.5 text-sm placeholder:text-slate-400",
            "border-sidebar-border text-foreground",
            // Focus State
            "focus:outline-none focus:border-primary transition-colors",
            // Disabled State
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-100",
            // Error state
            error && "border-danger focus:border-danger",

            className,
          )}
          {...props}
        />
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
