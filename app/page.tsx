"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Server,
  Database,
  HardDrive,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronDown,
  Sparkles,
  Terminal,
  Activity,
  Cpu,
  Layers,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { PricingCalculator } from "@/components/landing/pricing-calculator";
import { InteractiveCliPreview } from "@/components/landing/interactive-cli-preview";
import { LandingFooter } from "@/components/landing/landing-footer";
import { REGIONS } from "@/lib/mock-data/initial-state";

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does CloudNova offer zero egress bandwidth fees?",
      a: "Unlike legacy hyperscalers who charge exorbitant markups of up to $0.09 per gigabyte of outbound traffic, CloudNova owns and operates its Anycast network backbone with direct Tier-1 transit peering. We bundle generous unmetered transfer with every droplet and charge $0 for outbound S3 and volume transfers.",
    },
    {
      q: "What virtualization technology powers CloudNova droplets?",
      a: "Every CloudNova droplet is an isolated hardware-virtualized KVM microVM running on top-tier AMD EPYC 9654 Genoa and Milan enterprise processors with PCIe Gen4 NVMe block storage. Boot times consistently average under 18 seconds.",
    },
    {
      q: "Can I migrate existing workloads from AWS, DigitalOcean, or GCP?",
      a: "Yes. Our S3 Spaces API is 100% compliant with standard S3 SDKs and AWS CLI commands. Our database engines are standard, un-forked PostgreSQL, MySQL, and Redis, enabling zero-friction live replication migrations using pg_dump or native replication streams.",
    },
    {
      q: "What payment rails are supported for cloud wallet deposits?",
      a: "We support Visa, Mastercard, American Express, instant ACH/FedNow bank wire transfers, and automated cryptocurrency settlement via USDC on Base and Ethereum with zero processing fees.",
    },
    {
      q: "What is your High Availability (HA) SLA guarantee?",
      a: "We contractually guarantee a 99.995% uptime SLA backed by automated multi-datacenter failover, distributed Ceph storage replication, and 1.2 Tbps Anycast DDoS scrubbing centers.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 transition-colors duration-150 selection:bg-blue-600/30 selection:text-blue-200">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] dark:opacity-[0.06] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Release Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 text-xs font-mono text-blue-600 dark:text-blue-400 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CloudNova 2.4 — Global Anycast Mesh & 100Gbps Fabric</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.12]">
              Next-Generation Cloud Compute & Data at{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-500 dark:from-blue-400 dark:via-sky-300 dark:to-indigo-300">
                Planetary Scale
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Deploy high-performance KVM droplets, distributed PostgreSQL clusters, and zero-egress S3 object storage in under 30 seconds across 8 global datacenter regions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto h-11 px-6 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>Deploy with $200 Free Credit</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/overview"
                className="w-full sm:w-auto h-11 px-5 rounded-md bg-white dark:bg-[#161922] hover:bg-slate-100 dark:hover:bg-[#1E2230] border border-slate-200 dark:border-[#232736] text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-slate-400" />
                <span>Explore Live Console Demo</span>
              </Link>
            </div>

            {/* Sub-CTA Trust Signals */}
            <div className="flex items-center justify-center gap-6 pt-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                No credit card required
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Sub-20s boot times
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                99.995% uptime SLA
              </span>
            </div>
          </div>

          {/* Hero Interactive Stream / Console Mockup */}
          <div className="mt-16 rounded-xl bg-white dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] shadow-2xl overflow-hidden max-w-5xl mx-auto">
            {/* Window bar */}
            <div className="h-10 bg-slate-50 dark:bg-[#161922] border-b border-slate-200 dark:border-[#232736] px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 ml-2">
                  console.cloudnova.io — Live Telemetry
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>8 / 8 Regions Connected</span>
              </div>
            </div>

            {/* Mock Dashboard Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-[#090A0F]/50">
              <div className="p-4 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736]">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Active Compute</span>
                <div className="mt-2 text-2xl font-semibold font-mono text-slate-900 dark:text-slate-100">
                  4 Droplets
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">100% Health Score</span>
              </div>

              <div className="p-4 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736]">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Managed Databases</span>
                <div className="mt-2 text-2xl font-semibold font-mono text-slate-900 dark:text-slate-100">
                  2 Clusters
                </div>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 block">PgBouncer Active</span>
              </div>

              <div className="p-4 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736]">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">NVMe + S3 Storage</span>
                <div className="mt-2 text-2xl font-semibold font-mono text-slate-900 dark:text-slate-100">
                  3.35 TB
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">Zero Egress Tax</span>
              </div>

              <div className="p-4 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736]">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Global Uptime SLA</span>
                <div className="mt-2 text-2xl font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                  99.995%
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">DDoS Shield Engaged</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Telemetry Metrics Band */}
      <section className="py-12 border-y border-slate-200 dark:border-[#232736] bg-white dark:bg-[#0E1017]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-mono font-bold text-slate-900 dark:text-slate-100">
                8 Regions
              </div>
              <p className="text-xs text-slate-500 font-medium">Americas, Europe & Asia-Pacific</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-mono font-bold text-blue-600 dark:text-blue-400">
                &lt;15 ms
              </div>
              <p className="text-xs text-slate-500 font-medium">Global Anycast edge latency</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                99.995%
              </div>
              <p className="text-xs text-slate-500 font-medium">Contractually backed SLA</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-mono font-bold text-slate-900 dark:text-slate-100">
                $0.00
              </div>
              <p className="text-xs text-slate-500 font-medium">Zero outbound data transfer tax</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 1: Compute Droplets */}
      <section id="compute" className="py-24 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 text-xs font-mono border border-blue-200 dark:border-blue-500/20">
              <Server className="w-3.5 h-3.5" />
              <span>Dedicated KVM Cloud Compute</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              High-Velocity Droplets with AMD EPYC & NVIDIA GPUs
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Launch dedicated Linux instances running Ubuntu 24.04, Debian 12, Alpine, or Rocky Linux in seconds. Every instance features non-oversubscribed CPU cores, PCIe Gen4 NVMe disk, and a 10Gbps private VPC interconnect.
            </p>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Instant SSH key injection with cloud-init user data automation</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Sub-20 second cold boots from API call to command prompt</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>In-browser Web-TTY terminal console for rescue operations</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/compute"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>View Compute Droplet fleet options</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#232736]">
              <span className="text-xs font-mono font-medium text-slate-500">Hardware Fleet Configuration</span>
              <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                10Gbps Line Rate
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#161922] border border-slate-200 dark:border-[#232736] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">Standard General Purpose</span>
                  <span className="text-slate-500 text-[11px]">2 vCPU • 4 GB RAM • 50 GB NVMe</span>
                </div>
                <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">$18.00/mo</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#161922] border border-slate-200 dark:border-[#232736] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">Compute-Optimized (AMD Genoa)</span>
                  <span className="text-slate-500 text-[11px]">8 vCPU • 16 GB RAM • 160 GB NVMe</span>
                </div>
                <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">$64.00/mo</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#161922] border border-slate-200 dark:border-[#232736] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">AI & GPU Acceleration</span>
                  <span className="text-slate-500 text-[11px]">16 vCPU • 64 GB RAM • 24GB RTX A5000</span>
                </div>
                <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">$340.00/mo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 2: Managed Databases */}
      <section id="databases" className="py-24 bg-white dark:bg-[#0E1017] border-y border-slate-200 dark:border-[#232736]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Database Card UI */}
            <div className="order-2 lg:order-1 rounded-xl bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#232736]">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    pg-primary-cluster.internal
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  HA Cluster Active
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736]">
                  <span className="text-slate-500 text-[10px] uppercase">Engine</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block mt-0.5">PostgreSQL 16.2</span>
                </div>
                <div className="p-3 rounded bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736]">
                  <span className="text-slate-500 text-[10px] uppercase">Pooler</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 block mt-0.5">PgBouncer (1.2k)</span>
                </div>
                <div className="p-3 rounded bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736]">
                  <span className="text-slate-500 text-[10px] uppercase">PITR Backup</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5">Continuous</span>
                </div>
              </div>

              <div className="p-3 rounded bg-[#0B0D13] text-slate-300 font-mono text-[11px] overflow-x-auto">
                <code>postgres://nova_app:••••••••@nyc1-pg-primary.cloudnova.io:5432/production?sslmode=require</code>
              </div>
            </div>

            {/* Description */}
            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 text-xs font-mono border border-blue-200 dark:border-blue-500/20">
                <Database className="w-3.5 h-3.5" />
                <span>Zero-Maintenance Data Tier</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Enterprise Managed PostgreSQL, MySQL & Redis
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Offload database administration. CloudNova provisions high-availability clusters with standby replica failover, transaction pooling with PgBouncer, automated OS patching, and 30-day point-in-time recovery.
              </p>

              <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Sub-second failover with synchronous replication and quorum consensus</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Built-in connection pooling handles thousands of concurrent serverless requests</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Point-in-time restoration allows rolling back to any millisecond within 30 days</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/databases"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>Explore Managed Database features</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 3: NVMe & S3 Storage Fabric */}
      <section id="storage" className="py-24 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 text-xs font-mono border border-blue-200 dark:border-blue-500/20">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Unified Storage Fabric</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Elastic NVMe Volumes & S3 Spaces Without Egress Markups
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Mount resilient NVMe block storage directly to active droplets or serve petabyte-scale media assets through zero-egress S3 object spaces. Resize volumes live with zero downtime or filesystem corruption.
            </p>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Zero outbound data egress charges on all S3 object storage transfers</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>In-place volume expansion without taking VMs offline</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>100% S3 API compatibility with existing AWS SDKs, Cyberduck, and s3cmd</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/storage"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>View Storage Fabric details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#232736]">
              <span className="text-xs font-mono font-medium text-slate-500">Storage Performance Benchmarks</span>
              <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                PCIe Gen4 NVMe
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                  <span>Random Read IOPS (4K)</span>
                  <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">120,000 IOPS</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-[#161922] h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full w-[92%]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                  <span>Sequential Throughput</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">1.85 GB/s</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-[#161922] h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full w-[88%]" />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#161922] border border-slate-200 dark:border-[#232736] space-y-1">
                <span className="font-semibold text-slate-900 dark:text-slate-100 block">S3 Presigned URLs</span>
                <p className="text-[11px] text-slate-500">
                  Generate secure, time-bounded direct upload and download URLs with custom HMAC authorization tokens.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Datacenter Regions Map */}
      <section className="py-20 bg-white dark:bg-[#0E1017] border-y border-slate-200 dark:border-[#232736]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 text-xs font-mono border border-blue-200 dark:border-blue-500/20">
              <Globe className="w-3.5 h-3.5" />
              <span>Global Anycast PoPs</span>
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Planetary Edge Network
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Low-latency edge connectivity with direct BGP peering to major internet exchanges in North America, Europe, and Asia.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {REGIONS.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-lg bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] hover:border-blue-500/50 transition-colors shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{r.flag}</span>
                  <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    {r.pingMs}ms
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">{r.name}</span>
                  <span className="text-[11px] text-slate-500">{r.country}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-[#232736] flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{r.id.toUpperCase()}</span>
                  <span className="text-emerald-500">ONLINE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Calculator Section */}
      <PricingCalculator />

      {/* Developer Automation & CLI Section */}
      <InteractiveCliPreview />

      {/* Customer Testimonials & Social Proof */}
      <section className="py-20 border-t border-slate-200 dark:border-[#232736] bg-white dark:bg-[#0E1017]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Trusted by High-Throughput Engineering Teams
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              From fast-scaling AI labs to real-time financial data engines, see why architects choose CloudNova.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                &ldquo;We run 18,000 requests per second across our API gateways. On AWS, our monthly cross-AZ and outbound transfer charges exceeded our actual EC2 bill. Moving to CloudNova eliminated $38,000/mo in pure transit overhead.&rdquo;
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-[#232736]">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">David Zhao</span>
                <span className="text-[11px] text-slate-500">Chief Architect, DataStream IO</span>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                &ldquo;The sub-20s droplet spin-up times revolutionized our CI/CD pipeline. Our integration test suites provision fresh ephemeral KVM microVMs per pull request, saving 12 developer hours every single week.&rdquo;
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-[#232736]">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">Elena Rostova</span>
                <span className="text-[11px] text-slate-500">Head of Platform, Voxel Gaming Engine</span>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                &ldquo;Point-in-time recovery on their Managed PostgreSQL saved our database from an erroneous migration without losing a single customer transaction. Their support is responsive, technical, and top tier.&rdquo;
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-[#232736]">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">Marcus Vance</span>
                <span className="text-[11px] text-slate-500">VP of Infrastructure, Hyperscale AI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20 border-t border-slate-200 dark:border-[#232736]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Everything you need to know about billing, technical specs, and SLAs.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-white dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
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

      {/* Final Call to Action Banner */}
      <section className="py-20 border-t border-slate-200 dark:border-[#232736] bg-gradient-to-b from-blue-600/5 to-transparent">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Start Deploying on CloudNova in Under 30 Seconds
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Experience true calm cloud infrastructure with zero egress markups, instant KVM droplet boot times, and $200 in free starting credits.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto h-11 px-8 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <span>Create Account ($200 Credit)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/overview"
              className="w-full sm:w-auto h-11 px-6 rounded-md bg-white dark:bg-[#161922] hover:bg-slate-100 dark:hover:bg-[#1E2230] border border-slate-200 dark:border-[#232736] text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
