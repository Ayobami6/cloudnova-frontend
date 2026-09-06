"use client";

import React, { useState } from "react";
import {
  Server,
  Plus,
  Terminal,
  Power,
  RotateCw,
  Trash2,
  Copy,
  Check,
  Cpu,
  Layers,
} from "lucide-react";
import { useCloud } from "@/lib/store/cloud-context";
import { DeployDropletModal } from "@/components/compute/deploy-droplet-modal";

export default function ComputePage() {
  const {
    instances,
    powerAction,
    destroyInstance,
    setTerminalInstance,
    selectedRegion,
    searchQuery,
  } = useCloud();

  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "off">("all");

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

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            Compute Droplets
            <span className="text-xs font-mono text-slate-400 bg-[#161922] px-2 py-0.5 rounded border border-[#232736]">
              {filteredInstances.length} nodes
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dedicated KVM cloud virtual machines with NVMe SSD storage and 10Gbps interconnect.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Tabs */}
          <div className="flex items-center rounded-md bg-[#161922] border border-[#232736] p-0.5 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-sm transition-colors ${
                statusFilter === "all" ? "bg-blue-600 text-white font-medium" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1 rounded-sm transition-colors ${
                statusFilter === "active" ? "bg-blue-600 text-white font-medium" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("off")}
              className={`px-3 py-1 rounded-sm transition-colors ${
                statusFilter === "off" ? "bg-blue-600 text-white font-medium" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Off
            </button>
          </div>

          <button
            onClick={() => setIsDeployOpen(true)}
            className="h-9 px-3.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy Droplet</span>
          </button>
        </div>
      </div>

      {/* Droplet Table */}
      <div className="rounded-lg bg-[#161922] border border-[#232736] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#11131A] text-slate-400 uppercase tracking-wider font-medium text-[11px] border-b border-[#232736]">
              <tr>
                <th className="py-2.5 px-4">Droplet Name & OS</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">IP Addresses</th>
                <th className="py-2.5 px-4">Hardware Specs</th>
                <th className="py-2.5 px-4">Live CPU / RAM</th>
                <th className="py-2.5 px-4">Retail Price (Margin)</th>
                <th className="py-2.5 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232736]">
              {filteredInstances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No compute droplets found matching your current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInstances.map((inst) => (
                  <tr key={inst.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Name & OS */}
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded bg-[#1E2230] border border-[#232736] flex items-center justify-center shrink-0 text-slate-300">
                          <Server className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div>
                          <span className="font-semibold text-slate-200 block">{inst.name}</span>
                          <span className="text-[11px] text-slate-400">{inst.image}</span>
                          <div className="flex items-center gap-1 mt-1">
                            {inst.tags.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-[#1E2230] text-slate-400 border border-[#232736]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status Dot */}
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            inst.status === "active"
                              ? "bg-emerald-500"
                              : inst.status === "rebooting"
                              ? "bg-amber-500 animate-pulse"
                              : "bg-rose-500"
                          }`}
                        />
                        <span className="text-xs text-slate-300 capitalize">{inst.status}</span>
                      </div>
                    </td>

                    {/* IP Addresses */}
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <span>{inst.ipv4}</span>
                        <button
                          onClick={() => handleCopyIp(inst.ipv4, inst.id)}
                          className="text-slate-500 hover:text-slate-300 p-0.5"
                          title="Copy Public IPv4"
                        >
                          {copiedId === inst.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <span className="text-slate-500 text-[10px] block">
                        VPC: {inst.privateIpv4} • {inst.region.toUpperCase()}
                      </span>
                    </td>

                    {/* Specs */}
                    <td className="py-3 px-4 text-slate-300">
                      <span className="font-medium block">{inst.plan.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {inst.plan.vcpu} vCPU • {inst.plan.ramGb} GB RAM • {inst.plan.diskGb} GB NVMe
                      </span>
                    </td>

                    {/* Live Gauges */}
                    <td className="py-3 px-4 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 w-7">CPU</span>
                        <div className="w-20 bg-[#11131A] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${inst.currentCpu}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{inst.currentCpu}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 w-7">RAM</span>
                        <div className="w-20 bg-[#11131A] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${inst.currentRamPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {inst.currentRamPercent}%
                        </span>
                      </div>
                    </td>

                    {/* Retail Pricing */}
                    <td className="py-3 px-4 font-mono text-xs">
                      <span className="text-slate-200 font-semibold block">
                        ${inst.plan.retailMonthly}/mo
                      </span>
                      <span className="text-[10px] text-emerald-400 block">
                        +${(inst.plan.retailMonthly - inst.plan.wholesaleMonthly).toFixed(2)} profit
                      </span>
                    </td>

                    {/* Quick Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setTerminalInstance(inst)}
                          className="h-7 px-2.5 rounded bg-[#1E2230] hover:bg-[#252B3D] border border-[#232736] text-[11px] text-slate-300 hover:text-white inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="Open Web Terminal"
                        >
                          <Terminal className="w-3 h-3 text-blue-400" />
                          <span>Console</span>
                        </button>

                        {inst.status === "active" ? (
                          <>
                            <button
                              onClick={() => powerAction(inst.id, "reboot")}
                              className="h-7 w-7 rounded bg-[#1E2230] hover:bg-[#252B3D] border border-[#232736] text-slate-400 hover:text-amber-300 flex items-center justify-center transition-colors"
                              title="Graceful Reboot"
                            >
                              <RotateCw className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => powerAction(inst.id, "off")}
                              className="h-7 w-7 rounded bg-[#1E2230] hover:bg-[#252B3D] border border-[#232736] text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors"
                              title="Power Off"
                            >
                              <Power className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => powerAction(inst.id, "on")}
                            className="h-7 w-7 rounded bg-[#1E2230] hover:bg-[#252B3D] border border-[#232736] text-emerald-400 hover:text-emerald-300 flex items-center justify-center transition-colors"
                            title="Power On"
                          >
                            <Power className="w-3 h-3" />
                          </button>
                        )}

                        <button
                          onClick={() => destroyInstance(inst.id)}
                          className="h-7 w-7 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 flex items-center justify-center transition-colors"
                          title="Destroy Droplet"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeployDropletModal isOpen={isDeployOpen} onClose={() => setIsDeployOpen(false)} />
    </div>
  );
}
