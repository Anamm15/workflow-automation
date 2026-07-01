"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Wallet,
  Users,
  Settings,
  ChevronDown,
  ShoppingCart,
} from "lucide-react";
import { clsx } from "clsx"; // Utility kecil untuk class conditional

// 1. Definisi Struktur Menu ERP
const MENU_ITEMS = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Inventory",
    icon: Package,
    submenu: [
      { label: "Stok Barang", href: "/inventory/stock" },
      { label: "Barang Masuk", href: "/inventory/incoming" },
      { label: "Barang Keluar", href: "/inventory/outgoing" },
      { label: "Opname", href: "/inventory/opname" },
    ],
  },
  {
    label: "Keuangan",
    icon: Wallet,
    submenu: [
      { label: "Transaksi", href: "/finance/transactions" },
      { label: "Laporan Laba/Rugi", href: "/finance/reports" },
      { label: "Faktur", href: "/finance/invoices" },
    ],
  },
  {
    label: "Penjualan (CRM)",
    icon: ShoppingCart,
    submenu: [
      { label: "Pesanan Baru", href: "/sales/orders" },
      { label: "Data Pelanggan", href: "/sales/customers" },
    ],
  },
  {
    label: "HRM & Karyawan",
    icon: Users,
    submenu: [
      { label: "Daftar Karyawan", href: "/hrm/employees" },
      { label: "Penggajian (Payroll)", href: "/hrm/payroll" },
      { label: "Absensi", href: "/hrm/attendance" },
    ],
  },
  {
    label: "Pengaturan",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  // State untuk melacak menu mana yang sedang terbuka
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <aside className="hidden w-64 flex-col border-r border-sidebar-border bg-sidebar md:flex h-full">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center gap-2 px-6 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
          E
        </div>
        <span className="text-lg font-bold text-foreground tracking-tight">
          EnterpriseOS
        </span>
      </div>

      {/* Scrollable Menu Area */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = item.href ? pathname === item.href : false;
          const isOpen = openMenus[item.label];
          const hasSubmenu = item.submenu && item.submenu.length > 0;

          return (
            <div key={item.label}>
              {/* Main Menu Item */}
              {hasSubmenu ? (
                // JIKA ADA SUBMENU: Render tombol Toggle
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={clsx(
                    "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                    isOpen
                      ? "bg-slate-100 text-primary"
                      : "text-sidebar-fg hover:bg-slate-50 hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      size={18}
                      className={isOpen ? "text-primary" : "text-slate-400"}
                    />
                    <span>{item.label}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={clsx(
                      "transition-transform duration-200 text-slate-400",
                      isOpen ? "rotate-180 text-primary" : "",
                    )}
                  />
                </button>
              ) : (
                // JIKA TIDAK ADA SUBMENU: Render Link biasa
                <Link
                  href={item.href || "#"}
                  className={clsx(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "bg-primary text-primary-fg shadow-sm"
                      : "text-sidebar-fg hover:bg-slate-50 hover:text-foreground",
                  )}
                >
                  <item.icon
                    size={18}
                    className={isActive ? "text-primary-fg" : "text-slate-400"}
                  />
                  <span>{item.label}</span>
                </Link>
              )}

              {/* Submenu Dropdown dengan Animasi Pure CSS Grid */}
              {hasSubmenu && (
                <div
                  className={clsx(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="ml-9 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                      {item.submenu?.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          className={clsx(
                            "block rounded-md px-3 py-2 text-sm transition-colors",
                            pathname === sub.href
                              ? "font-medium text-primary bg-primary/5"
                              : "text-slate-500 hover:text-foreground hover:bg-slate-50",
                          )}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer User Profile (Opsional) */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-200"></div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              Admin User
            </span>
            <span className="text-xs text-slate-500">IT Dept</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
