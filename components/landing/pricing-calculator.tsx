"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calculator, Check, ArrowRight, TrendingDown, Zap } from "lucide-react";

export function PricingCalculator() {
  const [vcpu, setVcpu] = useState(4);
  const [ramGb, setRamGb] = useState(16);
  const [nvmeGb, setNvmeGb] = useState(200);
  const [s3Gb, setS3Gb] = useState(1000);

  // CloudNova calculation:
  // vCPU: $4/mo, RAM: $2.5/GB/mo, NVMe: $0.08/GB/mo, S3: $0.015/GB/mo
  const novaMonthly = vcpu * 4 + ramGb * 2.5 + nvmeGb * 0.08 + s3Gb * 0.015;

  // AWS equivalent (EC2 general purpose + EBS gp3 + S3 Standard + Egress fee estimation):
  const awsEquivalent = (vcpu * 9.5 + ramGb * 5.2 + nvmeGb * 0.12 + s3Gb * 0.023 + 45);

  const savingsPercent = Math.round(((awsEquivalent - novaMonthly) / awsEquivalent) * 100);

  return (
    <section id="pricing" className="py-20 border-t border-slate-200 dark:border-[#232736] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 text-xs font-mono border border-blue-200 dark:border-blue-500/20">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Infrastructure Sizing</span>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Predictable, Zero-Egress Cloud Pricing
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No surprise bandwidth bills, no complex reservations. Scale freely with per-second metering and transparent monthly caps.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Sliders Box */}
          <div className="lg:col-span-7 bg-white dark:bg-[#11131A] p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-[#232736] shadow-xs space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* vCPU */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Dedicated KVM vCPUs</span>
                  <span className="font-mono text-sm text-blue-600 dark:text-blue-400 font-semibold">
                    {vcpu} vCPU
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={32}
                  value={vcpu}
                  onChange={(e) => setVcpu(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-[#232736] rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1 Core</span>
                  <span>8 Cores</span>
                  <span>16 Cores</span>
                  <span>32 Cores</span>
                </div>
              </div>

              {/* RAM */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">High-Speed ECC DDR5 Memory</span>
                  <span className="font-mono text-sm text-blue-600 dark:text-blue-400 font-semibold">
                    {ramGb} GB RAM
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={128}
                  step={2}
                  value={ramGb}
                  onChange={(e) => setRamGb(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-[#232736] rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1 GB</span>
                  <span>32 GB</span>
                  <span>64 GB</span>
                  <span>128 GB</span>
                </div>
              </div>

              {/* NVMe SSD */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Gen4 NVMe Block Storage</span>
                  <span className="font-mono text-sm text-blue-600 dark:text-blue-400 font-semibold">
                    {nvmeGb} GB SSD
                  </span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={2000}
                  step={25}
                  value={nvmeGb}
                  onChange={(e) => setNvmeGb(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-[#232736] rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>25 GB</span>
                  <span>500 GB</span>
                  <span>1,000 GB</span>
                  <span>2,000 GB</span>
                </div>
              </div>

              {/* S3 Object Storage */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">S3 Object Storage (Zero Egress)</span>
                  <span className="font-mono text-sm text-blue-600 dark:text-blue-400 font-semibold">
                    {s3Gb.toLocaleString()} GB
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10000}
                  step={250}
                  value={s3Gb}
                  onChange={(e) => setS3Gb(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-[#232736] rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0 GB</span>
                  <span>2,500 GB</span>
                  <span>5,000 GB</span>
                  <span>10,000 GB</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-[#232736] flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5" />
                No minimum commit required
              </span>
              <span>10Gbps Network Port included</span>
            </div>
          </div>

          {/* Pricing Comparison Card */}
          <div className="lg:col-span-5 bg-white dark:bg-[#11131A] p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-[#232736] shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Estimated Cost</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <TrendingDown className="w-3 h-3" />
                  Save {savingsPercent}%
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-mono font-bold text-slate-900 dark:text-slate-100">
                    ${novaMonthly.toFixed(2)}
                  </span>
                  <span className="text-slate-500 font-medium text-sm">/ month</span>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  ${(novaMonthly / 730).toFixed(3)} per hour (billed per second)
                </p>
              </div>

              {/* Comparison vs AWS */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#161922] border border-slate-200 dark:border-[#232736] space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Equivalent AWS EC2 + EBS:</span>
                  <span className="font-mono line-through text-slate-400">${awsEquivalent.toFixed(2)}/mo</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>AWS Data Transfer Egress Tax:</span>
                  <span className="font-mono text-rose-500">+~$0.09 / GB</span>
                </div>
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-semibold pt-1 border-t border-slate-200 dark:border-[#232736]">
                  <span>CloudNova Outbound Egress:</span>
                  <span className="font-mono">$0.00 (Unlimited Free)</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Free automated Let&apos;s Encrypt SSL certificates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>1.2 Tbps Anycast DDoS Shield included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Point-In-Time recovery and snapshot backups</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-[#232736]">
              <Link
                href="/register"
                className="w-full h-10 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <span>Deploy Configuration ($200 Credit)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
