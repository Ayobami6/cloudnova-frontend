"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useBilling } from "@/lib/store/billing-context";

/** Service buckets shown in the stacked chart, ordered bottom -> top. */
const CATEGORIES = [
  { key: "compute", label: "Compute", color: "#E9B949" },
  { key: "databases", label: "Databases", color: "#8DB5D1" },
  { key: "storage", label: "Storage", color: "#D9A07B" },
  { key: "networking", label: "Networking", color: "#B79CC4" },
  { key: "other", label: "Other", color: "#B8B4AE" },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];
type MonthRow = { month: string; period: string } & Record<CategoryKey, number>;

const MONTHS_SHOWN = 6;

/** Maps a backend resource_type string onto one of the chart's service buckets. */
function categorize(resourceType: string): CategoryKey {
  const t = resourceType.toLowerCase();
  if (/(droplet|instance|compute|vm)/.test(t)) return "compute";
  if (/(database|db|postgres|mysql|redis)/.test(t)) return "databases";
  if (/(volume|bucket|storage|snapshot|backup)/.test(t)) return "storage";
  if (/(domain|dns|network|vpc|ip|load|lb|firewall)/.test(t)) return "networking";
  return "other";
}

/** Normalises an invoice/billing period ("2026-09", "2026-09-01", ...) to "YYYY-MM". */
function toPeriodKey(period: string | undefined | null): string | null {
  if (!period) return null;
  const m = period.match(/^(\d{4})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}`;
  const d = new Date(period);
  return Number.isNaN(d.getTime())
    ? null
    : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function emptyRow(period: string): MonthRow {
  const [y, m] = period.split("-").map(Number);
  const month = new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
  return { month, period, compute: 0, databases: 0, storage: 0, networking: 0, other: 0 };
}

function rowTotal(row: MonthRow | undefined): number {
  if (!row) return 0;
  return CATEGORIES.reduce((acc, c) => acc + row[c.key], 0);
}

/** Percentage change vs. a baseline; null when there is no baseline to compare to. */
function pctChange(value: number, baseline: number): number | null {
  if (baseline <= 0) return null;
  return Math.round(((value - baseline) / baseline) * 100);
}

function DeltaPill({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const up = pct > 0;
  return (
    <span
      title="Compared with last month"
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums ${
        up
          ? "bg-[#FADBD8] text-[#C03E3E] dark:bg-[#D94E4E]/20 dark:text-[#EF8A8A]"
          : "bg-[#D5EBD9] text-[#2D7347] dark:bg-[#4EA871]/20 dark:text-[#76CE93]"
      }`}
    >
      <MaterialIcon name={up ? "arrow_drop_up" : "arrow_drop_down"} size={16} />
      {Math.abs(pct)}%
    </span>
  );
}

/**
 * AWS-console-style "Cost and usage" card: current month spend, month-end
 * forecast (both compared with last month), and a stacked monthly cost chart
 * broken down by service. Built from real billing data (past invoices +
 * the current month's usage summary); renders an empty state when no
 * usage has been billed yet.
 */
interface BarShapeProps {
  fill?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: MonthRow;
  dataKey?: string;
}

/**
 * Custom SVG shape that gives stacked bars rounded top corners (Nixtio design system)
 * for whichever segment is at the top of the stack for each month.
 */
function RoundedStackedBar(props: BarShapeProps) {
  const { fill, x = 0, y = 0, width = 0, height = 0, payload, dataKey } = props;
  if (!height || height <= 0 || width <= 0) return null;

  // Find all active categories in this row with a positive value
  const activeKeys = CATEGORIES.map((c) => c.key).filter(
    (k) => (payload ? (payload[k] || 0) > 0 : false)
  );

  // If this category is the top-most non-zero segment in the stack, give it rounded top corners
  const isTop =
    activeKeys.length === 0 ||
    activeKeys[activeKeys.length - 1] === dataKey;

  const r = isTop ? Math.min(8, width / 2, height) : 0;

  if (r <= 0) {
    return <rect x={x} y={y} width={width} height={height} fill={fill} />;
  }

  // Smooth SVG path with rounded top corners
  const path = `
    M ${x},${y + height}
    L ${x},${y + r}
    Q ${x},${y} ${x + r},${y}
    L ${x + width - r},${y}
    Q ${x + width},${y} ${x + width},${y + r}
    L ${x + width},${y + height}
    Z
  `;
  return <path d={path} fill={fill} />;
}

