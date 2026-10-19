"use client";

import React from "react";
import Link from "next/link";
import { MaterialIcon, PastelVariant } from "./material-icon";

export interface PastelKpiCardProps {
  label: string;
  value: string | number;
  variant: "lavender" | "blue" | "yellow" | "sand";
  actionLabel?: string;
  href?: string;
  onAction?: () => void;
  subtitle?: string;
}

const KPI_BG_STYLES: Record<"lavender" | "blue" | "yellow" | "sand", string> = {
  lavender:
    "bg-[#E6D8EA] text-[#1E1E1E] dark:bg-[#E6D8EA]/18 dark:text-white dark:border dark:border-[#E6D8EA]/25",
  blue:
    "bg-[#CFE0EC] text-[#1E1E1E] dark:bg-[#CFE0EC]/18 dark:text-white dark:border dark:border-[#CFE0EC]/25",
  yellow:
    "bg-[#F8D568] text-[#1E1E1E] dark:bg-[#F8D568]/22 dark:text-white dark:border dark:border-[#F8D568]/30",
  sand:
    "bg-[#E5B899] text-[#1E1E1E] dark:bg-[#E5B899]/18 dark:text-white dark:border dark:border-[#E5B899]/25",
};

/**
 * Replicates the top 3 pastel KPI cards from the Dribbble shot:
 * e.g. "Responses via Calls / 142 / [Check]" in Lavender, Powder Blue, and Marigold.
 */
