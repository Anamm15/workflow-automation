import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "destructive"
  | "ghost"
  | "success"
  | "warning"
  | "link";

type ButtonSize = "sm" | "default" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      isLoading = false,
      startIcon,
      endIcon,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants: Record<ButtonVariant, string> = {
      primary:
        "bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:bg-[var(--color-primary-hover)] shadow-sm",

      secondary:
        "bg-[var(--color-sidebar)] text-[var(--color-foreground)] border border-[var(--color-sidebar-border)] hover:bg-slate-50",

      outline:
        "border border-[var(--color-sidebar-border)] text-[var(--color-foreground)] hover:bg-slate-100",

      destructive:
        "bg-[var(--color-danger)] text-white hover:bg-red-500/90 shadow-sm",

      success:
        "bg-[var(--color-success)] text-white hover:bg-emerald-600 shadow-sm",

      warning:
        "bg-[var(--color-warning)] text-white hover:bg-amber-500 shadow-sm",

      ghost: "text-[var(--color-foreground)] hover:bg-slate-100",

      link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
    };

    const sizes: Record<ButtonSize, string> = {
      sm: "px-3 py-1 text-xs",
      default: "px-4 py-[0.375rem] text-sm",
      lg: "px-6 py-2 text-base",
      icon: "p-2",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}

        {!isLoading && startIcon}
        {children}
        {!isLoading && endIcon}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
