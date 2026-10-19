"use client";

import React, { useState, useEffect } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useAuth } from "@/lib/store/auth-context";
import { useCloud } from "@/lib/store/cloud-context";
import { useBilling } from "@/lib/store/billing-context";

const WAVEFORM_BARS = [
  18, 28, 14, 34, 22, 16, 30, 12, 24, 36, 18, 14, 26, 20, 32, 14, 22, 28, 16,
  38, 24, 18, 30, 44, 20, 14, 28, 22, 34, 16, 24, 18, 26, 14, 20, 12,
];

export function RightInspectorPanel({
  onOpenDeploy,
}: {
  onOpenDeploy: () => void;
}) {
  const { user } = useAuth();
  const { instances, alerts, setTerminalInstance } = useCloud();
  const { setIsDepositModalOpen, walletBalance, currencySymbol } = useBilling();

  const [isPlaying, setIsPlaying] = useState(true);
  const [playheadIndex, setPlayheadIndex] = useState(23);
  const [speedMultiplier, setSpeedMultiplier] = useState<"1x" | "2x">("1x");

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(
      () => {
        setPlayheadIndex((prev) => (prev + 1) % WAVEFORM_BARS.length);
      },
      speedMultiplier === "2x" ? 600 : 1200
    );
    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier]);

  const displayName = user?.name || "Alexandra Rose";
  const activeInstance = instances.find((i) => i.status === "active") || instances[0];

  const feedEntries = [
    {
      time: "1:12",
      actor: "Client:",
      avatarBg: "bg-[#CFE0EC]",
      icon: "person",
      text:
        alerts[0]?.message ||
        "Provisioned high-availability KVM compute droplet and attached NVMe volume.",
    },
    {
      time: "1:31",
      actor: "Manager:",
      avatarBg: "bg-[#E5B899]",
      icon: "support_agent",
      text:
        alerts[1]?.message ||
        "Understood, automated Anycast DNS routing and Layer-7 load balancing active.",
    },
    {
      time: "2:11",
      actor: "Client:",
      avatarBg: "bg-[#E6D8EA]",
      icon: "verified_user",
      text: `Wallet balance verified (${currencySymbol}${walletBalance.toLocaleString("en-US", {
        minimumFractionDigits: 2,
      })}). All ${instances.length} nodes healthy and optimized.`,
    },
  ];

  const formattedSecond = String(playheadIndex + 10).padStart(2, "0");

  return (
    <aside className="hidden xl:flex flex-col justify-between w-[320px] 2xl:w-[348px] shrink-0 my-4 mr-4 p-6 nixtio-stone-panel text-[#1E1E1E] dark:text-[#F4F5F7] overflow-y-auto">
      {/* Top Profile & Quick Action Pills */}
      <div>
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setIsDepositModalOpen(true)}
            aria-label="Account options"
            className="text-[#5A5A58] hover:text-[#1E1E1E] dark:text-slate-400 dark:hover:text-white cursor-pointer"
          >
            <MaterialIcon name="more_horiz" size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center -mt-2">
          {/* Circular Avatar with Green Status Dot */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#CFE0EC] dark:bg-[#232834] flex items-center justify-center overflow-hidden shadow-sm border-2 border-white dark:border-[#282D3A]">
              <svg viewBox="0 0 80 80" className="w-full h-full">
                <rect width="80" height="80" fill="#BFD2E0" />
                <circle cx="40" cy="30" r="14" fill="#D99B78" />
                <path
                  d="M18 76 C18 55, 62 55, 62 76 Z"
                  fill="#E87A5D"
                />
                <path
                  d="M26 26 C26 14, 54 14, 54 26 C50 20, 30 20, 26 26 Z"
                  fill="#2B2118"
                />
              </svg>
            </div>
            <span className="w-3.5 h-3.5 rounded-full bg-[#4EA871] border-2 border-[#EFECE8] dark:border-[#161920] absolute bottom-1 right-1" />
          </div>

          <h2 className="mt-3 text-base font-semibold tracking-tight text-[#1E1E1E] dark:text-white">
            {displayName}
          </h2>

          <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-[#8C8B87] dark:text-slate-400">
            <MaterialIcon name="label" size={14} className="text-[#8C8B87]" />
            <span>
              Node type:{" "}
              <strong className="font-semibold text-[#5A5A58] dark:text-slate-200">
                { user?.role || "Callback" }
              </strong>
            </span>
          </p>

          {/* 3 Signature Pastel Pill Buttons (Yellow Star, Lavender Call/Deploy, Blue Chat/Terminal) */}
          <div className="mt-4 flex items-center justify-center gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setIsDepositModalOpen(true)}
              title="Top Up Prepaid Wallet"
              className="h-9 px-5 rounded-full bg-[#F8D568] text-[#1E1E1E] flex items-center justify-center hover:brightness-95 transition-all cursor-pointer shadow-2xs"
            >
              <MaterialIcon name="star" size={17} />
            </button>

            <button
              type="button"
              onClick={onOpenDeploy}
              title="Deploy New Compute Droplet"
              className="h-9 px-5 rounded-full bg-[#E6D8EA] text-[#1E1E1E] flex items-center justify-center hover:brightness-95 transition-all cursor-pointer shadow-2xs"
            >
              <MaterialIcon name="call" size={17} />
            </button>

            <button
              type="button"
              onClick={() => {
                if (activeInstance) setTerminalInstance(activeInstance);
              }}
              title="Open Web Console Terminal"
              className="h-9 px-5 rounded-full bg-[#CFE0EC] text-[#1E1E1E] flex items-center justify-center hover:brightness-95 transition-all cursor-pointer shadow-2xs"
            >
              <MaterialIcon name="chat" size={17} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="my-5 h-[1px] bg-[#E2DDD6] dark:bg-[#282D3A]" />

        {/* Middle Section: "Summarize" Live Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1E1E1E] dark:text-white">
              Summarize
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (activeInstance) setTerminalInstance(activeInstance);
                }}
                title="Export Telemetry Log"
                className="w-5 h-5 rounded-full bg-[#222222] dark:bg-white text-white dark:text-[#1E1E1E] flex items-center justify-center cursor-pointer"
              >
                <MaterialIcon name="arrow_downward" size={13} />
              </button>
              <button
                type="button"
                onClick={onOpenDeploy}
                aria-label="More summary actions"
                className="text-[#5A5A58] hover:text-[#1E1E1E] dark:text-slate-400 cursor-pointer"
              >
                <MaterialIcon name="more_horiz" size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {feedEntries.map((item, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#8C8B87] tabular-nums w-7">
                    {item.time}
                  </span>
                  <span
                    className={`w-6 h-6 rounded-full ${item.avatarBg} text-[#1E1E1E] flex items-center justify-center shrink-0`}
                  >
                    <MaterialIcon name={item.icon} size={14} />
                  </span>
                  <span className="font-semibold text-[#1E1E1E] dark:text-white">
                    {item.actor}
                  </span>
                </div>
                <p className="pl-9 text-[11px] text-[#7A7975] dark:text-slate-400 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: "Call Recording" / Telemetry Waveform Widget */}
      <div className="pt-5 mt-5 border-t border-[#E2DDD6] dark:border-[#282D3A] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1E1E1E] dark:text-white">
            Call Recording
          </h3>
          <button
            type="button"
            onClick={() => setPlayheadIndex((prev) => (prev + 4) % WAVEFORM_BARS.length)}
            className="text-[11px] text-[#8C8B87] hover:text-[#1E1E1E] dark:hover:text-white transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>

        {/* Vertical Bar Waveform Visualization with Red Playhead */}
        <div className="relative pt-2 pb-4">
          <div className="h-12 flex items-center justify-between gap-[2px]">
            {WAVEFORM_BARS.map((height, idx) => {
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

        {/* Playback Controls Bar */}
        <div className="flex items-center justify-between pt-1 text-[#1E1E1E] dark:text-white">
          <button
            type="button"
            onClick={() => setSpeedMultiplier((s) => (s === "1x" ? "2x" : "1x"))}
            className="text-xs font-medium text-[#5A5A58] dark:text-slate-400 hover:text-[#1E1E1E] cursor-pointer"
          >
            {speedMultiplier}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setPlayheadIndex(
                  (prev) => (prev - 5 + WAVEFORM_BARS.length) % WAVEFORM_BARS.length
                )
              }
              aria-label="Rewind 10 seconds"
              className="text-[#5A5A58] hover:text-[#1E1E1E] dark:text-slate-300 dark:hover:text-white cursor-pointer"
            >
              <MaterialIcon name="replay_10" size={18} />
            </button>

            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause telemetry" : "Play telemetry"}
              className="w-7 h-7 rounded-full bg-[#222222] dark:bg-white text-white dark:text-[#1E1E1E] flex items-center justify-center cursor-pointer shadow-2xs"
            >
              <MaterialIcon name={isPlaying ? "pause" : "play_arrow"} size={16} />
            </button>

            <button
              type="button"
              onClick={() => setPlayheadIndex((prev) => (prev + 5) % WAVEFORM_BARS.length)}
              aria-label="Forward 10 seconds"
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
            aria-label="Audio / Console output"
            className="text-[#222222] dark:text-white hover:opacity-75 cursor-pointer"
          >
            <MaterialIcon name="volume_up" size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
