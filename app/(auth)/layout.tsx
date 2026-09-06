"use client";

import React from "react";
import Link from "next/link";
import { Cloud, ShieldCheck, Zap, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/store/theme-context";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 transition-colors duration-150">
      {/* Left side: Enterprise Brand & Infrastructure Telemetry (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-white dark:bg-[#0E1017] border-r border-slate-200 dark:border-[#232736] relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] dark:opacity-[0.07] pointer-events-none" />

        {/* Top: Brand */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                CloudNova
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20">
                  GLOBAL CLOUD
                </span>
              </span>
              <p className="text-xs text-slate-500 font-normal">Next-Gen Developer Cloud Infrastructure</p>
            </div>
          </Link>
        </div>

        {/* Middle: Architecture Quote & Telemetry */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>Planetary Anycast Mesh • 100Gbps Spine</span>
          </div>

          <blockquote className="text-xl font-medium tracking-tight text-slate-800 dark:text-slate-200 leading-relaxed">
            &ldquo;CloudNova reduced our p99 database response times from 140ms to 18ms across 8 continents, while completely eliminating our monthly AWS egress tax.&rdquo;
          </blockquote>

          <div className="flex items-center gap-3 pt-2">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[#1E2230] border border-slate-300 dark:border-[#2E3547] flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-300">
              MV
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Marcus Vance</p>
              <p className="text-xs text-slate-500">VP of Infrastructure, Hyperscale AI Labs</p>
            </div>
          </div>
        </div>

        {/* Bottom: SLA Guarantees */}
        <div className="relative z-10 pt-8 border-t border-slate-200 dark:border-[#232736] flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              99.995% Uptime SLA
            </span>
            <span>•</span>
            <span>SOC2 Type II</span>
            <span>•</span>
            <span>Zero Egress Tax</span>
          </div>
          <span className="font-mono text-[11px]">v2.4.0-prod</span>
        </div>
      </div>

      {/* Right side: Auth Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12">
        {/* Top Header Controls */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto">
          <Link href="/" className="lg:hidden inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Cloud className="w-4 h-4" />
            </div>
            <span className="font-semibold text-base text-slate-900 dark:text-slate-100">CloudNova</span>
          </Link>
          <div className="ml-auto">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-md bg-white dark:bg-[#161922] hover:bg-slate-100 dark:hover:bg-[#1E2230] border border-slate-200 dark:border-[#232736] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Center: Children Form */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          {children}
        </div>

        {/* Bottom Footer Links */}
        <div className="w-full max-w-md mx-auto text-center text-xs text-slate-500 space-x-4">
          <Link href="/" className="hover:text-slate-700 dark:hover:text-slate-300">
            Landing Page
          </Link>
          <span>•</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">
            Privacy Policy
          </span>
          <span>•</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">
            System Status
          </span>
        </div>
      </div>
    </div>
  );
}
