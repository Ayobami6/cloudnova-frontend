"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/store/theme-context";
import { useAuth } from "@/lib/store/auth-context";
import { MaterialIcon } from "@/components/ui/material-icon";

export function LandingNavbar() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F6F6F4]/90 dark:bg-[#0F1115]/90 backdrop-blur-md border-b border-[#E7E4DF] dark:border-[#282D3A] transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#CFE0EC] text-[#222222] flex items-center justify-center shadow-2xs">
            <MaterialIcon name="cloud_done" size={18} />
          </div>
          <span className="font-semibold text-base tracking-tight text-[#1E1E1E] dark:text-white flex items-center gap-2">
            TibiCloud
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E6D8EA] text-[#1E1E1E] font-medium">
              CLOUD
            </span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white dark:bg-[#1C2029] shadow-2xs text-xs font-medium text-[#5A5A58] dark:text-slate-300">
          <a href="#compute" className="px-3.5 py-1.5 rounded-full hover:bg-[#EFECE8] dark:hover:bg-[#232834] hover:text-[#1E1E1E] dark:hover:text-white transition-colors">
            Compute Droplets
          </a>
          <a href="#databases" className="px-3.5 py-1.5 rounded-full hover:bg-[#EFECE8] dark:hover:bg-[#232834] hover:text-[#1E1E1E] dark:hover:text-white transition-colors">
            Managed Databases
          </a>
          <a href="#storage" className="px-3.5 py-1.5 rounded-full hover:bg-[#EFECE8] dark:hover:bg-[#232834] hover:text-[#1E1E1E] dark:hover:text-white transition-colors">
            NVMe & S3 Storage
          </a>
          <a href="#pricing" className="px-3.5 py-1.5 rounded-full hover:bg-[#EFECE8] dark:hover:bg-[#232834] hover:text-[#1E1E1E] dark:hover:text-white transition-colors">
            Pricing
          </a>
          <a href="#developers" className="px-3.5 py-1.5 rounded-full hover:bg-[#EFECE8] dark:hover:bg-[#232834] hover:text-[#1E1E1E] dark:hover:text-white transition-colors">
            API & CLI
          </a>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full bg-white dark:bg-[#1C2029] text-[#1E1E1E] dark:text-slate-200 flex items-center justify-center shadow-2xs cursor-pointer"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            <MaterialIcon name={theme === "dark" ? "light_mode" : "dark_mode"} size={18} />
          </button>

          {isAuthenticated ? (
            <Link
              href="/overview"
              className="h-9 px-4 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:text-[#1E1E1E] text-white text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <span>Go to Console</span>
              <MaterialIcon name="arrow_forward" size={15} />
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="h-9 px-4 rounded-full bg-white dark:bg-[#1C2029] text-xs font-medium text-[#1E1E1E] dark:text-slate-200 inline-flex items-center justify-center shadow-2xs hover:bg-[#EFECE8] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="h-9 px-4 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:text-[#1E1E1E] text-white text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <span>Deploy with ₦10,000 Free</span>
                <MaterialIcon name="arrow_forward" size={15} />
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-full bg-white dark:bg-[#1C2029] flex items-center justify-center text-[#1E1E1E] dark:text-white"
            aria-label="Toggle Navigation"
          >
            <MaterialIcon name={mobileMenuOpen ? "close" : "menu"} size={18} />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7E4DF] dark:border-[#282D3A] bg-[#F6F6F4] dark:bg-[#161920] px-6 py-4 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-[#1E1E1E] dark:text-slate-200">
            <a href="#compute" onClick={() => setMobileMenuOpen(false)} className="py-1.5">Compute Droplets</a>
            <a href="#databases" onClick={() => setMobileMenuOpen(false)} className="py-1.5">Managed Databases</a>
            <a href="#storage" onClick={() => setMobileMenuOpen(false)} className="py-1.5">NVMe & S3 Storage</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-1.5">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-1.5">FAQ</a>
          </nav>
          <div className="pt-2 border-t border-[#E7E4DF] dark:border-[#282D3A] flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full h-10 rounded-full bg-white dark:bg-[#1C2029] text-xs font-medium text-[#1E1E1E] dark:text-white flex items-center justify-center"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="w-full h-10 rounded-full bg-[#222222] text-white text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <span>Create Account (₦10,000 Credit)</span>
              <MaterialIcon name="arrow_forward" size={15} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
