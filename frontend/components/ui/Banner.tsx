"use client";

import * as React from "react";
import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
type BannerVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "gradient";
type BannerSize = "sm" | "md" | "lg";

interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BannerVariant;
  size?: BannerSize;
  title?: string;
  description?: React.ReactNode;
  icon?: React.ReactNode | boolean; // true = auto icon based on variant
  action?: React.ReactNode; // Tombol aksi (misal: "Lihat Detail")
  onDismiss?: () => void; // Jika ada, tombol X akan muncul
  dismissible?: boolean; // State lokal untuk dismiss
  sticky?: boolean; // Menempel di atas
}

// --- Styles Config ---
const variantStyles: Record<BannerVariant, string> = {
  default:
    "bg-[var(--color-sidebar)] border-[var(--color-sidebar-border)] text-[var(--color-foreground)]",
  success:
    "bg-[var(--color-success)]/10 border-[var(--color-success)]/20 text-[var(--color-success)]",
  warning:
    "bg-[var(--color-warning)]/10 border-[var(--color-warning)]/20 text-[var(--color-warning)]",
  danger:
    "bg-[var(--color-danger)]/10 border-[var(--color-danger)]/20 text-[var(--color-danger)]",
  info: "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20 text-[var(--color-primary)]",
  gradient:
    "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white border-transparent shadow-lg",
};

const iconMap: Record<
  Exclude<BannerVariant, "gradient" | "default">,
  React.ElementType
> = {
  success: CheckCircle,
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
};

export function Banner({
  variant = "default",
  size = "md",
  title,
  description,
  icon = true,
  action,
  onDismiss,
  dismissible = false,
  sticky = false,
  className,
  children,
  ...props
}: BannerProps) {
  const [isVisible, setIsVisible] = React.useState(true);
  const [isRemoved, setIsRemoved] = React.useState(false);

  // Handle Dismiss Animation
  const handleDismiss = () => {
    setIsVisible(false);
    // Waiting for css animation
    setTimeout(() => {
      setIsRemoved(true);
      if (onDismiss) onDismiss();
    }, 300);
  };

  // Auto Icon Logic - Memoized to prevent recreation during render
  const IconComponent = React.useMemo(() => {
    if (icon === true && variant !== "gradient" && variant !== "default") {
      return iconMap[variant as keyof typeof iconMap];
    } else if (React.isValidElement(icon)) {
      return () => icon;
    }
    return null;
  }, [icon, variant]);

  if (isRemoved) return null;

  return (
    <div
      role="alert"
      className={cn(
        "relative flex w-full overflow-hidden transition-all duration-300 ease-in-out",
        // Base Layout
        size === "sm" ? "p-3 text-sm" : size === "lg" ? "p-6" : "p-4",
        sticky ? "sticky top-0 z-40" : "rounded-xl border",
        // Variant Colors
        variantStyles[variant],
        // Animation State
        isVisible
          ? "translate-y-0 opacity-100 max-h-125"
          : "-translate-y-2 opacity-0 max-h-0 py-0 border-none margin-0 overflow-hidden",
        className,
      )}
      {...props}
    >
      {variant === "gradient" && (
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      )}

      <div className="flex w-full items-start gap-4">
        {/* 1. ICON SECTION */}
        {IconComponent && (
          <div className={cn("shrink-0", size === "lg" ? "mt-1" : "mt-0.5")}>
            <IconComponent
              className={cn(
                "h-5 w-5",
                variant === "gradient" ? "text-white/80" : "currentColor",
              )}
            />
          </div>
        )}

        {/* 2. CONTENT SECTION */}
        <div className="flex-1 space-y-1">
          {title && (
            <h5
              className={cn(
                "font-semibold leading-none tracking-tight",
                variant === "gradient" ? "text-white" : "",
              )}
            >
              {title}
            </h5>
          )}

          {(description || children) && (
            <div
              className={cn(
                "text-sm opacity-90",
                variant === "gradient" ? "text-white/80" : "opacity-80",
              )}
            >
              {description}
              {children}
            </div>
          )}

          {/* Action Button (Mobile Layout: block in bottom) */}
          {action && <div className="pt-2">{action}</div>}
        </div>

        {/* 3. ACTION / DISMISS SECTION */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Action can be placed in right, depend on variant */}

          {(dismissible || onDismiss) && (
            <button
              onClick={handleDismiss}
              className={cn(
                "rounded-md p-1 transition-colors focus:outline-none focus:ring-2",
                variant === "gradient"
                  ? "hover:bg-white/20 text-white focus:ring-white"
                  : "hover:bg-black/5 focus:ring-primary",
              )}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
