"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface DropdownContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const DropdownContext = React.createContext<DropdownContextType | undefined>(
  undefined,
);

function useDropdown() {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be used within a <Dropdown>");
  }
  return context;
}

// --- 1. Root Component ---
export function Dropdown({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  // Handle Click Outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle ESC Key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, toggle, close }}>
      <div
        ref={dropdownRef}
        className={cn("relative inline-block text-left", className)}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

// --- 2. Trigger ---
export function DropdownTrigger({
  children,
  className,
  asChild = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) {
  const { toggle, isOpen } = useDropdown();

  // Jika asChild=true, kita asumsikan user mengirimkan button sendiri.
  // Jika tidak, kita buatkan wrapper div sederhana.
  return (
    <div
      onClick={toggle}
      className={cn("cursor-pointer select-none", className)}
      role="button"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      {...props}
    >
      {children}
    </div>
  );
}

// --- 3. Content (Menu) ---
interface DropdownContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end"; // Mengatur posisi kiri/kanan
  width?: string;
}

export function DropdownContent({
  children,
  className,
  align = "end",
  width = "w-56",
}: DropdownContentProps) {
  const { isOpen } = useDropdown();
  const [isVisible, setIsVisible] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);

  // Logika Animasi (Sama persis dengan Modal agar konsisten)
  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Delay kecil untuk memicu transisi CSS
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      // Tunggu durasi animasi (200ms) sebelum unmount
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 rounded-lg shadow-lg ring-1 ring-black/5 focus:outline-none",
        width,
        // Positioning
        align === "end" ? "right-0" : "left-0",
        // Theming Colors
        "bg-sidebar border border-color-sidebar-border text-foreground",
        // Animation
        "transition-all duration-200 ease-out origin-top",
        isVisible
          ? "transform scale-100 opacity-100 translate-y-0"
          : "transform scale-95 opacity-0 -translate-y-2",
        className,
      )}
      role="menu"
    >
      <div className="py-1">{children}</div>
    </div>
  );
}

// --- 4. Items ---
interface DropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ElementType;
  href?: string;
  disabled?: boolean;
  destructive?: boolean;
}

export function DropdownItem({
  children,
  className,
  icon: Icon,
  href,
  disabled,
  destructive,
  onClick,
  ...props
}: DropdownItemProps) {
  const { close } = useDropdown();

  const baseStyles = cn(
    "group flex w-full items-center px-4 py-2 text-sm transition-colors cursor-pointer",
    // Hover States & Theming
    disabled
      ? "opacity-50 cursor-not-allowed"
      : "hover:bg-[var(--color-background)] hover:text-foreground",
    destructive &&
      "text-[var(--color-danger)] hover:text-[var(--color-danger)] hover:bg-red-50",
    className,
  );

  const content = (
    <>
      {Icon && (
        <Icon className="mr-2 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
      )}
      {children}
    </>
  );

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    close(); // Otomatis tutup saat item diklik
    if (onClick) onClick(e);
  };

  // Jika ada href, gunakan Next.js Link
  if (href && !disabled) {
    return (
      <Link href={href} className={baseStyles} onClick={() => close()}>
        {content}
      </Link>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={baseStyles}
      role="menuitem"
      {...props}
    >
      {content}
    </div>
  );
}

// --- 5. Utilities (Label, Separator) ---
export function DropdownLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-4 py-2 text-xs font-semibold text-sidebar-fg uppercase tracking-wider",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DropdownSeparator({ className }: { className?: string }) {
  return <div className={cn("my-1 h-px bg-sidebar-border", className)} />;
}
