"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";

export function PricingCalculator() {
  const [vcpu, setVcpu] = useState(2);
  const [ramGb, setRamGb] = useState(4);
  const [nvmeGb, setNvmeGb] = useState(50);
  const [s3Gb, setS3Gb] = useState(250);
  const [displayCurrency, setDisplayCurrency] = useState<"NGN" | "USD">("NGN");

  // Fixed transparent exchange rate translation: 1 USD = ₦1,600
  const FX_RATE = 1600;

  // Upstream CloudNova calculation in USD:
  // vCPU: $4/mo, RAM: $2.5/GB/mo, NVMe: $0.08/GB/mo, S3: $0.015/GB/mo
  const novaMonthlyUSD = vcpu * 4 + ramGb * 2.5 + nvmeGb * 0.08 + s3Gb * 0.015;
  const novaMonthlyNGN = Math.round(novaMonthlyUSD * FX_RATE);

  const novaHourlyUSD = novaMonthlyUSD / 730;
  const novaHourlyNGN = novaMonthlyNGN / 730;

  // AWS equivalent (EC2 general purpose + EBS gp3 + S3 Standard + Egress fee estimation):
  const awsEquivalentUSD = vcpu * 9.5 + ramGb * 5.2 + nvmeGb * 0.12 + s3Gb * 0.023 + 45;
  // Nigerian bank card surcharge / black market markup (+7% FX processing overhead):
  const awsEquivalentNGN = Math.round(awsEquivalentUSD * (FX_RATE * 1.07));

  const savingsPercent = Math.round(((awsEquivalentUSD - novaMonthlyUSD) / awsEquivalentUSD) * 100);

  return (
    <section id="pricing" className="py-20 border-t border-[#E7E4DF] dark:border-[#282D3A] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6D8EA] dark:bg-[#E6D8EA]/20 text-[#1E1E1E] dark:text-[#E6D8EA] text-xs font-mono border border-[#E6D8EA]">
            <MaterialIcon name="calculate" size={16} />
            <span>Automated Naira Infrastructure Sizing</span>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#1E1E1E] dark:text-white sm:text-4xl">
            Predictable Cloud Pricing in Naira (₦)
          </h2>
          <p className="text-sm text-[#8C8B87] dark:text-slate-400">
            Our upstream infrastructure is anchored in USD, and we translate everything to Naira at transparent rates. No surprise dollar charges, no bank card limits.
          </p>

          {/* Currency Toggle */}
          <div className="pt-2 flex justify-center">
            <div className="inline-flex p-1 rounded-full bg-slate-100 dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A]">
              <button
                type="button"
                onClick={() => setDisplayCurrency("NGN")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  displayCurrency === "NGN"
                    ? "bg-white dark:bg-[#232834] text-[#1E1E1E] dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                🇳🇬 Naira (NGN)
              </button>
              <button
                type="button"
                onClick={() => setDisplayCurrency("USD")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  displayCurrency === "USD"
                    ? "bg-white dark:bg-[#232834] text-[#1E1E1E] dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                🇺🇸 Dollars (USD)
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Sliders Box */}
          <div className="lg:col-span-7 bg-white dark:bg-[#1C2029] p-6 sm:p-8 rounded-[26px] border border-[#E7E4DF]/70 dark:border-[#282D3A] shadow-xs space-y-6 flex flex-col justify-between">
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
                  step={1}
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
                  <span className="text-slate-700 dark:text-slate-300">S3 Object Storage (Zero Egress Tax)</span>
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

            <div className="pt-4 border-t border-[#E7E4DF] dark:border-[#282D3A] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 text-[#4EA871] dark:text-[#56B87C] font-medium">
                <MaterialIcon name="check_circle" size={16} />
                No minimum commit • Pay as you go
              </span>
              <span className="font-mono text-[11px]">
                Translation Peg: $1 = ₦{FX_RATE.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Pricing Comparison Card */}
          <div className="lg:col-span-5 bg-white dark:bg-[#1C2029] p-6 sm:p-8 rounded-[26px] border border-[#E7E4DF]/70 dark:border-[#282D3A] shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                  Estimated Rate ({displayCurrency})
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-[#4EA871] dark:text-[#56B87C] border border-emerald-500/20">
                  <MaterialIcon name="trending_down" size={14} />
                  Save ~{savingsPercent}%
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-mono font-bold text-[#1E1E1E] dark:text-white">
                    {displayCurrency === "NGN"
                      ? `₦${novaMonthlyNGN.toLocaleString()}`
                      : `$${novaMonthlyUSD.toFixed(2)}`}
                  </span>
                  <span className="text-slate-500 font-medium text-sm">/ month</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs font-mono text-slate-400">
                    {displayCurrency === "NGN"
                      ? `~₦${novaHourlyNGN.toFixed(2)} / hour (billed per second)`
                      : `$${novaHourlyUSD.toFixed(3)} / hour`}
                  </p>
                  {displayCurrency === "NGN" && (
                    <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded">
                      ${novaMonthlyUSD.toFixed(2)} USD base
                    </span>
                  )}
                </div>
              </div>

              {/* Comparison vs AWS */}
              <div className="p-4 rounded-xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>AWS EC2 + EBS (with card FX markup):</span>
                  <span className="font-mono line-through text-slate-400">
                    {displayCurrency === "NGN"
                      ? `~₦${awsEquivalentNGN.toLocaleString()}/mo`
                      : `$${awsEquivalentUSD.toFixed(2)}/mo`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Foreign Egress Bandwidth Fees:</span>
                  <span className="font-mono text-rose-500">+$0.09 / GB (Billed in USD)</span>
                </div>
                <div className="flex justify-between items-center text-[#4EA871] dark:text-[#56B87C] font-semibold pt-1 border-t border-[#E7E4DF] dark:border-[#282D3A]">
                  <span>CloudNova Outbound Egress:</span>
                  <span className="font-mono">₦0.00 (Unlimited Free)</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="verified" size={16} className="text-emerald-500 shrink-0" />
                  <span>Pay via Nigerian Bank Transfer, USSD, or Debit Card</span>
                </div>
                <div className="flex items-center gap-2">
                  <MaterialIcon name="verified" size={16} className="text-emerald-500 shrink-0" />
                  <span>Dedicated NUBAN account (Wema, Providus, Sterling)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MaterialIcon name="verified" size={16} className="text-emerald-500 shrink-0" />
                  <span>No dollar card limits or failed international debits</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#E7E4DF] dark:border-[#282D3A]">
              <Link
                href="/register"
                className="w-full h-11 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:text-[#1E1E1E] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <span>Deploy with ₦10,000 Free Credit</span>
                <MaterialIcon name="arrow_forward" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