export function PastelKpiCard({
  label,
  value,
  variant,
  actionLabel = "Check",
  href,
  onAction,
  subtitle,
}: PastelKpiCardProps) {
  const pillClass =
    "px-4 py-1.5 rounded-full bg-white text-[#1E1E1E] text-xs font-medium shadow-2xs hover:bg-[#1E1E1E] hover:text-white transition-colors cursor-pointer shrink-0";

  return (
    <div
      className={`rounded-[22px] px-5 py-4 flex items-center justify-between gap-3 transition-transform duration-150 ${KPI_BG_STYLES[variant]}`}
    >
      <div className="min-w-0">
        <span className="text-xs font-medium text-[#3A3A38] dark:text-slate-200 block truncate">
          {label}
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[28px] leading-tight font-semibold tracking-tight tabular-nums">
            {value}
          </span>
          {subtitle && (
            <span className="text-[11px] font-medium opacity-75 truncate">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {href ? (
        <Link href={href} className={pillClass}>
          {actionLabel}
        </Link>
      ) : (
        <button type="button" onClick={onAction} className={pillClass}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export interface SegmentedTabOption<T extends string> {
  id: T;
  label: string;
  icon?: string;
  badge?: string | number;
}

export interface SegmentedPillTabsProps<T extends string> {
  options: SegmentedTabOption<T>[];
  value: T;
  onChange: (val: T) => void;
  className?: string;
}

export function SegmentedPillTabs<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: SegmentedPillTabsProps<T>) {
  return (
    <div
      className={`inline-flex items-center flex-wrap gap-1 p-1 rounded-full bg-[#EFECE8] dark:bg-[#161920] ${className}`}
    >
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer ${
              active
                ? "bg-[#222222] text-white dark:bg-white dark:text-[#1E1E1E] shadow-xs"
                : "text-[#5A5A58] hover:text-[#1E1E1E] dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {opt.icon && <MaterialIcon name={opt.icon} size={15} />}
            <span>{opt.label}</span>
            {opt.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                  active
                    ? "bg-white/20 text-white dark:bg-black/15 dark:text-[#1E1E1E]"
                    : "bg-white/70 text-[#5A5A58] dark:bg-white/10 dark:text-slate-300"
                }`}
              >
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export interface SankeyStreamItem {
  leftLabel: string;
  leftValue: string | number;
  leftHighlight?: boolean;
  rightLabel: string;
  rightValue: string | number;
  color: string;
  dotColor: string;
  ribbonThickness: number;
}

export interface SankeyBubbleCardProps {
  title: string;
  leftPeriodLabel: string;
  leftPeriodValue: string | number;
  deltaLabel: string;
  rightPeriodLabel: string;
  rightPeriodValue: string | number;
  badgeText?: string;
  periodFilter?: string;
  onFilterClick?: () => void;
  streams: SankeyStreamItem[];
}

const BUBBLE_PATTERNS: { cx: number; cy: number; r: number }[][] = [
  [
    { cx: 12, cy: 22, r: 3.5 },
    { cx: 30, cy: 14, r: 5 },
    { cx: 48, cy: 24, r: 3.5 },
    { cx: 68, cy: 16, r: 3 },
    { cx: 88, cy: 10, r: 6 },
    { cx: 92, cy: 25, r: 4 },
    { cx: 112, cy: 19, r: 7 },
    { cx: 130, cy: 11, r: 3.5 },
    { cx: 136, cy: 24, r: 4.5 },
    { cx: 154, cy: 15, r: 5 },
    { cx: 172, cy: 22, r: 4 },
    { cx: 185, cy: 10, r: 3 },
  ],
  [
    { cx: 14, cy: 18, r: 3 },
    { cx: 34, cy: 10, r: 5.5 },
    { cx: 42, cy: 24, r: 3 },
    { cx: 64, cy: 16, r: 7 },
    { cx: 86, cy: 22, r: 4 },
    { cx: 105, cy: 12, r: 5 },
    { cx: 122, cy: 24, r: 3.5 },
    { cx: 144, cy: 15, r: 6.5 },
    { cx: 166, cy: 22, r: 3.5 },
    { cx: 182, cy: 12, r: 4 },
  ],
  [
    { cx: 10, cy: 20, r: 4.5 },
    { cx: 32, cy: 14, r: 3 },
    { cx: 52, cy: 22, r: 6.5 },
    { cx: 74, cy: 12, r: 3.5 },
    { cx: 94, cy: 20, r: 4.5 },
    { cx: 116, cy: 14, r: 5.5 },
    { cx: 138, cy: 24, r: 3 },
    { cx: 158, cy: 16, r: 5 },
    { cx: 180, cy: 20, r: 4 },
  ],
  [
    { cx: 16, cy: 15, r: 3 },
    { cx: 36, cy: 22, r: 6 },
    { cx: 58, cy: 14, r: 3.5 },
    { cx: 82, cy: 22, r: 4.5 },
    { cx: 106, cy: 15, r: 3 },
    { cx: 128, cy: 21, r: 6 },
    { cx: 154, cy: 14, r: 3.5 },
    { cx: 178, cy: 22, r: 4.5 },
  ],
];

/**
 * Directly replicates the "Campaign Overview" card in the Dribbble screenshot:
 * - Period delta bar (Aug. 2026 [422] --- +127 --- Sep. 2026 [549])
 * - Left source metrics -> SVG Sankey Ribbons -> Right target metrics + Pastel Bubble Matrix
 */
export function SankeyBubbleCard({
  title,
  leftPeriodLabel,
  leftPeriodValue,
  deltaLabel,
  rightPeriodLabel,
  rightPeriodValue,
  badgeText = "x 10",
  periodFilter = "Month",
  onFilterClick,
  streams,
}: SankeyBubbleCardProps) {
  return (
    <div className="nixtio-card p-6 space-y-5">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#1E1E1E] dark:text-white tracking-tight">
          {title}
        </h2>

        <div className="flex items-center gap-3 text-xs text-[#5A5A58] dark:text-slate-300">
          <button
            type="button"
            onClick={onFilterClick}
            className="inline-flex items-center gap-1.5 hover:text-[#1E1E1E] dark:hover:text-white transition-colors cursor-pointer"
          >
            <MaterialIcon name="filter_alt" size={16} className="text-[#1E1E1E] dark:text-white" />
            <span className="font-medium">Filter</span>
          </button>

          <span className="text-[#D5D0C8] dark:text-slate-700">|</span>

          <button
            type="button"
            onClick={onFilterClick}
            className="inline-flex items-center gap-1 hover:text-[#1E1E1E] dark:hover:text-white transition-colors cursor-pointer font-medium"
          >
            <span>{periodFilter}</span>
            <MaterialIcon name="expand_more" size={16} />
          </button>

          <span className="text-[#D5D0C8] dark:text-slate-700">|</span>

          <span className="inline-flex items-center gap-1.5 font-semibold text-[#1E1E1E] dark:text-white">
            <span className="w-3.5 h-3.5 rounded-full bg-[#F8D568] inline-block shadow-2xs" />
            <span>{badgeText}</span>
          </span>
        </div>
      </div>

      {/* Period Comparison Line */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div>
          <span className="text-[11px] text-[#8C8B87] dark:text-slate-400 block">
            {leftPeriodLabel}
          </span>
          <span className="text-base font-semibold text-[#1E1E1E] dark:text-white tabular-nums">
            {leftPeriodValue}
          </span>
        </div>

        <div className="flex-1 flex items-center gap-4 max-w-md mx-auto">
          <div className="h-[1px] flex-1 bg-[#E7E4DF] dark:bg-[#282D3A]" />
          <span className="text-2xl font-semibold text-[#4EA871] dark:text-[#56B87C] tabular-nums tracking-tight">
            {deltaLabel}
          </span>
          <div className="h-[1px] flex-1 bg-[#E7E4DF] dark:bg-[#282D3A]" />
        </div>

        <div className="text-right">
          <span className="text-[11px] text-[#8C8B87] dark:text-slate-400 block">
            {rightPeriodLabel}
          </span>
          <span className="text-base font-semibold text-[#1E1E1E] dark:text-white tabular-nums">
            {rightPeriodValue}
          </span>
        </div>
      </div>

      {/* 3-Column Sankey Ribbon + Bubble Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center pt-2">
        {/* Left Source Metrics */}
        <div className="lg:col-span-2 flex lg:flex-col justify-between gap-3 pr-2 border-r border-[#E7E4DF] dark:border-[#282D3A]">
          {streams.map((s, idx) => (
            <div key={idx} className="py-1">
              <span
                className={`text-[11px] block ${
                  s.leftHighlight
                    ? "font-semibold text-[#1E1E1E] dark:text-white"
                    : "text-[#8C8B87] dark:text-slate-400"
                }`}
              >
                {s.leftLabel}
              </span>
              <span
                className={`text-sm tabular-nums ${
                  s.leftHighlight
                    ? "font-bold text-[#1E1E1E] dark:text-white"
                    : "font-medium text-[#5A5A58] dark:text-slate-300"
                }`}
              >
                {s.leftValue}
              </span>
            </div>
          ))}
        </div>

        {/* Center SVG Alluvial / Sankey Ribbons */}
        <div className="lg:col-span-4 h-48 w-full relative flex items-center">
          <svg
            viewBox="0 0 260 180"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Vertical boundary ticks */}
            <line x1="2" y1="10" x2="2" y2="170" stroke="currentColor" className="text-[#E7E4DF] dark:text-[#282D3A]" strokeWidth="1.5" />
            <line x1="258" y1="10" x2="258" y2="170" stroke="currentColor" className="text-[#E7E4DF] dark:text-[#282D3A]" strokeWidth="1.5" />

            {/* Ribbon 1: Marigold Yellow (thick wave to top right) */}
            <path
              d="M 2 112 C 110 112, 140 28, 258 28"
              fill="none"
              stroke={streams[0]?.color || "#F8D568"}
              strokeWidth={streams[0]?.ribbonThickness || 16}
              strokeLinecap="butt"
              opacity={0.9}
            />
            {/* Ribbon 2: Powder Blue (wave to second right) */}
            <path
              d="M 2 124 C 115 124, 145 72, 258 72"
              fill="none"
              stroke={streams[1]?.color || "#CFE0EC"}
              strokeWidth={streams[1]?.ribbonThickness || 9}
              strokeLinecap="butt"
              opacity={0.9}
            />
            {/* Ribbon 3: Terracotta Sand (wave to third right) */}
            <path
              d="M 2 131 C 120 131, 155 114, 258 114"
              fill="none"
              stroke={streams[2]?.color || "#E5B899"}
              strokeWidth={streams[2]?.ribbonThickness || 4}
              strokeLinecap="butt"
              opacity={0.85}
            />
            {/* Ribbon 4: Pastel Lavender (wave to bottom right) */}
            <path
              d="M 2 136 C 125 136, 160 156, 258 156"
              fill="none"
              stroke={streams[3]?.color || "#E6D8EA"}
              strokeWidth={streams[3]?.ribbonThickness || 4}
              strokeLinecap="butt"
              opacity={0.9}
            />
          </svg>
        </div>

        {/* Right Target Metrics + Pastel Bubble Scatter Matrix */}
        <div className="lg:col-span-6 space-y-3 pl-1">
          {streams.map((s, idx) => {
            const bubbles = BUBBLE_PATTERNS[idx % BUBBLE_PATTERNS.length];
            return (
              <div key={idx} className="flex items-center justify-between gap-3">
                <div className="w-28 shrink-0">
                  <span className="text-[11px] text-[#8C8B87] dark:text-slate-400 block truncate">
                    {s.rightLabel}
                  </span>
                  <span className="text-sm font-bold text-[#1E1E1E] dark:text-white tabular-nums">
                    {s.rightValue}
                  </span>
                </div>

                <div className="flex-1 h-8">
                  <svg viewBox="0 0 195 32" className="w-full h-full overflow-visible">
                    {bubbles.map((b, bIdx) => (
                      <circle
                        key={bIdx}
                        cx={b.cx}
                        cy={b.cy}
                        r={b.r}
                        fill={s.dotColor}
                        opacity={bIdx % 2 === 0 ? 0.88 : 0.62}
                      />
                    ))}
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
