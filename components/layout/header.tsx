"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Wallet,
  Zap,
  Plus,
  CheckCircle2,
  Check,
  ChevronDown,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  ExternalLink,
} from "lucide-react";
import { useCloud } from "@/lib/store/cloud-context";
import { useBilling } from "@/lib/store/billing-context";
import { useTheme } from "@/lib/store/theme-context";
import { useAuth } from "@/lib/store/auth-context";
import { REGIONS } from "@/lib/mock-data/initial-state";
import { DatacenterRegion } from "@/lib/types/cloud";

export function Header({ onOpenDeploy }: { onOpenDeploy: () => void }) {
  const {
    selectedRegion,
    setSelectedRegion,
    searchQuery,
    setSearchQuery,
    alerts,
    markAlertRead,
    clearAllAlerts,
  } = useCloud();
  const { walletBalance, hourlyBurnRate, setIsDepositModalOpen } = useBilling();

  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const unreadAlerts = alerts.filter((a) => !a.read);

  return (
    <header className="h-16 bg-white dark:bg-[#11131A] border-b border-slate-200 dark:border-[#232736] px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors duration-150">
      {/* Left: Region Selector & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {/* Datacenter Region Selector */}
        <div className="relative">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as DatacenterRegion | "all")}
            aria-label="Filter Datacenter Region"
            className="h-9 px-3 pr-8 rounded-md bg-slate-50 dark:bg-[#161922] border border-slate-200 dark:border-[#232736] text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer hover:border-slate-300 dark:hover:border-[#33394D] transition-colors"
          >
            <option value="all">🌐 All Regions (Global)</option>
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.flag} {r.name} ({r.city})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>

        {/* Omni Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search VMs, IPs, domains, buckets..."
            className="w-full h-9 pl-9 pr-3 rounded-md bg-slate-50 dark:bg-[#161922] border border-slate-200 dark:border-[#232736] text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 hover:border-slate-300 dark:hover:border-[#33394D] transition-colors"
          />
        </div>
      </div>

      {/* Right: Metrics, Alerts & Actions */}
      <div className="flex items-center gap-3">
        {/* Burn Rate */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 dark:bg-[#161922] border border-slate-200 dark:border-[#232736] text-xs">
          <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span className="text-slate-500 dark:text-slate-400">Burn:</span>
          <span className="font-mono font-medium text-slate-800 dark:text-slate-200">${hourlyBurnRate}/hr</span>
        </div>

        {/* Prepaid Wallet Balance */}
        <button
          onClick={() => setIsDepositModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-50 dark:bg-[#161922] hover:bg-slate-100 dark:hover:bg-[#1E2230] border border-slate-200 dark:border-[#232736] hover:border-slate-300 dark:hover:border-[#33394D] text-xs transition-colors cursor-pointer"
        >
          <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-slate-500 dark:text-slate-400">Balance:</span>
          <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
            ${walletBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-md bg-slate-50 dark:bg-[#161922] hover:bg-slate-100 dark:hover:bg-[#1E2230] border border-slate-200 dark:border-[#232736] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Notification Bell & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className="w-9 h-9 rounded-md bg-slate-50 dark:bg-[#161922] hover:bg-slate-100 dark:hover:bg-[#1E2230] border border-slate-200 dark:border-[#232736] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center justify-center relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-blue-500 absolute top-2 right-2 ring-2 ring-white dark:ring-[#161922]" />
            )}
          </button>

          {isAlertsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] shadow-xl z-50 p-3 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#232736]">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Alerts & System Events</span>
                <button
                  onClick={clearAllAlerts}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Mark all read
                </button>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => markAlertRead(alert.id)}
                    className={`p-2 rounded-md text-xs transition-colors cursor-pointer ${
                      alert.read ? "bg-slate-50 dark:bg-[#11131A]/40 text-slate-400 dark:text-slate-500" : "bg-slate-100 dark:bg-[#1E2230] text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between font-medium">
                      <span>{alert.title}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{alert.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary Deploy Action */}
        <button
          onClick={onOpenDeploy}
          className="h-9 px-3.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy</span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative pl-1 border-l border-slate-200 dark:border-[#232736]">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-500/30 transition-all cursor-pointer"
            aria-label="User profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center border border-blue-500 shadow-xs">
              {user?.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                : "AC"}
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] shadow-xl z-50 p-2 space-y-1">
              <div className="px-3 py-2 border-b border-slate-200 dark:border-[#232736]">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                  {user?.name || "Alex Chen"}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                  {user?.email || "alex.chen@cloudnova.io"}
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono mt-1 block">
                  {user?.company || "NovaScale Technologies"}
                </span>
              </div>

              <Link
                href="/"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-md text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E2230] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Public Landing Page</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">/</span>
              </Link>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
