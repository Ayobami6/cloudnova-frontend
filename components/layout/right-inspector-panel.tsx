"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useAuth } from "@/lib/store/auth-context";
import { useCloud } from "@/lib/store/cloud-context";
import { useBilling } from "@/lib/store/billing-context";

export function RightInspectorPanel({
  onOpenDeploy,
}: {
  onOpenDeploy: () => void;
}) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { instances, databases, volumes, setTerminalInstance } = useCloud();
  const {
    setIsDepositModalOpen,
    walletBalance,
    currencySymbol,
    hourlyBurnRate,
    balance,
  } = useBilling();

  const [isSignoutConfirmOpen, setIsSignoutConfirmOpen] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const displayName = user?.name || "CloudNova Operator";
  const email = user?.email || "operator@cloudnova.io";
  const organizationName = user?.company || "Primary Team";
  const roleName = user?.role || "OWNER";
  const accountNumber =
    user?.accountNumber ||
    balance?.account_number ||
    (user?.accountId ? `acct_${user.accountId.slice(0, 8)}` : "acct_live_01");

  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "CN";

  const activeInstancesCount = instances.filter(
    (i) => i.status === "active"
  ).length;

  const activeInstance =
    instances.find((i) => i.status === "active") || instances[0];

  const handleCopyAccountId = () => {
    if (accountNumber) {
      navigator.clipboard?.writeText(accountNumber);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  const handleEditProfile = () => {
    router.push("/team");
  };

  const handleSignOut = () => {
    logout();
  };

  return (
    <aside className="hidden xl:flex flex-col justify-between w-[320px] 2xl:w-[348px] shrink-0 my-4 mr-4 p-6 nixtio-stone-panel text-[#1E1E1E] dark:text-[#F4F5F7] overflow-y-auto">
      {/* Top Profile & User Identity Section */}
      <div>
        {/* Top Mini Actions */}
        <div className="flex items-center justify-between pb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8B87] dark:text-slate-400">
            Active Profile
          </span>
          <button
            type="button"
            onClick={handleEditProfile}
            title="Manage Team & Account Settings"
            className="text-[#5A5A58] hover:text-[#1E1E1E] dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <MaterialIcon name="settings" size={18} />
          </button>
        </div>

        {/* Profile Card Header */}
        <div className="flex flex-col items-center text-center mt-2">
          {/* Circular Avatar with Active Green Status Dot */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#CFE0EC] dark:bg-[#232834] flex items-center justify-center font-bold text-xl text-[#1E1E1E] dark:text-white overflow-hidden shadow-sm border-2 border-white dark:border-[#282D3A]">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#CFE0EC] to-[#B8D2E4] dark:from-[#282D3A] dark:to-[#1C2029]">
                  <span className="tracking-wide">{initials}</span>
                </div>
              )}
            </div>
            <span
              title="Session Active & Authenticated"
              className="w-4 h-4 rounded-full bg-[#4EA871] border-2 border-[#EFECE8] dark:border-[#161920] absolute bottom-0.5 right-0.5 shadow-2xs"
            />
          </div>

          <h2 className="mt-3 text-base font-semibold tracking-tight text-[#1E1E1E] dark:text-white">
            {displayName}
          </h2>

          <p className="text-xs text-[#7A7975] dark:text-slate-400 truncate max-w-[260px]">
            {email}
          </p>

          {/* Organization & Role Pill */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#1C2029] text-[11px] font-medium text-[#5A5A58] dark:text-slate-300 shadow-2xs border border-[#E7E4DF]/60 dark:border-[#282D3A]">
            <MaterialIcon
              name="domain"
              size={13}
              className="text-[#8C8B87] dark:text-slate-400"
            />
            <span className="font-semibold text-[#1E1E1E] dark:text-white">
              {organizationName}
            </span>
            <span className="text-[#B8B4AE] dark:text-slate-600">•</span>
            <span className="text-[10px] uppercase font-bold text-[#E58A3C]">
              {roleName}
            </span>
          </div>

          {/* 3 Pastel Action Pills: Edit Profile, Deposit Wallet, Sign Out */}
          <div className="mt-4 grid grid-cols-3 gap-2 w-full">
            {/* Edit Profile */}
            <button
              type="button"
              onClick={handleEditProfile}
              title="Edit Profile & Organizations"
              className="h-9 px-2 rounded-full bg-[#F8D568] hover:brightness-95 text-[#1E1E1E] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs text-xs font-semibold"
            >
              <MaterialIcon name="edit" size={15} />
              <span>Edit</span>
            </button>

            {/* Deposit Wallet */}
            <button
              type="button"
              onClick={() => setIsDepositModalOpen(true)}
              title="Top up prepaid cloud balance"
              className="h-9 px-2 rounded-full bg-[#E6D8EA] hover:brightness-95 text-[#1E1E1E] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs text-xs font-semibold"
            >
              <MaterialIcon name="account_balance_wallet" size={15} />
              <span>Funds</span>
            </button>

            {/* Sign Out */}
            <button
              type="button"
              onClick={() => setIsSignoutConfirmOpen(true)}
              title="Sign out of your session"
              className="h-9 px-2 rounded-full bg-[#CFE0EC] hover:bg-[#FADBD8] hover:text-[#D94E4E] text-[#1E1E1E] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs text-xs font-semibold"
            >
              <MaterialIcon name="logout" size={15} />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Confirmation modal for Sign Out if clicked */}
        {isSignoutConfirmOpen && (
          <div className="mt-3 p-3.5 rounded-2xl bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] shadow-md space-y-2 text-xs">
            <p className="font-medium text-[#1E1E1E] dark:text-white">
              Sign out from this device?
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex-1 h-7 rounded-full bg-[#D94E4E] text-white font-medium hover:bg-[#C03E3E] transition-colors cursor-pointer"
              >
                Sign Out
              </button>
              <button
                type="button"
                onClick={() => setIsSignoutConfirmOpen(false)}
                className="flex-1 h-7 rounded-full bg-[#EFECE8] dark:bg-[#282D3A] text-[#1E1E1E] dark:text-slate-200 font-medium hover:brightness-95 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="my-5 h-[1px] bg-[#E2DDD6] dark:bg-[#282D3A]" />

        {/* Middle Section: Account & Security Overview */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1E1E1E] dark:text-white">
              Account Details
            </span>
            <button
              type="button"
              onClick={handleCopyAccountId}
              title="Copy Account Identifier"
              className="text-[11px] text-[#4EA871] hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <MaterialIcon name={copiedAccount ? "check" : "content_copy"} size={13} />
              <span>{copiedAccount ? "Copied" : "Copy ID"}</span>
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {/* Account ID / Number */}
            <div className="p-3 rounded-2xl bg-white dark:bg-[#1C2029] border border-[#E7E4DF]/70 dark:border-[#282D3A] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#CFE0EC] dark:bg-[#282D3A] text-[#1E1E1E] dark:text-slate-200 flex items-center justify-center shrink-0">
                  <MaterialIcon name="badge" size={15} />
                </span>
                <div>
                  <span className="text-[10px] text-[#8C8B87] uppercase font-semibold block">
                    Account Number
                  </span>
                  <span className="font-mono font-medium text-[11px] text-[#1E1E1E] dark:text-white">
                    {accountNumber}
                  </span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D5EBD9] dark:bg-[#4EA871]/20 text-[#2D7347] dark:text-[#76CE93] font-semibold">
                Active
              </span>
            </div>

            {/* Email Verification & Security */}
            <div className="p-3 rounded-2xl bg-white dark:bg-[#1C2029] border border-[#E7E4DF]/70 dark:border-[#282D3A] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#D5EBD9] dark:bg-[#282D3A] text-[#2D7347] dark:text-[#76CE93] flex items-center justify-center shrink-0">
                  <MaterialIcon name="verified_user" size={15} />
                </span>
                <div>
                  <span className="text-[10px] text-[#8C8B87] uppercase font-semibold block">
                    Email Security
                  </span>
                  <span className="text-[11px] font-medium text-[#1E1E1E] dark:text-white">
                    {user?.emailVerified ? "Verified & Secured" : "Pending OTP"}
                  </span>
                </div>
              </div>
              <MaterialIcon
                name={user?.emailVerified ? "check_circle" : "help_outline"}
                size={16}
                className={user?.emailVerified ? "text-[#4EA871]" : "text-[#E58A3C]"}
              />
            </div>

            {/* Wallet Preloaded Funds */}
            <div className="p-3 rounded-2xl bg-white dark:bg-[#1C2029] border border-[#E7E4DF]/70 dark:border-[#282D3A] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#E6D8EA] dark:bg-[#282D3A] text-[#1E1E1E] dark:text-slate-200 flex items-center justify-center shrink-0">
                  <MaterialIcon name="account_balance_wallet" size={15} />
                </span>
                <div>
                  <span className="text-[10px] text-[#8C8B87] uppercase font-semibold block">
                    Prepaid Balance
                  </span>
                  <span className="font-semibold text-xs tabular-nums text-[#1E1E1E] dark:text-white">
                    {currencySymbol}
                    {walletBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDepositModalOpen(true)}
                className="text-[11px] font-semibold text-[#4EA871] hover:underline cursor-pointer"
              >
                + Top Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Resource Fleet & Health Overview */}
      <div className="pt-5 mt-5 border-t border-[#E2DDD6] dark:border-[#282D3A] space-y-3.5">
        {/* Header with Health Pulse and Hourly Burn Rate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4EA871] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4EA871]" />
            </span>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1E] dark:text-white">
              Fleet Overview
            </h3>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-[#1C2029] border border-[#E7E4DF]/70 dark:border-[#282D3A] text-[#1E1E1E] dark:text-slate-300">
            {currencySymbol}{hourlyBurnRate}/hr
          </span>
        </div>

        {/* Resources Metrics Cards Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Compute Droplets */}
          <div className="p-3 rounded-2xl bg-white dark:bg-[#1C2029] border border-[#E7E4DF]/70 dark:border-[#282D3A] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8C8B87]">
              <span className="text-[10px] uppercase font-semibold">Droplets</span>
              <MaterialIcon name="dns" size={14} className="text-[#4EA871]" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-base font-bold text-[#1E1E1E] dark:text-white tabular-nums">
                {activeInstancesCount}
              </span>
              <span className="text-[11px] text-[#8C8B87] dark:text-slate-400">
                / {instances.length} active
              </span>
            </div>
          </div>

          {/* Databases & Storage */}
          <div className="p-3 rounded-2xl bg-white dark:bg-[#1C2029] border border-[#E7E4DF]/70 dark:border-[#282D3A] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8C8B87]">
              <span className="text-[10px] uppercase font-semibold">Storage & DB</span>
              <MaterialIcon name="storage" size={14} className="text-[#3B82F6]" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-base font-bold text-[#1E1E1E] dark:text-white tabular-nums">
                {databases.length + volumes.length}
              </span>
              <span className="text-[11px] text-[#8C8B87] dark:text-slate-400">
                units
              </span>
            </div>
          </div>
        </div>

        {/* Primary Droplet Quick Console / Launch Bar */}
        {activeInstance ? (
          <div className="p-3 rounded-2xl bg-white dark:bg-[#1C2029] border border-[#E7E4DF]/70 dark:border-[#282D3A] flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4EA871] shrink-0" />
                <span className="text-xs font-semibold text-[#1E1E1E] dark:text-white truncate">
                  {activeInstance.name}
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#8C8B87] dark:text-slate-400 truncate pl-3">
                {activeInstance.ipv4 || activeInstance.region}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTerminalInstance(activeInstance)}
              title="Launch Droplet Web Terminal Console"
              className="h-7 px-2.5 rounded-full bg-[#EFECE8] hover:bg-[#E2DDD6] dark:bg-[#282D3A] dark:hover:bg-[#32394A] text-[#1E1E1E] dark:text-white flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer shrink-0"
            >
              <MaterialIcon name="terminal" size={14} />
              <span>Console</span>
            </button>
          </div>
        ) : null}

        {/* Action Button: Deploy New Droplet */}
        <button
          type="button"
          onClick={onOpenDeploy}
          className="w-full h-9 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#1E1E1E] flex items-center justify-center gap-1.5 transition-all text-xs font-semibold shadow-2xs cursor-pointer"
        >
          <MaterialIcon name="add" size={16} />
          <span>Deploy New Droplet</span>
        </button>
      </div>
    </aside>
  );
}
