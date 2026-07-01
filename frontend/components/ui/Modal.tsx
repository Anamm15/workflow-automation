"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
interface ModalProps {
  open: boolean;
  setIsOpen: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  preventCloseOutside?: boolean;
  maxWidth?: "max-w-sm" | "max-w-md" | "max-w-lg" | "max-w-2xl" | "max-w-4xl";
}

// --- Main Component ---
export function Modal({
  open,
  setIsOpen,
  children,
  className,
  preventCloseOutside = false,
  maxWidth = "max-w-lg",
}: ModalProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open) {
      setShouldRender(true);
      document.body.style.overflow = "hidden";
      //a little bit delay
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      document.body.style.overflow = "unset";
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, setIsOpen]);

  if (!mounted || !shouldRender) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* 1. Backdrop / Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ease-out",
          isVisible ? "opacity-100" : "opacity-0",
        )}
        onClick={() => !preventCloseOutside && setIsOpen(false)}
        aria-hidden="true"
      />

      {/* 2. Modal Panel */}
      <div
        className={cn(
          "relative w-full flex flex-col shadow-2xl overflow-hidden pt-2",
          "bg-white text-foreground rounded-xl ring-1 ring-black/5",
          "transition-all duration-300 ease-out",
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0",
          maxWidth,
          className,
        )}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 hover:bg-sidebar-borderfocus:outline-none focus:ring-2 focus:ring-primary"
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </button>

        <div className="max-h-[90vh] overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export function ModalHeader({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 px-6 py-4 text-center sm:text-left",
        "border-b border-sidebar-border",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ModalTitle({
  className,
  children,
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <div
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        "text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ModalDescription({
  className,
  children,
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm", "text-sidebar-fg", className)}>{children}</p>
  );
}

export function ModalBody({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

export function ModalFooter({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 py-4",
        "bg-background border-t border-sidebar-border",
        "fixed bottom-0 w-full z-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