export function CostUsageCard() {
  const { usage, invoices, currencySymbol, hourlyBurnRate } = useBilling();
  const [isMounted, setIsMounted] = useState(false);

  // Recharts measures the DOM, so only render it on the client.
  useEffect(() => setIsMounted(true), []);

  const now = new Date();
  const currentPeriod =
    toPeriodKey(usage?.billing_period) ??
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const rows = useMemo<MonthRow[]>(() => {
    const [cy, cm] = currentPeriod.split("-").map(Number);
    const byPeriod = new Map<string, MonthRow>();
    for (let i = MONTHS_SHOWN - 1; i >= 0; i--) {
      const d = new Date(cy, cm - 1 - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      byPeriod.set(key, emptyRow(key));
    }

    // Closed months come from invoices.
    for (const inv of invoices) {
      const row = byPeriod.get(toPeriodKey(inv.period) ?? "");
      if (!row || row.period === currentPeriod) continue;
      if (inv.line_items.length === 0) {
        row.other += Number(inv.total_retail) || 0;
        continue;
      }
      for (const li of inv.line_items) {
        row[categorize(li.resource_type)] += Number(li.total_amount) || 0;
      }
    }

    // The open month comes from the live usage summary.
    const current = byPeriod.get(currentPeriod);
    if (current && usage) {
      if (usage.resources.length === 0) {
        current.other += Number(usage.accrued_usage_amount) || 0;
      }
      for (const r of usage.resources) {
        current[categorize(r.resource_type)] += Number(r.accrued_cost) || 0;
      }
    }

    return Array.from(byPeriod.values()).map((r) => ({
      ...r,
      ...Object.fromEntries(CATEGORIES.map((c) => [c.key, Math.round(r[c.key] * 100) / 100])),
    })) as MonthRow[];
  }, [invoices, usage, currentPeriod]);

  const currentMonth = usage ? Number(usage.accrued_usage_amount) || 0 : rowTotal(rows.at(-1));
  const forecast = usage ? Number(usage.projected_month_end_amount) || 0 : currentMonth;
  const lastMonth = rowTotal(rows.at(-2));
  const hasData = rows.some((r) => rowTotal(r) > 0);
  const activeCategories = CATEGORIES.filter((c) => rows.some((r) => r[c.key] > 0));
  const legendCategories = activeCategories.length > 0 ? activeCategories : CATEGORIES.slice(0, 4);

  const money = (v: number) =>
    `${currencySymbol}${v.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="nixtio-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-[#1E1E1E] dark:text-white">
          Cost &amp; usage
        </h2>
        <Link
          href="/billing"
          className="h-9 px-4 rounded-full bg-[#EFECE8] dark:bg-[#232834] text-xs font-medium text-[#1E1E1E] dark:text-white inline-flex items-center gap-1.5 hover:bg-[#222222] hover:text-white dark:hover:bg-white dark:hover:text-[#1E1E1E] transition-colors"
        >
          <span>Billing</span>
          <MaterialIcon name="arrow_outward" size={15} />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Headline numbers */}
        <div className="lg:col-span-4 space-y-5">
          <div>
            <span className="text-xs font-medium text-[#8C8B87] dark:text-slate-400">
              Current month
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-3xl font-semibold tracking-tight tabular-nums text-[#1E1E1E] dark:text-white">
                {money(currentMonth)}
              </span>
              <DeltaPill pct={pctChange(currentMonth, lastMonth)} />
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-[#8C8B87] dark:text-slate-400">
              Forecast month end
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl font-semibold tracking-tight tabular-nums text-[#1E1E1E] dark:text-white">
                {money(forecast)}
              </span>
              <DeltaPill pct={pctChange(forecast, lastMonth)} />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E7E4DF] dark:border-[#282D3A] flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 text-[#5A5A58] dark:text-slate-400">
              <MaterialIcon name="speed" size={16} />
              Burn rate
            </span>
            <span className="font-semibold tabular-nums text-[#1E1E1E] dark:text-white">
              {currencySymbol}
              {hourlyBurnRate.toLocaleString("en-US", { maximumFractionDigits: 4 })}/hr
            </span>
          </div>
        </div>

        {/* Stacked monthly cost chart */}
        <div className="lg:col-span-8">
          <span className="text-xs font-medium text-[#8C8B87] dark:text-slate-400">
            Cost ({currencySymbol}) · last {MONTHS_SHOWN} months
          </span>
          <div className="relative h-56 mt-2">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows} margin={{ top: 8, right: 4, left: -12, bottom: 0 }} barSize={36}>
                  <CartesianGrid vertical={false} stroke="#E7E4DF" strokeDasharray="3 3" className="stroke-[#E7E4DF] dark:stroke-[#282D3A]" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} stroke="#8C8B87" />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="#8C8B87"
                    tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : `${v}`)}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                    formatter={(value, name) => [money(Number(value)), String(name)]}
                    contentStyle={{
                      backgroundColor: "#222222",
                      border: "none",
                      borderRadius: 14,
                      fontSize: 12,
                      color: "#FFFFFF",
                    }}
                    itemStyle={{ color: "#FFFFFF" }}
                    labelStyle={{ color: "#B8B4AE" }}
                  />
                  {CATEGORIES.map((c) => (
                    <Bar
                      key={c.key}
                      dataKey={c.key}
                      name={c.label}
                      stackId="cost"
                      fill={c.color}
                      shape={(barProps: any) => <RoundedStackedBar {...barProps} dataKey={c.key} />}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
            {!hasData && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="px-3 py-1.5 rounded-full bg-white dark:bg-[#1C2029] text-xs text-[#8C8B87] shadow-2xs">
                  No billed usage yet
                </span>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {legendCategories.map((c) => (
              <span key={c.key} className="inline-flex items-center gap-1.5 text-[11px] text-[#5A5A58] dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
