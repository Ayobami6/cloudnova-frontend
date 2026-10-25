"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/lib/store/theme-context";
import { MaterialIcon } from "@/components/ui/material-icon";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen w-full flex bg-[#F6F6F4] dark:bg-[#0F1115] text-[#1E1E1E] dark:text-[#F4F5F7] p-3 sm:p-5 gap-5 transition-colors duration-150">
      {/* Left side: Matte Charcoal + Pastel Bento Showcase (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-10 bg-[#222222] dark:bg-[#14161B] text-white rounded-[32px] relative overflow-hidden shadow-xl">
        {/* Top: Brand */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#CFE0EC] text-[#222222] flex items-center justify-center shadow-sm">
              <MaterialIcon name="cloud_done" size={22} />
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight text-white flex items-center gap-2">
                TibiCloud
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#F8D568] text-[#1E1E1E] font-semibold">
                  GLOBAL CLOUD
                </span>
              </span>
              <p className="text-xs text-white/65 font-normal">
                Next-Gen Developer Cloud Infrastructure
              </p>
            </div>
          </Link>
        </div>

        {/* Middle: Pastel KPI Mini Cards + Quote */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#E6D8EA] text-[#1E1E1E]">
              <span className="text-[11px] font-medium block opacity-80">KVM Boot</span>
              <span className="text-xl font-bold tabular-nums mt-0.5 block">18.4s</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#CFE0EC] text-[#1E1E1E]">
              <span className="text-[11px] font-medium block opacity-80">Global PoPs</span>
              <span className="text-xl font-bold tabular-nums mt-0.5 block">8 Regions</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F8D568] text-[#1E1E1E]">
              <span className="text-[11px] font-medium block opacity-80">Egress Tax</span>
              <span className="text-xl font-bold tabular-nums mt-0.5 block">$0.00</span>
            </div>
          </div>

          <blockquote className="text-xl font-medium tracking-tight text-white/95 leading-relaxed">
            &ldquo;TibiCloud reduced our p99 database response times from 140ms to 18ms across 8 continents, while completely eliminating our monthly AWS egress tax.&rdquo;
          </blockquote>

          <div className="flex items-center gap-3 pt-1">
            <div className="w-10 h-10 rounded-full bg-[#CFE0EC] text-[#1E1E1E] flex items-center justify-center text-xs font-bold">
              AR
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Alexandra Rose</p>
              <p className="text-xs text-white/60">VP of Infrastructure, Hyperscale AI Labs</p>
            </div>
          </div>
        </div>

        {/* Bottom: SLA Guarantees */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-[#4EA871]">
              <MaterialIcon name="verified" size={16} />
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
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 nixtio-stone-panel">
        <div className="flex items-center justify-between w-full max-w-md mx-auto">
          <Link href="/" className="lg:hidden inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#CFE0EC] text-[#222222] flex items-center justify-center">
              <MaterialIcon name="cloud_done" size={18} />
            </div>
            <span className="font-semibold text-base text-[#1E1E1E] dark:text-white">
              TibiCloud
            </span>
          </Link>
          <div className="ml-auto">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-white dark:bg-[#1C2029] text-[#1E1E1E] dark:text-slate-200 flex items-center justify-center shadow-2xs cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              <MaterialIcon name={theme === "dark" ? "light_mode" : "dark_mode"} size={18} />
            </button>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto my-auto py-6">
          <div className="nixtio-card p-6 sm:p-8">{children}</div>
        </div>

        <div className="w-full max-w-md mx-auto text-center text-xs text-[#8C8B87] space-x-4">
          <Link href="/" className="hover:text-[#1E1E1E] dark:hover:text-white">
            Landing Page
          </Link>
          <span>•</span>
          <span className="hover:text-[#1E1E1E] dark:hover:text-white cursor-pointer">
            Privacy Policy
          </span>
          <span>•</span>
          <span className="hover:text-[#1E1E1E] dark:hover:text-white cursor-pointer">
            System Status
          </span>
        </div>
      </div>
    </div>
  );
}
