"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Server,
  Database,
  HardDrive,
  Shield,
  Globe,
  Sliders,
  CreditCard,
  Cloud,
  ChevronRight,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCloud } from "@/lib/store/cloud-context";
import { useBilling } from "@/lib/store/billing-context";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
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

  const navItems: NavItem[] = [
    { name: "Overview", href: "/overview", icon: LayoutDashboard },
    { name: "Compute", href: "/compute", icon: Server, badge: instances.length },
    { name: "Databases", href: "/databases", icon: Database, badge: databases.length },
    { name: "Storage", href: "/storage", icon: HardDrive, badge: volumes.length + buckets.length },
    { name: "Network", href: "/network", icon: Shield, badge: firewalls.length },
    { name: "Domains", href: "/domains", icon: Globe, badge: domains.length },
    { name: "Billing", href: "/billing", icon: CreditCard },
    { name: "Team", href: "/team", icon: Users },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#11131A] border-r border-slate-200 dark:border-[#232736] flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto transition-colors duration-150">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-200 dark:border-[#232736] gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              CloudNova
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20">
                CONSOLE
              </span>
            </span>
            <p className="text-[11px] text-slate-500 font-normal">Enterprise Cloud Platform</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 pb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Infrastructure
            </span>
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/overview" && pathname === "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-600/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-[#161922]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </div>

                {item.badge !== undefined && item.badge !== null && (
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? "bg-blue-600/20 text-blue-700 dark:text-blue-300"
                        : "bg-slate-100 dark:bg-[#1E2230] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#232736]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Global Infrastructure Status Widget */}
      <div className="p-3 border-t border-slate-200 dark:border-[#232736] space-y-2">
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#161922] border border-slate-200 dark:border-[#232736]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SLA Health
            </span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              99.995%
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            8 Global Anycast regions online
          </p>
        </div>

        <button
          onClick={() => setIsDepositModalOpen(true)}
          className="w-full h-8 px-3 rounded-md bg-slate-100 dark:bg-[#1E2230] hover:bg-slate-200 dark:hover:bg-[#252B3D] border border-slate-200 dark:border-[#232736] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-between transition-colors cursor-pointer"
        >
          <span>Deposit Prepaid Funds</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
        </button>
      </div>
    </aside>
  );
}
