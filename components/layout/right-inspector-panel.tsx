"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useAuth } from "@/lib/store/auth-context";
import { useCloud } from "@/lib/store/cloud-context";
import { useBilling } from "@/lib/store/billing-context";

const TELEMETRY_BARS = [
  18, 28, 14, 34, 22, 16, 30, 12, 24, 36, 18, 14, 26, 20, 32, 14, 22, 28, 16,
  38, 24, 18, 30, 44, 20, 14, 28, 22, 34, 16, 24, 18, 26, 14, 20, 12,
];

export function RightInspectorPanel({
  onOpenDeploy,
}: {
  onOpenDeploy: () => void;
}) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { instances, setTerminalInstance } = useCloud();
  const {
    setIsDepositModalOpen,
    walletBalance,
    currencySymbol,
    hourlyBurnRate,
    balance,
  } = useBilling();

  const [isPlaying, setIsPlaying] = useState(true);
  const [playheadIndex, setPlayheadIndex] = useState(23);
  const [speedMultiplier, setSpeedMultiplier] = useState<"1x" | "2x">("1x");
  const [isSignoutConfirmOpen, setIsSignoutConfirmOpen] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(
      () => {
        setPlayheadIndex((prev) => (prev + 1) % TELEMETRY_BARS.length);
      },
      speedMultiplier === "2x" ? 600 : 1200
    );
    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier]);

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

  const formattedSecond = String(playheadIndex + 10).padStart(2, "0");

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

      {/* Bottom Section: Real-time Telemetry & Infrastructure Pulse */}
      <div className="pt-5 mt-5 border-t border-[#E2DDD6] dark:border-[#282D3A] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4EA871] animate-pulse" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1E1E1E] dark:text-white">
              Fleet Telemetry
            </h3>
          </div>
          <span className="text-[11px] font-mono font-medium text-[#7A7975] dark:text-slate-400">
            {currencySymbol}{hourlyBurnRate}/hr
          </span>
        </div>

        {/* Vertical Bar Waveform Visualization with Red Playhead */}
        <div className="relative pt-2 pb-4">
          <div className="h-12 flex items-center justify-between gap-[2px]">
            {TELEMETRY_BARS.map((height, idx) => {
              const isCurrent = idx === playheadIndex;
              const isPast = idx < playheadIndex;
              return (
                <div
                  key={idx}
                  className="relative flex flex-col items-center justify-center h-full flex-1"
                >
                  {isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D94E4E] absolute -top-1" />
                  )}
                  <div
                    style={{ height: `${height}px` }}
                    className={`w-[2px] rounded-full transition-all duration-300 ${
                      isCurrent
                        ? "bg-[#D94E4E] w-[2.5px]"
                        : isPast
                        ? "bg-[#5A5A58] dark:bg-slate-300"
                        : "bg-[#B8B4AE] dark:bg-slate-600"
                    }`}
                  />
                  {isCurrent && (
                    <span className="absolute -bottom-3.5 text-[9px] font-mono font-medium text-[#5A5A58] dark:text-slate-300">
                      00:{formattedSecond}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Horizontal ruler ticks under waveform */}
          <div className="mt-2 h-1.5 border-b border-x border-[#D5D0C8] dark:border-[#282D3A] flex justify-between">
            <span className="w-[1px] h-1.5 bg-[#D5D0C8] dark:bg-[#282D3A]" />
            <span className="w-[1px] h-1.5 bg-[#D5D0C8] dark:bg-[#282D3A]" />
            <span className="w-[1px] h-1.5 bg-[#D5D0C8] dark:bg-[#282D3A]" />
          </div>
        </div>

        {/* Telemetry Stream Controls Bar */}
        <div className="flex items-center justify-between pt-1 text-[#1E1E1E] dark:text-white">
          <button
            type="button"
            onClick={() => setSpeedMultiplier((s) => (s === "1x" ? "2x" : "1x"))}
            className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-[#1C2029] border border-[#E7E4DF]/70 dark:border-[#282D3A] text-[#5A5A58] dark:text-slate-300 hover:text-[#1E1E1E] cursor-pointer"
          >
            {speedMultiplier}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setPlayheadIndex(
                  (prev) => (prev - 5 + TELEMETRY_BARS.length) % TELEMETRY_BARS.length
                )
              }
              aria-label="Rewind stream 10s"
              className="text-[#5A5A58] hover:text-[#1E1E1E] dark:text-slate-300 dark:hover:text-white cursor-pointer"
            >
              <MaterialIcon name="replay_10" size={18} />
            </button>

            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause telemetry pulse" : "Resume telemetry pulse"}
              className="w-7 h-7 rounded-full bg-[#222222] dark:bg-white text-white dark:text-[#1E1E1E] flex items-center justify-center cursor-pointer shadow-2xs"
            >
              <MaterialIcon name={isPlaying ? "pause" : "play_arrow"} size={16} />
            </button>

            <button
              type="button"
              onClick={() =>
                setPlayheadIndex((prev) => (prev + 5) % TELEMETRY_BARS.length)
              }
              aria-label="Forward stream 10s"
              className="text-[#5A5A58] hover:text-[#1E1E1E] dark:text-slate-300 dark:hover:text-white cursor-pointer"
            >
              <MaterialIcon name="forward_10" size={18} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (activeInstance) setTerminalInstance(activeInstance);
            }}
            title="Open Droplet Web Console"
            aria-label="Web Terminal Console"
            className="w-7 h-7 rounded-full bg-white dark:bg-[#1C2029] border border-[#E7E4DF]/70 dark:border-[#282D3A] text-[#222222] dark:text-white flex items-center justify-center hover:opacity-75 cursor-pointer"
          >
            <MaterialIcon name="terminal" size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
