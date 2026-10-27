"use client";

import React, { useState } from "react";
import { useCloud } from "@/lib/store/cloud-context";
import { useBilling } from "@/lib/store/billing-context";
import { DeployDropletModal } from "@/components/compute/deploy-droplet-modal";
import {
  MaterialIcon,
  PastelTypePill,
  StatusIndicator,
  PastelVariant,
} from "@/components/ui/material-icon";
import {
  PastelKpiCard,
  SegmentedPillTabs,
} from "@/components/ui/bento-primitives";

export default function ComputePage() {
  const {
    instances,
    powerAction,
    destroyInstance,
    setTerminalInstance,
    selectedRegion,
    searchQuery,
  } = useCloud();
  const { formatMoney } = useBilling();

  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "off">("all");
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  const handleCopyIp = (ip: string, id: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredInstances = instances.filter((inst) => {
    const matchesRegion = selectedRegion === "all" || inst.region === selectedRegion;
    const matchesStatus = statusFilter === "all" || inst.status === statusFilter;
    const matchesSearch =
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.ipv4.includes(searchQuery) ||
      inst.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRegion && matchesStatus && matchesSearch;
  });

  const totalActiveCores = filteredInstances
    .filter((i) => i.status === "active")
    .reduce((acc, i) => acc + (i.plan?.vcpu ?? 0), 0);
  const totalRam = filteredInstances.reduce((acc, i) => acc + (i.plan?.ramGb ?? 0), 0);

  return (
    <div className="space-y-5">
      {/* Top 3 Pastel KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PastelKpiCard
          label="Total Instances"
          value={filteredInstances.length}
          variant="lavender"
          actionLabel="Deploy"
          onAction={() => setIsDeployOpen(true)}
        />
        <PastelKpiCard
          label="Total Active Cores"
          value={`${totalActiveCores} Cores`}
          variant="blue"
          actionLabel="Check"
          onAction={() => setStatusFilter("active")}
        />
        <PastelKpiCard
          label="Total Memory"
          value={`${totalRam} GB`}
          variant="yellow"
          actionLabel="Check"
          onAction={() => setStatusFilter("all")}
        />
      </div>

      {/* Header & Filter Controls Card */}
      <div className="nixtio-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#1E1E1E] dark:text-white flex items-center gap-2">
            <span>Compute Droplets</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#EFECE8] dark:bg-[#232834] text-[#5A5A58] dark:text-slate-300">
              {filteredInstances.length} nodes
            </span>
          </h2>
          <p className="text-xs text-[#8C8B87] dark:text-slate-400 mt-0.5">
            Dedicated KVM cloud virtual machines with PCIe Gen4 NVMe storage and 10Gbps Anycast interconnect.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <SegmentedPillTabs
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { id: "all", label: "All", badge: instances.length },
              { id: "active", label: "Active" },
              { id: "off", label: "Off" },
            ]}
          />

          <button
            type="button"
            onClick={() => setIsDeployOpen(true)}
            className="h-9 px-4 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:hover:bg-slate-200 dark:text-[#1E1E1E] text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MaterialIcon name="add" size={16} />
            <span>Deploy Droplet</span>
          </button>
        </div>
      </div>

      {/* Floating White Pill-Row Table */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-12 items-center px-4 py-1.5 text-xs font-medium text-[#5A5A58] dark:text-slate-400">
          <div className="col-span-4 sm:col-span-3 flex items-center gap-3">
            <span className="w-4 h-4 rounded bg-[#222222] dark:bg-white text-white dark:text-[#1E1E1E] inline-flex items-center justify-center">
              <MaterialIcon name="remove" size={13} />
            </span>
            <span>Droplet & OS</span>
          </div>
          <div className="hidden md:block md:col-span-2">IPv4 & Region</div>
          <div className="col-span-3 sm:col-span-2">Specs</div>
          <div className="hidden sm:block sm:col-span-2">Status & Load</div>
          <div className="col-span-2 sm:col-span-1">Price</div>
          <div className="col-span-3 sm:col-span-2 text-right pr-2">Actions</div>
        </div>

        {filteredInstances.length === 0 ? (
          <div className="nixtio-card p-10 text-center text-xs text-[#8C8B87]">
            No compute droplets found matching your current filter criteria.
          </div>
        ) : (
          filteredInstances.map((inst, idx) => {
            const isChecked = !!selectedIds[inst.id];
            const pillVariant: PastelVariant =
              idx % 3 === 0 ? "lavender" : idx % 3 === 1 ? "blue" : "yellow";

            return (
              <div
                key={inst.id}
                className="nixtio-floating-row grid grid-cols-12 items-center px-4 py-3.5 text-xs gap-2"
              >
                {/* Checkbox + Pastel Pill + Hostname */}
                <div className="col-span-4 sm:col-span-3 flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedIds((p) => ({ ...p, [inst.id]: !p[inst.id] }))
                    }
                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 cursor-pointer ${
                      isChecked
                        ? "bg-[#222222] text-white dark:bg-white dark:text-[#1E1E1E]"
                        : "border border-[#D5D0C8] dark:border-[#383F52]"
                    }`}
                  >
                    {isChecked && <MaterialIcon name="check" size={12} />}
                  </button>

                  <PastelTypePill
                    icon="dns"
                    label={inst.region.toUpperCase()}
                    variant={pillVariant}
                    size="sm"
                  />

                  <div className="min-w-0">
                    <span className="font-semibold text-[#1E1E1E] dark:text-white block truncate">
                      {inst.name}
                    </span>
                    <span className="text-[11px] text-[#8C8B87] block truncate">
                      {inst.image}
                    </span>
                  </div>
                </div>

                {/* IPv4 */}
                <div className="hidden md:block md:col-span-2 font-mono text-[11px]">
                  <div className="flex items-center gap-1.5 text-[#1E1E1E] dark:text-slate-200">
                    <span className="truncate">{inst.ipv4}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyIp(inst.ipv4, inst.id)}
                      className="text-[#8C8B87] hover:text-[#1E1E1E] dark:hover:text-white cursor-pointer"
                      title="Copy IPv4"
                    >
                      <MaterialIcon
                        name={copiedId === inst.id ? "check" : "content_copy"}
                        size={14}
                      />
                    </button>
                  </div>
                  <span className="text-[10px] text-[#8C8B87] block">
                    VPC: {inst.privateIpv4}
                  </span>
                </div>

                {/* Hardware Specs */}
                <div className="col-span-3 sm:col-span-2 text-[#5A5A58] dark:text-slate-300">
                  <span className="font-semibold text-[#1E1E1E] dark:text-white block">
                    {inst.plan.name}
                  </span>
                  <span className="text-[11px] text-[#8C8B87]">
                    {inst.plan.vcpu} vCPU • {inst.plan.ramGb}GB
                  </span>
                </div>

                {/* Status & CPU */}
                <div className="hidden sm:block sm:col-span-2">
                  <StatusIndicator
                    status={
                      inst.status === "active"
                        ? "completed"
                        : inst.status === "provisioning" || inst.status === "rebooting"
                        ? "pending"
                        : "failed"
                    }
                    label={
                      inst.status === "active"
                        ? `Active (${inst.currentCpu}%)`
                        : inst.status
                    }
                  />
                </div>

                {/* Price */}
                <div className="col-span-2 sm:col-span-1 font-mono">
                  <span className="font-semibold text-[#1E1E1E] dark:text-white block">
                    {formatMoney(inst.plan.retailMonthly)}/m
                  </span>
                </div>

                {/* Quick Actions */}
                <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTerminalInstance(inst)}
                    className="h-8 px-3 rounded-full bg-[#EFECE8] hover:bg-[#222222] hover:text-white dark:bg-[#232834] dark:hover:bg-white dark:hover:text-[#1E1E1E] text-[#1E1E1E] dark:text-slate-200 text-[11px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                    title="Open Web Console"
                  >
                    <MaterialIcon name="terminal" size={14} />
                    <span className="hidden lg:inline">Console</span>
                  </button>

                  {inst.status === "active" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => powerAction(inst.id, "reboot")}
                        className="w-8 h-8 rounded-full bg-[#EFECE8] dark:bg-[#232834] hover:bg-[#F8D568] text-[#1E1E1E] dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                        title="Reboot"
                      >
                        <MaterialIcon name="restart_alt" size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => powerAction(inst.id, "off")}
                        className="w-8 h-8 rounded-full bg-[#EFECE8] dark:bg-[#232834] hover:bg-[#E6D8EA] text-[#1E1E1E] dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                        title="Power Off"
                      >
                        <MaterialIcon name="power_settings_new" size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => powerAction(inst.id, "on")}
                      className="w-8 h-8 rounded-full bg-[#D5EBD9] text-[#4EA871] flex items-center justify-center transition-colors cursor-pointer"
                      title="Power On"
                    >
                      <MaterialIcon name="power_settings_new" size={16} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => destroyInstance(inst.id)}
                    className="w-8 h-8 rounded-full bg-[#FADBD8]/60 hover:bg-[#D94E4E] text-[#D94E4E] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Destroy Droplet"
                  >
                    <MaterialIcon name="delete" size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <DeployDropletModal
        isOpen={isDeployOpen}
        onClose={() => setIsDeployOpen(false)}
      />
    </div>
  );
}
