"use client";

import React, { useState, useEffect } from "react";
import { useCloud } from "@/lib/store/cloud-context";
import {
  MaterialIcon,
  PastelTypePill,
  StatusIndicator,
  PastelVariant,
  NixtioStatusTone,
} from "@/components/ui/material-icon";
import { PastelKpiCard } from "@/components/ui/bento-primitives";
import { CostUsageCard } from "@/components/overview/cost-usage-card";

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
    domains,
    setTerminalInstance,
    selectedRegion,
    searchQuery,
  } = useCloud();

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
      : 0;

  const filteredDatabases = databases.filter(
    (db) => selectedRegion === "all" || db.region === selectedRegion
  );
  const activeDatabases = filteredDatabases.filter((db) => db.status === "online");

  const activeDomains = domains.filter((d) => d.status === "active");

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
          value={activeInstances.length}
          subtitle={`${filteredInstances.length} total • ${avgCpu}% CPU`}
          variant="lavender"
          actionLabel="Check"
          href="/compute"
        />
        <PastelKpiCard
          label="Managed Databases"
          value={activeDatabases.length}
          subtitle={
            filteredDatabases.length > 1
              ? `${filteredDatabases.length} total • HA & PITR Active`
              : "HA & PITR Active"
          }
          variant="blue"
          actionLabel="Check"
          href="/databases"
        />
        <PastelKpiCard
          label="Active Domains"
          value={activeDomains.length}
          subtitle={
            domains.length > 1
              ? `${domains.length} total • Anycast DNS`
              : "Anycast DNS Active"
          }
          variant="yellow"
          actionLabel="Check"
          href="/domains"
        />
      </div>

      {/* Middle Card: AWS-style cost & usage at a glance */}
      <CostUsageCard />

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
