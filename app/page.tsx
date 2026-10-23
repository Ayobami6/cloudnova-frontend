"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { PricingCalculator } from "@/components/landing/pricing-calculator";
import { LandingFooter } from "@/components/landing/landing-footer";
import { MaterialIcon } from "@/components/ui/material-icon";

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Can I pay using my regular Nigerian debit card or bank mobile app?",
      a: "Yes! Every CloudNova account is instantly provisioned with a dedicated NUBAN virtual bank account (via Monnify & Paystack, powered by Wema, Providus, and Sterling Bank). You can transfer Naira directly from GTBank, Zenith, Kuda, Moniepoint, OPay, or pay with your standard Verve, Mastercard, or Visa naira card.",
    },
    {
      q: "Do I ever need a domiciliary account or a virtual dollar card?",
      a: "Never. CloudNova was engineered specifically to solve the frustration of dollar card spending limits, black market FX spreads, and bank card declines. You deposit and maintain your wallet in Naira (NGN), and we handle all backend infrastructure settlements.",
    },
    {
      q: "How does CloudNova handle the USD to Naira exchange rate?",
      a: "Our upstream cloud compute and bare-metal server infrastructure is anchored in USD. We translate this automatically into transparent, predictable Naira rates with zero hidden markups. You always see the exact Naira hourly burn rate and monthly cap before provisioning any server.",
    },
    {
      q: "Where are CloudNova servers and datacenter regions located?",
      a: "We operate high-performance KVM microVMs with AMD EPYC processors and NVMe storage across 8 Tier-3/Tier-4 datacenter regions worldwide (including London, Frankfurt, New York, Singapore, and low-latency Anycast routing to West Africa). Your instances enjoy sub-20s boot times and 10Gbps interconnects.",
    },
    {
      q: "How does the ₦10,000 free starting credit work?",
      a: "When you sign up and verify your developer account, we credit your wallet with ₦10,000 in promotional cloud credit immediately. No credit card is required to claim it. You can launch compute droplets, databases, or storage buckets to test your production workloads right away.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F6F4] dark:bg-[#0F1115] text-[#1E1E1E] dark:text-white transition-colors duration-150 selection:bg-blue-600/30 selection:text-blue-200">
      <LandingNavbar />

      {/* 1. Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] dark:opacity-[0.06] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Release Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#CFE0EC] dark:bg-[#CFE0EC]/20 border border-[#CFE0EC] text-xs font-mono text-[#1E1E1E] dark:text-[#CFE0EC] shadow-2xs">
              <MaterialIcon name="payments" size={16} />
              <span>Built for Nigerian Developers & Businesses • 0% FX Surcharges</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#1E1E1E] dark:text-white leading-[1.12]">
              Deploy Global Cloud Infrastructure.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-500 dark:from-blue-400 dark:via-sky-300 dark:to-indigo-300">
                Pay in Naira (₦).
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
              No dollar card limits. No unexpected FX fluctuations. Spin up high-speed KVM Linux droplets, managed databases, and NVMe block storage in seconds with direct bank transfer.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto h-11 px-7 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:text-[#1E1E1E] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>Deploy with ₦10,000 Free Credit</span>
                <MaterialIcon name="arrow_forward" size={16} />
              </Link>
              <Link
                href="/overview"
                className="w-full sm:w-auto h-11 px-5 rounded-full bg-white dark:bg-[#1C2029] hover:bg-slate-100 dark:hover:bg-[#1E2230] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MaterialIcon name="terminal" size={16} className="text-slate-400" />
                <span>Explore Live Console Demo</span>
              </Link>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <MaterialIcon name="check_circle" size={15} className="text-emerald-500" />
                Dedicated NUBAN bank transfer
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <MaterialIcon name="check_circle" size={15} className="text-emerald-500" />
                Sub-20s KVM boot times
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <MaterialIcon name="check_circle" size={15} className="text-emerald-500" />
                Zero egress bandwidth tax
              </span>
            </div>
          </div>

          {/* Minimal Hero Preview Card */}
          <div className="mt-14 rounded-[26px] bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] shadow-xl overflow-hidden max-w-4xl mx-auto">
            {/* Top Bar */}
            <div className="h-10 bg-[#F6F6F4] dark:bg-[#161920] border-b border-[#E7E4DF] dark:border-[#282D3A] px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                <span className="text-xs font-mono text-[#8C8B87] dark:text-slate-400 ml-2">
                  console.cloudnova.io — Prepaid Naira Cloud Wallet
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#4EA871] dark:text-[#56B87C]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>NUBAN Linked • Active</span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-[#090A0F]/50">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1C2029] border border-[#E7E4DF]/70 dark:border-[#282D3A]">
                <span className="text-[11px] font-medium text-slate-500 uppercase">Prepaid Wallet</span>
                <div className="mt-1.5 text-2xl font-bold font-mono text-[#1E1E1E] dark:text-white">
                  ₦85,400.00
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">
                  Top up via Providus / Wema Bank
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#1C2029] border border-[#E7E4DF]/70 dark:border-[#282D3A]">
                <span className="text-[11px] font-medium text-slate-500 uppercase">Hourly Burn Rate</span>
                <div className="mt-1.5 text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                  ₦44.44 / hr
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  2 KVM Droplets • Per-second metering
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#1C2029] border border-[#E7E4DF]/70 dark:border-[#282D3A]">
                <span className="text-[11px] font-medium text-slate-500 uppercase">FX Savings vs AWS</span>
                <div className="mt-1.5 text-2xl font-bold font-mono text-[#4EA871] dark:text-[#56B87C]">
                  ~₦52,000 / mo
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Zero bank FX surcharge or egress
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. "How It Works" 3-Step Local Flow */}
      <section className="py-20 border-y border-[#E7E4DF] dark:border-[#282D3A] bg-white dark:bg-[#0E1017]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6D8EA] dark:bg-[#E6D8EA]/20 text-[#1E1E1E] dark:text-[#E6D8EA] text-xs font-mono border border-[#E6D8EA]">
              <MaterialIcon name="alt_route" size={16} />
              <span>Frictionless Cloud Provisioning</span>
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-[#1E1E1E] dark:text-white sm:text-4xl">
              Cloud Infrastructure in 3 Simple Steps
            </h2>
            <p className="text-sm text-[#8C8B87] dark:text-slate-400">
              No corporate dollar cards, no KYC delays, and no waiting for overseas payment approval.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-[26px] bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] space-y-4">
              <div className="w-10 h-10 rounded-full bg-[#CFE0EC] text-[#222222] flex items-center justify-center font-bold text-sm font-mono shadow-2xs">
                01
              </div>
              <h3 className="text-lg font-semibold text-[#1E1E1E] dark:text-white">
                Instant Dedicated NUBAN
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Sign up and get a personalized Nigerian virtual bank account (Providus, Wema, or Sterling) generated immediately for your team or organization.
              </p>
              <div className="pt-2 text-xs font-mono text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <MaterialIcon name="account_balance" size={16} />
                <span>Automated wallet crediting</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-[26px] bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] space-y-4">
              <div className="w-10 h-10 rounded-full bg-[#E6D8EA] text-[#222222] flex items-center justify-center font-bold text-sm font-mono shadow-2xs">
                02
              </div>
              <h3 className="text-lg font-semibold text-[#1E1E1E] dark:text-white">
                Fund in Naira with Any Bank
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Transfer Naira from GTBank, Zenith, Kuda, Moniepoint, or OPay, or pay with your standard Verve/Mastercard debit card. Zero foreign transaction fees.
              </p>
              <div className="pt-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <MaterialIcon name="bolt" size={16} />
                <span>Instant settlement in seconds</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-[26px] bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] space-y-4">
              <div className="w-10 h-10 rounded-full bg-[#F8D568] text-[#222222] flex items-center justify-center font-bold text-sm font-mono shadow-2xs">
                03
              </div>
              <h3 className="text-lg font-semibold text-[#1E1E1E] dark:text-white">
                Deploy & Scale Globally
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Launch dedicated KVM Linux instances, managed PostgreSQL, and S3 buckets with per-second metering translated cleanly to Naira.
              </p>
              <div className="pt-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <MaterialIcon name="cloud_done" size={16} />
                <span>Sub-20s boot to terminal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Offerings & Naira Pricing Cards */}
      <section id="compute" className="py-24 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5B899]/30 text-[#1E1E1E] dark:text-[#E5B899] text-xs font-mono border border-[#E5B899]/50">
            <MaterialIcon name="dns" size={16} />
            <span>High-Velocity Infrastructure</span>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#1E1E1E] dark:text-white sm:text-4xl">
            Clean Infrastructure, Transparent Naira Rates
          </h2>
          <p className="text-sm text-[#8C8B87] dark:text-slate-400">
            Every plan includes dedicated CPU, NVMe SSD, private VPC, and unmetered internal traffic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Card 1: Starter */}
          <div className="p-6 rounded-[26px] bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono uppercase font-semibold text-slate-500">Developer Starter</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Ubuntu • Debian
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-[#1E1E1E] dark:text-white">₦8,000</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <p className="text-xs text-slate-500 font-mono">~₦11.11 / hr ($5.00 USD base)</p>
              <div className="pt-2 border-t border-[#E7E4DF] dark:border-[#282D3A] space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="check" size={16} className="text-emerald-500" />
                  <span>1 Dedicated AMD vCPU</span>
                </div>
                <div className="flex items-center gap-2">
                  <MaterialIcon name="check" size={16} className="text-emerald-500" />
                  <span>1 GB High-Speed DDR5 RAM</span>
                </div>
                <div className="flex items-center gap-2">
                  <MaterialIcon name="check" size={16} className="text-emerald-500" />
                  <span>25 GB Gen4 NVMe Storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <MaterialIcon name="check" size={16} className="text-emerald-500" />
                  <span>1 TB Free Outbound Bandwidth</span>
                </div>
              </div>
            </div>
            <Link
              href="/register"
              className="w-full h-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#232834] dark:hover:bg-[#2a3040] text-xs font-semibold text-[#1E1E1E] dark:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              Deploy Starter
            </Link>
          </div>

          {/* Card 2: General Purpose (Featured) */}
          <div className="p-6 rounded-[26px] bg-white dark:bg-[#1C2029] border-2 border-blue-600/80 dark:border-blue-500 shadow-md flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl font-mono uppercase">
              Most Popular
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono uppercase font-semibold text-blue-600 dark:text-blue-400">
                  General Production
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-[#1E1E1E] dark:text-white">₦32,000</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <p className="text-xs text-slate-500 font-mono">~₦44.44 / hr ($20.00 USD base)</p>
              <div className="pt-2 border-t border-[#E7E4DF] dark:border-[#282D3A] space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="check" size={16} className="text-emerald-500" />
                  <span>2 Dedicated AMD Genoa vCPUs</span>
                </div>
                <div className="flex items-center gap-2">
                  <MaterialIcon name="check" size={16} className="text-emerald-500" />
                  <span>4 GB High-Speed DDR5 RAM</span>
                </div>
                <div className="flex items-center gap-2">
                  <MaterialIcon name="check" size={16} className="text-emerald-500" />
                  <span>50 GB Gen4 NVMe Storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <MaterialIcon name="check" size={16} className="text-emerald-500" />
                  <span>3 TB Free Outbound Bandwidth</span>
                </div>
                <div className="flex items-center gap-2">
                  <MaterialIcon name="check" size={16} className="text-emerald-500" />
                  <span>10Gbps Private VPC Interconnect</span>
                </div>
              </div>
            </div>
            <Link
              href="/register"
              className="w-full h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            >
              Deploy Production
            </Link>
          </div>

          {/* Card 3: Pro Scaler */}
          <div className="p-6 rounded-[26px] bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono uppercase font-semibold text-slate-500">High-Performance Pro</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  APIs • Databases
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-[#1E1E1E] dark:text-white">₦64,000</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <p className="text-xs text-slate-500 font-mono">~₦88.88 / hr ($40.00 USD base)</p>
              <div className="pt-2 border-t border-[#E7E4DF] dark:border-[#282D3A] space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="check" size={16} className="text-emerald-500" />
                  <span>4 Dedicated AMD Genoa vCPUs</span>
                </div>
                <div className="flex items-center gap-2">
                  <MaterialIcon name="check" size={16} className="text-emerald-500" />
                  <span>8 GB High-Speed DDR5 RAM</span>
                </div>
                <div className="flex items-center gap-2">
                  <MaterialIcon name="check" size={16} className="text-emerald-500" />
                  <span>100 GB Gen4 NVMe Storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <MaterialIcon name="check" size={16} className="text-emerald-500" />
                  <span>5 TB Free Outbound Bandwidth</span>
                </div>
              </div>
            </div>
            <Link
              href="/register"
              className="w-full h-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#232834] dark:hover:bg-[#2a3040] text-xs font-semibold text-[#1E1E1E] dark:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              Deploy Pro
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Interactive Infrastructure Sizing Calculator */}
      <PricingCalculator />

      {/* 5. Local Payment Rails & Trust Matrix */}
      <section className="py-20 border-t border-[#E7E4DF] dark:border-[#282D3A] bg-white dark:bg-[#0E1017]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-[#1E1E1E] dark:text-white">
              Built on Modern African Payment Infrastructure
            </h2>
            <p className="text-sm text-[#8C8B87] dark:text-slate-400">
              Direct integration with licensed Nigerian payment rails and financial institutions.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A]">
              <div className="font-semibold text-sm text-[#1E1E1E] dark:text-white">Monnify & Paystack</div>
              <p className="text-[11px] text-slate-500 mt-1">Direct Bank Transfers & NUBANs</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A]">
              <div className="font-semibold text-sm text-[#1E1E1E] dark:text-white">All Nigerian Banks</div>
              <p className="text-[11px] text-slate-500 mt-1">GTBank, Zenith, Kuda, OPay, Access</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A]">
              <div className="font-semibold text-sm text-[#1E1E1E] dark:text-white">Debit Cards</div>
              <p className="text-[11px] text-slate-500 mt-1">Verve, Mastercard, and Visa</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A]">
              <div className="font-semibold text-sm text-[#1E1E1E] dark:text-white">Tax & Compliance</div>
              <p className="text-[11px] text-slate-500 mt-1">VAT & WHT Invoices in Naira</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Accordion */}
      <section id="faq" className="py-20 border-t border-[#E7E4DF] dark:border-[#282D3A]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-[#1E1E1E] dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-[#8C8B87] dark:text-slate-400">
              Clear answers to common questions about billing, payment rails, and cloud performance.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="nixtio-card border border-[#E7E4DF]/60 dark:border-[#282D3A] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="text-xs font-semibold text-[#1E1E1E] dark:text-white">
                    {faq.q}
                  </span>
                  <MaterialIcon
                    name="expand_more"
                    size={18}
                    className={`text-slate-400 transition-transform duration-200 ${
                      activeFaq === idx ? "rotate-180 text-blue-600 dark:text-blue-400" : ""
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-[#1E2230]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Final Call to Action Banner */}
      <section className="py-20 border-t border-[#E7E4DF] dark:border-[#282D3A] bg-gradient-to-b from-blue-600/5 to-transparent">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-[#222222] text-white dark:bg-white dark:text-[#1E1E1E] flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <MaterialIcon name="bolt" size={24} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1E1E1E] dark:text-white">
            Start Deploying in Naira Today
          </h2>
          <p className="text-sm text-[#8C8B87] dark:text-slate-400 max-w-xl mx-auto">
            Get instant access to enterprise KVM cloud compute, managed databases, and NVMe block storage with ₦10,000 in free starting credits.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto h-11 px-8 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:text-[#1E1E1E] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <span>Create Account (₦10,000 Credit)</span>
              <MaterialIcon name="arrow_forward" size={16} />
            </Link>
            <Link
              href="/overview"
              className="w-full sm:w-auto h-11 px-6 rounded-full bg-white dark:bg-[#1C2029] hover:bg-slate-100 dark:hover:bg-[#1E2230] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Explore Live Console Demo</span>
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
