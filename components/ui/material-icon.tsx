"use client";

import React from "react";

export type PastelVariant = "lavender" | "blue" | "yellow" | "sand" | "sage" | "stone" | "charcoal";

export interface MaterialIconProps {
  name: string;
  filled?: boolean;
  size?: number | "sm" | "md" | "lg" | "xl";
  className?: string;
  title?: string;
}

const SIZE_MAP: Record<"sm" | "md" | "lg" | "xl", number> = {
  sm: 16,
  md: 18,
  lg: 22,
  xl: 26,
};

export function MaterialIcon({
  name,
  filled = true,
  size = "md",
  className = "",
  title,
}: MaterialIconProps) {
  const px = typeof size === "number" ? size : SIZE_MAP[size];

  return (
    <span
      className={`material-symbols-rounded ${filled ? "" : "outlined"} ${className}`}
      style={{ fontSize: `${px}px`, width: `${px}px`, height: `${px}px` }}
      title={title}
      aria-hidden={title ? undefined : true}
    >
      {name}
    </span>
  );
}

const PASTEL_PILL_STYLES: Record<PastelVariant, string> = {
  lavender:
    "bg-[#E6D8EA] text-[#1E1E1E] dark:bg-[#E6D8EA]/20 dark:text-[#F0E6F3]",
  blue:
    "bg-[#CFE0EC] text-[#1E1E1E] dark:bg-[#CFE0EC]/20 dark:text-[#E2EEF7]",
  yellow:
    "bg-[#F8D568] text-[#1E1E1E] dark:bg-[#F8D568]/25 dark:text-[#FDE694]",
  sand:
    "bg-[#E5B899] text-[#1E1E1E] dark:bg-[#E5B899]/20 dark:text-[#F5D9C4]",
  sage:
    "bg-[#D5EBD9] text-[#1E1E1E] dark:bg-[#4EA871]/20 dark:text-[#A3E4BC]",
  stone:
    "bg-[#EFECE8] text-[#1E1E1E] dark:bg-[#232834] dark:text-[#E5E7EB]",
  charcoal:
    "bg-[#222222] text-white dark:bg-white dark:text-[#1E1E1E]",
};

export interface PastelTypePillProps {
  icon: string;
  label: string;
  variant?: PastelVariant;
  className?: string;
  size?: "sm" | "md";
}

export function PastelTypePill({
  icon,
  label,
  variant = "blue",
  className = "",
  size = "md",
}: PastelTypePillProps) {
  const padding = size === "sm" ? "px-3 py-1 text-[11px] gap-1.5" : "px-3.5 py-1.5 text-xs gap-2";
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium whitespace-nowrap ${padding} ${PASTEL_PILL_STYLES[variant]} ${className}`}
    >
      <MaterialIcon name={icon} size={size === "sm" ? 14 : 16} />
      <span>{label}</span>
    </span>
  );
}

export type NixtioStatusTone = "completed" | "pending" | "failed" | "neutral";

export interface StatusIndicatorProps {
  status: NixtioStatusTone;
  label: string;
  icon?: string;
  className?: string;
}

const STATUS_CONFIG: Record<
  NixtioStatusTone,
  { colorClass: string; defaultIcon: string }
> = {
  completed: {
    colorClass: "text-[#4EA871] dark:text-[#56B87C]",
    defaultIcon: "how_to_reg",
  },
  pending: {
    colorClass: "text-[#E09F3E] dark:text-[#EBB04D]",
    defaultIcon: "person",
  },
  failed: {
    colorClass: "text-[#D94E4E] dark:text-[#EF6363]",
    defaultIcon: "person_cancel",
  },
  neutral: {
    colorClass: "text-[#8C8B87] dark:text-slate-400",
    defaultIcon: "person",
  },
};

export function StatusIndicator({
  status,
  label,
  icon,
  className = "",
}: StatusIndicatorProps) {
  const cfg = STATUS_CONFIG[status];
  const resolvedIcon = icon || cfg.defaultIcon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.colorClass} ${className}`}
    >
      <MaterialIcon name={resolvedIcon} size={16} />
      <span>{label}</span>
    </span>
  );
}
