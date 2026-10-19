"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useCloud } from "@/lib/store/cloud-context";
import {
  MaterialIcon,
  PastelTypePill,
  StatusIndicator,
  PastelVariant,
  NixtioStatusTone,
} from "@/components/ui/material-icon";
import {
  PastelKpiCard,
  SankeyBubbleCard,
} from "@/components/ui/bento-primitives";

interface MetricPoint {
  time: string;
  cpu: number;
  memory: number;
  networkMb: number;
}

interface UnifiedResourceRow {
  id: string;
  pillIcon: string;
  pillLabel: string;
  pillVariant: PastelVariant;
  callerId: string;
  destination: string;
  statusTone: NixtioStatusTone;
  statusLabel: string;
  dateLabel: string;
  isDroplet?: boolean;
  dropletId?: string;
}

export default function OverviewPage() {
  const {
    instances,
    databases,
    volumes,
    buckets,
    domains,
    monthlyProfit,
    setTerminalInstance,
    selectedRegion,
    searchQuery,
  } = useCloud();

  const [isMounted, setIsMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"sankey" | "live_chart">("sankey");

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({
    "row-1": true,
  });

  // Filter instances by global region if selected
  const filteredInstances = instances.filter(
    (i) => selectedRegion === "all" || i.region === selectedRegion
  );
  const activeInstances = filteredInstances.filter((i) => i.status === "active");
  const avgCpu =
    activeInstances.length > 0
      ? Math.round(
          activeInstances.reduce((acc, i) => acc + i.currentCpu, 0) /
            activeInstances.length
        )
      : 24;

  const totalStorageGb =
    volumes.reduce((acc, v) => acc + v.sizeGb, 0) +
    Math.round(buckets.reduce((acc, b) => acc + b.totalSizeBytes / 1e9, 0));

  // Telemetry stream for live chart toggle
  const [telemetry, setTelemetry] = useState<MetricPoint[]>([
    { time: "12:00", cpu: 22, memory: 48, networkMb: 120 },
    { time: "12:05", cpu: 28, memory: 52, networkMb: 145 },
    { time: "12:10", cpu: 25, memory: 50, networkMb: 130 },
    { time: "12:15", cpu: 34, memory: 58, networkMb: 210 },
    { time: "12:20", cpu: 30, memory: 55, networkMb: 190 },
    { time: "12:25", cpu: avgCpu || 27, memory: 54, networkMb: 185 },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        const newCpu = Math.max(
          10,
          Math.min(95, Math.floor(avgCpu + (Math.random() * 12 - 6)))
        );
        const newMem = Math.max(
          30,
          Math.min(85, Math.floor(52 + (Math.random() * 6 - 3)))
        );
        const newNet = Math.max(
          80,
          Math.min(450, Math.floor(180 + (Math.random() * 60 - 30)))
        );
        return [
          ...prev.slice(1),
          { time: timeStr, cpu: newCpu, memory: newMem, networkMb: newNet },
        ];
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [avgCpu]);

  // Build unified resource rows matching the floating white rows in the Dribbble shot
  const allRows: UnifiedResourceRow[] = [
    ...filteredInstances.map((inst, idx) => ({
      id: inst.id,
      pillIcon: idx % 2 === 0 ? "chat" : "call",
      pillLabel: idx % 2 === 0 ? "Droplet" : "KVM Node",
      pillVariant: (idx % 2 === 0 ? "blue" : "lavender") as PastelVariant,
      callerId: inst.name,
      destination: `${inst.ipv4} (${inst.region.toUpperCase()})`,
      statusTone: (
        inst.status === "active"
          ? "completed"
          : inst.status === "provisioning"
          ? "pending"
          : "failed"
      ) as NixtioStatusTone,
      statusLabel:
        inst.status === "active"
          ? "Completed"
          : inst.status === "provisioning"
          ? "Pending"
          : "Stopped",
      dateLabel: `Jan 15, ${2 + idx}:${String(10 + idx * 12).padStart(2, "0")} PM`,
      isDroplet: true,
      dropletId: inst.id,
    })),
    ...databases.slice(0, 2).map((db, idx) => ({
      id: db.id,
      pillIcon: "mail",
      pillLabel: db.engine.toUpperCase(),
      pillVariant: "yellow" as PastelVariant,
      callerId: db.name,
      destination: `${db.host || "db.internal.cloudnova.net"}:${db.port}`,
      statusTone: (
        db.status === "online" ? "completed" : "pending"
      ) as NixtioStatusTone,
      statusLabel: db.status === "online" ? "Completed" : "Pending",
      dateLabel: `Jan 15, ${1 + idx}:50 PM`,
    })),
    ...volumes.slice(0, 1).map((vol) => ({
      id: vol.id,
      pillIcon: "chat",
      pillLabel: "NVMe",
      pillVariant: "blue" as PastelVariant,
      callerId: vol.name,
      destination: `${vol.sizeGb} GB • ${vol.region.toUpperCase()}`,
      statusTone: "completed" as NixtioStatusTone,
      statusLabel: "Completed",
      dateLabel: "Jan 15, 7:54 AM",
    })),
  ].filter(
    (row) =>
      !searchQuery ||
      row.callerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.pillLabel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-5">
      {/* Top 3 Pastel KPI Cards with White "Check" Pills (Exact Dribbble Match) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PastelKpiCard
          label="Compute Droplets"
          value={filteredInstances.length || 142}
          subtitle={`${activeInstances.length} online • ${avgCpu}% CPU`}
          variant="lavender"
          actionLabel="Check"
          href="/compute"
        />
        <PastelKpiCard
          label="Managed Databases"
          value={databases.length || 324}
          subtitle="HA & PITR Active"
          variant="blue"
          actionLabel="Check"
          href="/databases"
        />
        <PastelKpiCard
          label="Storage & Anycast"
          value={`${totalStorageGb || 786} GB`}
          subtitle={`${domains.length} Anycast Domains`}
          variant="yellow"
          actionLabel="Check"
          href="/storage"
        />
      </div>

      {/* Middle Card: Sankey Ribbon + Bubble Matrix ("Campaign Overview" style) OR Live Recharts Telemetry */}
      {viewMode === "sankey" ? (
        <SankeyBubbleCard
          title="Infrastructure Overview"
          leftPeriodLabel="Aug. 2026"
          leftPeriodValue={422}
          deltaLabel={`+${Math.max(127, Math.round(monthlyProfit || 127))}`}
          rightPeriodLabel="Sep. 2026"
          rightPeriodValue={549}
          badgeText="x 10"
          periodFilter="Month"
          onFilterClick={() => setViewMode("live_chart")}
          streams={[
            {
              leftLabel: "Compute",
              leftValue: 540,
              rightLabel: "Email alerts",
              rightValue: 279,
              color: "#F8D568",
              dotColor: "#F8D568",
              ribbonThickness: 16,
            },
            {
              leftLabel: "Databases",
              leftValue: 138,
              rightLabel: "Messaging",
              rightValue: 107,
              color: "#CFE0EC",
              dotColor: "#CFE0EC",
              ribbonThickness: 9,
            },
            {
              leftLabel: "Storage",
              leftValue: 549,
              leftHighlight: true,
              rightLabel: "Surveys",
              rightValue: 65,
              color: "#E5B899",
              dotColor: "#E5B899",
              ribbonThickness: 4,
            },
            {
              leftLabel: "Anycast DNS",
              leftValue: 371,
              rightLabel: "Voice-call",
              rightValue: 98,
              color: "#E6D8EA",
              dotColor: "#E6D8EA",
              ribbonThickness: 4,
            },
          ]}
        />
      ) : (
        <div className="nixtio-card p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-semibold text-[#1E1E1E] dark:text-white">
                Live Cluster Telemetry Stream
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#D5EBD9] text-[#4EA871] text-[11px] font-medium">
                4s interval
              </span>
            </div>

            <button
              type="button"
              onClick={() => setViewMode("sankey")}
              className="px-3.5 py-1.5 rounded-full bg-[#EFECE8] dark:bg-[#232834] text-xs font-medium text-[#1E1E1E] dark:text-white hover:bg-[#222222] hover:text-white transition-colors cursor-pointer"
            >
              Switch to Ribbon Flow View
            </button>
          </div>

          <div className="h-52 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={telemetry}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F8D568" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#F8D568" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CFE0EC" stopOpacity={0.65} />
                    <stop offset="95%" stopColor="#CFE0EC" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#8C8B87"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#8C8B87"
                  fontSize={11}
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#222222",
                    borderColor: "#222222",
                    borderRadius: "14px",
                    fontSize: "12px",
                    color: "#FFFFFF",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stroke="#E09F3E"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#cpuGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="memory"
                  stroke="#6C9BB8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#memGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-[#8C8B87]">
                Loading telemetry stream...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Floating Pill-Row Table (Exact Dribbble Match) */}
      <div className="space-y-2.5 pt-1">
        {/* Borderless Header on Warm Alabaster Canvas */}
        <div className="grid grid-cols-12 items-center px-4 py-1.5 text-xs font-medium text-[#5A5A58] dark:text-slate-400">
          <div className="col-span-3 sm:col-span-3 flex items-center gap-3">
            <span className="w-4 h-4 rounded bg-[#222222] dark:bg-white text-white dark:text-[#1E1E1E] inline-flex items-center justify-center">
              <MaterialIcon name="remove" size={13} />
            </span>
            <span>Type</span>
          </div>
          <div className="col-span-3 sm:col-span-2">Resource ID</div>
          <div className="hidden sm:block sm:col-span-3">Destination</div>
          <div className="col-span-3 sm:col-span-2">Status</div>
          <div className="col-span-3 sm:col-span-2 text-right pr-4">Date</div>
        </div>

        {/* Individual Floating White Pill Rows */}
        <div className="space-y-2.5">
          {allRows.map((row, idx) => {
            const isChecked = !!selectedRows[row.id] || idx === 1;
            const matchingDroplet = row.isDroplet
              ? instances.find((i) => i.id === row.dropletId)
              : undefined;

            return (
              <div
                key={row.id}
                className="nixtio-floating-row grid grid-cols-12 items-center px-4 py-3 text-xs"
              >
                {/* Checkbox + Pastel Type Pill */}
                <div className="col-span-4 sm:col-span-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleRowSelection(row.id)}
                    aria-label={`Select ${row.callerId}`}
                    className={`w-4 h-4 rounded flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      isChecked
                        ? "bg-[#222222] text-white dark:bg-white dark:text-[#1E1E1E]"
                        : "border border-[#D5D0C8] dark:border-[#383F52] bg-transparent"
                    }`}
                  >
                    {isChecked && <MaterialIcon name="check" size={12} />}
                  </button>

                  <PastelTypePill
                    icon={row.pillIcon}
                    label={row.pillLabel}
                    variant={row.pillVariant}
                  />
                </div>

                {/* Caller ID / Resource Name */}
                <div className="col-span-3 sm:col-span-2 font-medium text-[#1E1E1E] dark:text-slate-100 truncate pr-2">
                  {row.callerId}
                </div>

                {/* Destination / IPv4 */}
                <div className="hidden sm:block sm:col-span-3 text-[#5A5A58] dark:text-slate-300 font-mono text-[11px] truncate pr-2">
                  {row.destination}
                </div>

                {/* Status Indicator */}
                <div className="col-span-3 sm:col-span-2">
                  <StatusIndicator
                    status={row.statusTone}
                    label={row.statusLabel}
                  />
                </div>

                {/* Date + Action Menu */}
                <div className="col-span-2 sm:col-span-2 flex items-center justify-end gap-2 text-[#5A5A58] dark:text-slate-400">
                  <span className="hidden md:inline text-[11px] whitespace-nowrap">
                    {row.dateLabel}
                  </span>

                  {matchingDroplet ? (
                    <button
                      type="button"
                      onClick={() => setTerminalInstance(matchingDroplet)}
                      title="Open Web Console"
                      className="w-7 h-7 rounded-full hover:bg-[#EFECE8] dark:hover:bg-[#232834] flex items-center justify-center text-[#1E1E1E] dark:text-slate-200 cursor-pointer"
                    >
                      <MaterialIcon name="more_vert" size={18} />
                    </button>
                  ) : (
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-[#5A5A58]">
                      <MaterialIcon name="more_vert" size={18} />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
