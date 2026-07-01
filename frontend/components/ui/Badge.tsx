import * as React from "react";
import { cn } from "@/lib/utils";

// --- Types ---
export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "outline"
  | "secondary";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  pulsing?: boolean;
}

// --- Style Configurations ---
const variants = {
  default:
    "bg-[var(--color-sidebar-border)] text-[var(--color-foreground)] border-transparent",
  primary:
    "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-transparent",
  success:
    "bg-[var(--color-success)]/10 text-[var(--color-success)] border-transparent",
  warning:
    "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-transparent",
  danger:
    "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-transparent",
  secondary:
    "bg-[var(--color-sidebar-fg)]/10 text-[var(--color-sidebar-fg)] border-transparent",
  outline:
    "bg-transparent border-[var(--color-sidebar-border)] text-[var(--color-foreground)] border",
};

const sizes = {
  sm: "h-5 text-[10px] px-2",
  md: "h-6 text-xs px-2.5",
};

export function Badge({
  className,
  variant = "default",
  size = "md",
  dot = false,
  pulsing = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2 mr-1.5">
          {pulsing && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          )}
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
      )}

      {children}
    </div>
  );
}
