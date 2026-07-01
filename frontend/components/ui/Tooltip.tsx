import React from "react";
import { cn } from "@/lib/utils";

type TooltipPosition = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: TooltipPosition;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = "top",
  className,
}: TooltipProps) {
  // Define positioning styles based on the 'position' prop
  const positionClasses: Record<TooltipPosition, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  // Define arrow positioning styles
  // The arrow on the opposite side of the tooltip's direction
  const arrowClasses: Record<TooltipPosition, string> = {
    top: "top-full left-1/2 -translate-x-1/2 -mt-1 border-t-slate-900",
    bottom: "bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-slate-900",
    left: "left-full top-1/2 -translate-y-1/2 -ml-1 border-l-slate-900",
    right: "right-full top-1/2 -translate-y-1/2 -mr-1 border-r-slate-900",
  };

  return (
    <div className="group relative flex items-center justify-center w-fit">
      {/* The Trigger Element */}
      {children}

      {/* The Tooltip Body */}
      <div
        className={cn(
          // Base styles
          "absolute z-50 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition-all duration-200 ease-in-out pointer-events-none",
          // Animation on hover (Slide and Fade)
          "group-hover:opacity-100",
          // Apply dynamic positioning
          positionClasses[position],
          className
        )}
      >
        {content}

        {/* The Arrow (Triangle) */}
        <div
          className={cn(
            "absolute border-4 border-transparent",
            arrowClasses[position]
          )}
        />
      </div>
    </div>
  );
}
