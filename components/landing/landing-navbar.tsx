"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Cloud, ArrowRight, Sun, Moon, Menu, X, ShieldCheck } from "lucide-react";
import { useTheme } from "@/lib/store/theme-context";
import { useAuth } from "@/lib/store/auth-context";

export function LandingNavbar() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#090A0F]/80 backdrop-blur-md border-b border-slate-200 dark:border-[#232736] transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Cloud className="w-5 h-5" />
          </div>
          <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            CloudNova
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20">
              CLOUD
            </span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-600 dark:text-slate-400">
          <a href="#compute" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Compute Droplets
          </a>
          <a href="#databases" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Managed Databases
          </a>
          <a href="#storage" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            NVMe & S3 Storage
          </a>
          <a href="#pricing" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Pricing
          </a>
          <a href="#developers" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            API & CLI
          </a>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-md bg-slate-100 dark:bg-[#161922] hover:bg-slate-200 dark:hover:bg-[#1E2230] border border-slate-200 dark:border-[#232736] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
          </button>

          {/* Conditional Auth CTA */}
          {isAuthenticated ? (
            <Link
              href="/overview"
              className="h-8 px-3.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span>Go to Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="h-8 px-3 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#161922] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="h-8 px-3.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <span>Deploy with $200 Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-600 dark:text-slate-400"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-[#232736] bg-white dark:bg-[#0E1017] px-6 py-4 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <a
              href="#compute"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Compute Droplets
            </a>
            <a
              href="#databases"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Managed Databases
            </a>
            <a
              href="#storage"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-blue-600 dark:hover:text-blue-400"
            >
              NVMe & S3 Storage
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Pricing
            </a>
            <a
              href="#developers"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-blue-600 dark:hover:text-blue-400"
            >
              API & CLI
            </a>
          </nav>
          <div className="pt-2 border-t border-slate-200 dark:border-[#232736] flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full h-9 rounded-md border border-slate-200 dark:border-[#232736] text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="w-full h-9 rounded-md bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <span>Create Account ($200 Credit)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
