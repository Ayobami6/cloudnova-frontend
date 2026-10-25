"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useCloud } from "@/lib/store/cloud-context";
import { useBilling } from "@/lib/store/billing-context";
import { useAuth } from "@/lib/store/auth-context";

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: string | number | null;
}

export function Sidebar() {
  const pathname = usePathname();
  const {
    instances,
    databases,
    volumes,
    buckets,
    firewalls,
    domains,
  } = useCloud();
  const { setIsDepositModalOpen } = useBilling();
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    { name: "Overview", href: "/overview", icon: "grid_view" },
    { name: "Compute", href: "/compute", icon: "dns", badge: instances.length },
    { name: "Databases", href: "/databases", icon: "database", badge: databases.length },
    { name: "Storage", href: "/storage", icon: "hard_drive", badge: volumes.length + buckets.length },
    { name: "Network", href: "/network", icon: "shield", badge: firewalls.length },
    { name: "Domains", href: "/domains", icon: "language", badge: domains.length },
    { name: "Billing", href: "/billing", icon: "credit_card" },
    { name: "Team", href: "/team", icon: "person" },
  ];

  return (
    <aside className="w-[76px] bg-[#222222] dark:bg-[#14161B] text-white flex flex-col items-center justify-between py-6 shrink-0 h-full select-none z-30">
      {/* Top: Circular Powder-Blue Brand Badge */}
      <div className="flex flex-col items-center gap-7 w-full">
        <Link
          href="/"
          title="TibiCloud Console"
          className="w-11 h-11 rounded-full bg-[#CFE0EC] text-[#222222] flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 13c2.5-5 6.5-5 9 0s6.5 5 9 0" strokeLinecap="round" />
            <circle cx="6.5" cy="9" r="1.2" fill="currentColor" stroke="none" />
          </svg>
        </Link>

        {/* Center Icon Stack */}
        <nav className="flex flex-col items-center gap-2.5 w-full">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href === "/overview" && pathname === "/");

            return (
              <Link
                key={item.name}
                href={item.href}
                title={
                  item.badge !== undefined && item.badge !== null
                    ? `${item.name} (${item.badge})`
                    : item.name
                }
                aria-label={item.name}
                className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 ${
                  isActive
                    ? "bg-white text-[#222222] shadow-md scale-100"
                    : "text-white/85 hover:text-white hover:bg-white/10"
                }`}
              >
                <MaterialIcon name={item.icon} size={20} />

                {/* Floating Tooltip Pill on Hover */}
                <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute left-16 px-3 py-1.5 rounded-full bg-[#222222] text-white text-xs font-medium whitespace-nowrap shadow-lg flex items-center gap-2 z-50 border border-white/10">
                  <span>{item.name}</span>
                  {item.badge !== undefined && item.badge !== null && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#F8D568] text-[#1E1E1E] text-[10px] font-semibold tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions: Wallet Deposit & Logout */}
      <div className="flex flex-col items-center gap-2.5">
        <button
          type="button"
          onClick={() => setIsDepositModalOpen(true)}
          title="Deposit Prepaid Funds"
          aria-label="Deposit Prepaid Funds"
          className="w-11 h-11 rounded-full text-white/85 hover:text-[#222222] hover:bg-[#F8D568] flex items-center justify-center transition-colors cursor-pointer"
        >
          <MaterialIcon name="headset_mic" size={20} />
        </button>

        <button
          type="button"
          onClick={logout}
          title="Sign Out"
          aria-label="Sign Out"
          className="w-11 h-11 rounded-full text-white/85 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
        >
          <MaterialIcon name="logout" size={20} />
        </button>
      </div>
    </aside>
  );
}
