"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";
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
  const {
    walletBalance,
    hourlyBurnRate,
    setIsDepositModalOpen,
    currencySymbol,
    currency,
    detectedCurrency,
    switchCurrency,
    isSwitchingCurrency,
  } = useBilling();

  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const unreadAlerts = alerts.filter((a) => !a.read);

  const firstName = user?.name ? user.name.split(" ")[0] : "Alexandra";

  return (
    <header className="pt-6 pb-3 px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 shrink-0 z-20">
      {/* Left: "Hi, Alexandra" Greeting + Subtle Region Pill */}
      <div className="flex items-center gap-4">
        <h1 className="text-[26px] font-semibold tracking-tight text-[#1E1E1E] dark:text-white leading-none">
          Hi, {firstName}
        </h1>

        {/* Datacenter Region Filter Pill */}
        <div className="relative hidden sm:block">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as DatacenterRegion | "all")}
            aria-label="Filter Datacenter Region"
            className="h-9 pl-3.5 pr-8 rounded-full bg-white dark:bg-[#1C2029] text-xs font-medium text-[#5A5A58] dark:text-slate-200 focus:outline-none appearance-none cursor-pointer shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:text-[#1E1E1E] dark:hover:text-white transition-colors"
          >
            <option value="all">All Regions (Global)</option>
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.flag} {r.name} ({r.city})
              </option>
            ))}
          </select>
          <MaterialIcon
            name="expand_more"
            size={16}
            className="text-[#8C8B87] absolute right-2.5 top-2.5 pointer-events-none"
          />
        </div>
      </div>

      {/* Right: White Pill Search, Wallet Pills & Circular Icon Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Floating White Pill Search Input (Exact Dribbble Match) */}
        <div className="relative w-48 sm:w-64">
          <MaterialIcon
            name="search"
            size={18}
            className="text-[#8C8B87] absolute left-4 top-3 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full h-10 pl-10 pr-4 rounded-full bg-white dark:bg-[#1C2029] text-xs text-[#1E1E1E] dark:text-slate-100 placeholder-[#8C8B87] focus:outline-none focus:ring-2 focus:ring-[#222222]/15 dark:focus:ring-white/20 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all"
          />
        </div>

        {/* Currency Switcher Pill */}
        {detectedCurrency === "NGN" && currency === "USD" ? (
          <button
            type="button"
            onClick={() => switchCurrency("NGN")}
            disabled={isSwitchingCurrency}
            className="hidden md:inline-flex items-center gap-1.5 h-10 px-3.5 rounded-full bg-[#D5EBD9] text-[#1E1E1E] text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Switch account billing currency to NGN (₦)"
          >
            <span>🇳🇬 NGN (₦)</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => switchCurrency(currency === "USD" ? "NGN" : "USD")}
            disabled={isSwitchingCurrency}
            className="hidden md:inline-flex items-center gap-1.5 h-10 px-3.5 rounded-full bg-white dark:bg-[#1C2029] hover:bg-slate-50 dark:hover:bg-[#232834] text-xs font-medium text-[#5A5A58] dark:text-slate-200 hover:text-[#1E1E1E] dark:hover:text-white shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-colors cursor-pointer disabled:opacity-50"
            title={`Active currency: ${currency}. Click to switch.`}
          >
            <span>{currency === "NGN" ? "🇳🇬 NGN" : "🇺🇸 USD"}</span>
          </button>
        )}

        {/* Prepaid Wallet Pill */}
        <button
          type="button"
          onClick={() => setIsDepositModalOpen(true)}
          className="hidden lg:inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white dark:bg-[#1C2029] hover:bg-[#F8D568] dark:hover:bg-[#232834] text-xs font-medium text-[#1E1E1E] dark:text-slate-100 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-colors cursor-pointer"
          title={`Hourly burn: ${currencySymbol}${hourlyBurnRate}/hr`}
        >
          <MaterialIcon name="account_balance_wallet" size={16} className="text-[#4EA871]" />
          <span className="tabular-nums font-semibold">
            {currencySymbol}
            {walletBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </button>

        {/* Primary Deploy Action Pill */}
        <button
          type="button"
          onClick={onOpenDeploy}
          className="h-10 px-4 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:hover:bg-slate-200 text-white dark:text-[#1E1E1E] text-xs font-medium inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <MaterialIcon name="add" size={16} />
          <span className="hidden sm:inline">Deploy</span>
        </button>

        {/* Theme Toggle Circular Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#1C2029] text-[#1E1E1E] dark:text-slate-200 hover:scale-105 flex items-center justify-center shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all cursor-pointer"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          <MaterialIcon name={theme === "dark" ? "light_mode" : "dark_mode"} size={18} />
        </button>

        {/* Notification Bell Circular Button (Exact Dribbble Match with green status dot) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            aria-label="Notifications"
            className="w-10 h-10 rounded-full bg-white dark:bg-[#1C2029] text-[#1E1E1E] dark:text-slate-200 hover:scale-105 flex items-center justify-center relative shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all cursor-pointer"
          >
            <MaterialIcon name="notifications" size={19} />
            {unreadAlerts.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#4EA871] absolute bottom-2.5 right-2.5 ring-2 ring-white dark:ring-[#1C2029]" />
            )}
          </button>

          {isAlertsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-[24px] bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] shadow-xl z-50 p-4 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7E4DF] dark:border-[#282D3A]">
                <span className="text-xs font-semibold text-[#1E1E1E] dark:text-white">
                  Operational Alerts
                </span>
                <button
                  type="button"
                  onClick={clearAllAlerts}
                  className="text-[11px] text-[#4EA871] hover:underline font-medium cursor-pointer"
                >
                  Mark all read
                </button>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => markAlertRead(alert.id)}
                    className={`p-2.5 rounded-2xl text-xs transition-colors cursor-pointer ${
                      alert.read
                        ? "bg-[#F6F6F4] dark:bg-[#161920] text-[#8C8B87]"
                        : "bg-[#EFECE8] dark:bg-[#232834] text-[#1E1E1E] dark:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between font-medium">
                      <span>{alert.title}</span>
                      <span className="text-[10px] text-[#8C8B87]">{alert.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-[#5A5A58] dark:text-slate-400 mt-0.5">
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile/Compact User Menu Trigger (visible when right inspector is hidden on smaller viewports) */}
        <div className="relative xl:hidden">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            aria-label="User profile menu"
            className="w-10 h-10 rounded-full bg-[#CFE0EC] text-[#1E1E1E] font-semibold text-xs flex items-center justify-center cursor-pointer"
          >
            {user?.name
              ? user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
              : "AR"}
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-[22px] bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] shadow-xl z-50 p-3 space-y-1">
              <div className="px-3 py-2 border-b border-[#E7E4DF] dark:border-[#282D3A]">
                <span className="text-xs font-semibold text-[#1E1E1E] dark:text-white block">
                  {user?.name || "Alexandra Rose"}
                </span>
                <span className="text-[11px] text-[#8C8B87] block truncate">
                  {user?.email || "alex.chen@tibicloud.io"}
                </span>
              </div>
              <Link
                href="/"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#1E1E1E] dark:text-slate-200 hover:bg-[#F6F6F4] dark:hover:bg-[#232834]"
              >
                <MaterialIcon name="open_in_new" size={15} />
                <span>Public Landing Page</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#D94E4E] hover:bg-[#FADBD8]/40 cursor-pointer text-left"
              >
                <MaterialIcon name="logout" size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
