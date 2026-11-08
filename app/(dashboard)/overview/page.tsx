"use client";

import React, { useState } from "react";
import Link from "next/link";
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

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Recent";
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  // Filter instances by global region if selected
  const filteredInstances = instances.filter(
    (i) => selectedRegion === "all" || i.region === selectedRegion
  );
  const activeInstances = filteredInstances.filter((i) => i.status === "active");

  const filteredDatabases = databases.filter(
    (db) => selectedRegion === "all" || db.region === selectedRegion
  );
  const activeDatabases = filteredDatabases.filter((db) => db.status === "online");

  const activeDomains = domains.filter((d) => d.status === "active");

  // Build unified resource rows matching the floating white rows in the Dribbble shot
  const allRows: UnifiedResourceRow[] = [
    ...filteredInstances.map((inst, idx) => ({
      id: inst.id,
      pillIcon: "dns",
      pillLabel: "Droplet",
      pillVariant: (idx % 2 === 0 ? "blue" : "lavender") as PastelVariant,
      callerId: inst.name,
      destination: `${inst.ipv4 || "Provisioning IP"} (${inst.region.toUpperCase()})`,
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
      dateLabel: formatDate(inst.createdAt),
      isDroplet: true,
      dropletId: inst.id,
    })),
    ...databases.slice(0, 4).map((db) => ({
      id: db.id,
      pillIcon: "database",
      pillLabel: db.engine.toUpperCase(),
      pillVariant: "yellow" as PastelVariant,
      callerId: db.name,
      destination: `${db.host || "db.internal.tibicloud.net"}:${db.port}`,
      statusTone: (
        db.status === "online" ? "completed" : "pending"
      ) as NixtioStatusTone,
      statusLabel: db.status === "online" ? "Completed" : "Pending",
      dateLabel: formatDate(db.createdAt),
    })),
    ...volumes.slice(0, 3).map((vol) => ({
      id: vol.id,
      pillIcon: "storage",
      pillLabel: "NVMe",
      pillVariant: "blue" as PastelVariant,
      callerId: vol.name,
      destination: `${vol.sizeGb} GB • ${vol.region.toUpperCase()}`,
      statusTone: (
        vol.status === "available" || vol.status === "in_use"
          ? "completed"
          : "pending"
      ) as NixtioStatusTone,
      statusLabel: vol.status === "in_use" ? "In Use" : vol.status === "available" ? "Ready" : "Pending",
      dateLabel: formatDate(vol.createdAt),
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
          variant="lavender"
          actionLabel="Check"
          href="/compute"
        />
        <PastelKpiCard
          label="Managed Databases"
          value={activeDatabases.length}
          variant="blue"
          actionLabel="Check"
          href="/databases"
        />
        <PastelKpiCard
          label="Active Domains"
          value={activeDomains.length}
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

        {/* Individual Floating White Pill Rows or Empty State */}
        {allRows.length === 0 ? (
          <div className="nixtio-card border border-[#E7E4DF]/60 dark:border-[#282D3A] p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#CFE0EC]/40 text-[#1E1E1E] dark:text-white flex items-center justify-center">
              <MaterialIcon name="cloud_queue" size={24} />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="text-sm font-semibold text-[#1E1E1E] dark:text-white">
                No Active Resources Found
              </h3>
              <p className="text-xs text-[#8C8B87] dark:text-slate-400">
                {searchQuery
                  ? "No cloud resources matched your search query. Try clearing the search."
                  : "Deploy your first compute droplet, managed database cluster, or storage volume to monitor your infrastructure activity here."}
              </p>
            </div>
            {!searchQuery && (
              <div className="flex items-center gap-3 pt-2">
                <Link
                  href="/compute"
                  className="h-9 px-4 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:hover:bg-slate-200 dark:text-[#1E1E1E] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MaterialIcon name="add" size={16} />
                  <span>Deploy Droplet</span>
                </Link>
                <Link
                  href="/databases"
                  className="h-9 px-4 rounded-full bg-[#EFECE8] dark:bg-[#232834] text-xs font-semibold text-[#1E1E1E] dark:text-white hover:bg-[#E2DDD6] transition-colors inline-flex items-center gap-1.5"
                >
                  <MaterialIcon name="database" size={16} />
                  <span>Create Database</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {allRows.map((row) => {
              const isChecked = !!selectedRows[row.id];
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
        )}
      </div>
    </div>
  );
}
