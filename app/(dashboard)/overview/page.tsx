"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Server,
  Database,
  HardDrive,
  TrendingUp,
  Terminal,
  Activity,
  ArrowUpRight,
  Shield,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useCloud } from "@/lib/store/cloud-context";

interface MetricPoint {
  time: string;
  cpu: number;
  memory: number;
  networkMb: number;
}

export default function OverviewPage() {
  const {
    instances,
    databases,
    volumes,
    buckets,
    monthlyWholesale,
    monthlyRetail,
    monthlyProfit,
    setTerminalInstance,
    selectedRegion,
  } = useCloud();

  // Filter instances by global region if selected
  const filteredInstances = instances.filter(
    (i) => selectedRegion === "all" || i.region === selectedRegion
  );
  const activeInstances = filteredInstances.filter((i) => i.status === "active");
  const avgCpu =
    activeInstances.length > 0
      ? Math.round(activeInstances.reduce((acc, i) => acc + i.currentCpu, 0) / activeInstances.length)
      : 0;

  const totalStorageGb =
    volumes.reduce((acc, v) => acc + v.sizeGb, 0) +
    Math.round(buckets.reduce((acc, b) => acc + b.totalSizeBytes / 1e9, 0));

  // Telemetry stream
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
        const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        const newCpu = Math.max(10, Math.min(95, Math.floor(avgCpu + (Math.random() * 12 - 6))));
        const newMem = Math.max(30, Math.min(85, Math.floor(52 + (Math.random() * 6 - 3))));
        const newNet = Math.max(80, Math.min(450, Math.floor(180 + (Math.random() * 60 - 30))));
        return [...prev.slice(1), { time: timeStr, cpu: newCpu, memory: newMem, networkMb: newNet }];
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [avgCpu]);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Infrastructure Overview
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Live Telemetry
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global status, resource health, and automated wholesale profit telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/compute"
            className="h-8 px-3 rounded-md bg-white dark:bg-[#161922] hover:bg-slate-50 dark:hover:bg-[#1E2230] border border-slate-200 dark:border-[#232736] text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>Manage Compute</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          </Link>
        </div>
      </div>

      {/* 4 Clean KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Droplets */}
        <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Compute Droplets
            </span>
            <Server className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {activeInstances.length} / {filteredInstances.length}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">online</span>
          </div>
          <span className="mt-1 text-xs text-slate-500">Average CPU utilization: {avgCpu}%</span>
        </div>

        {/* Card 2: Managed Databases */}
        <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Databases
            </span>
            <Database className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{databases.length}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">All Healthy</span>
          </div>
          <span className="mt-1 text-xs text-slate-500">High-Availability & PITR Active</span>
        </div>

        {/* Card 3: Storage Fabric */}
        <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Storage Allocated
            </span>
            <HardDrive className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{totalStorageGb} GB</span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">NVMe + S3</span>
          </div>
          <span className="mt-1 text-xs text-slate-500">
            {volumes.length} Volumes • {buckets.length} S3 Spaces
          </span>
        </div>

        {/* Card 4: Reseller Margin */}
        <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Monthly Reseller Profit
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
              +${monthlyProfit.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">/ mo</span>
          </div>
          <span className="mt-1 text-xs text-slate-500 font-mono">
            Billed: ${monthlyRetail} • Base: ${monthlyWholesale}
          </span>
        </div>
      </div>

      {/* Cluster Telemetry Streaming Chart */}
      <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Cluster Telemetry & Load</h2>
            <span className="text-[10px] text-slate-500 font-mono">Sampling interval: 4s</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              CPU Load (%)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Memory (%)
            </span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={telemetry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface-subtle)",
                  borderColor: "var(--border-subtle)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "var(--text-primary)",
                }}
              />
              <Area type="monotone" dataKey="cpu" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#cpuGrad)" />
              <Area type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#memGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Instances Summary Table */}
      <div className="rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-[#232736] flex items-center justify-between bg-white dark:bg-[#161922]">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Active Droplet Nodes</h3>
          <Link href="/compute" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
            View all {instances.length} droplets &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#11131A] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium text-[11px] border-b border-slate-200 dark:border-[#232736]">
              <tr>
                <th className="py-2.5 px-4">Droplet Name</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Region & IP</th>
                <th className="py-2.5 px-4">Specs</th>
                <th className="py-2.5 px-4">CPU Usage</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#232736]">
              {filteredInstances.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 dark:text-slate-200 block">{inst.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{inst.id}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="inline-flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          inst.status === "active" ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300 capitalize">{inst.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="text-slate-800 dark:text-slate-300 block">{inst.ipv4}</span>
                    <span className="text-[11px] text-slate-500 uppercase">{inst.region}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {inst.plan.vcpu} vCPU • {inst.plan.ramGb} GB RAM
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-200 dark:bg-[#11131A] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${inst.currentCpu}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">{inst.currentCpu}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setTerminalInstance(inst)}
                      className="h-7 px-2.5 rounded bg-slate-100 dark:bg-[#1E2230] hover:bg-slate-200 dark:hover:bg-[#252B3D] border border-slate-200 dark:border-[#232736] text-[11px] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Terminal className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                      <span>Console</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
