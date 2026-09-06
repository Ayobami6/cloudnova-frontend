"use client";

import React from "react";
import Link from "next/link";
import { Cloud, ShieldCheck } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-white dark:bg-[#090A0F] border-t border-slate-200 dark:border-[#232736] pt-16 pb-12 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12">
          {/* Col 1: Brand */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Cloud className="w-5 h-5" />
              </div>
              <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-slate-100">
                CloudNova
              </span>
            </Link>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Developer-first global cloud infrastructure platform providing high-performance KVM compute, managed multi-engine databases, and zero-egress NVMe & S3 storage across 8 planetary datacenter regions.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational (99.995% SLA)</span>
            </div>
          </div>

          {/* Col 2: Products */}
          <div className="space-y-3 text-xs">
            <span className="font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono text-[11px]">
              Products
            </span>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
              <li>
                <a href="#compute" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Compute Droplets
                </a>
              </li>
              <li>
                <a href="#databases" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Managed PostgreSQL & Redis
                </a>
              </li>
              <li>
                <a href="#storage" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  NVMe Block Storage
                </a>
              </li>
              <li>
                <a href="#storage" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  S3 Object Spaces
                </a>
              </li>
              <li>
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                  Layer 4/7 Load Balancers
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Developers */}
          <div className="space-y-3 text-xs">
            <span className="font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono text-[11px]">
              Developers
            </span>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
              <li>
                <a href="#developers" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  CloudNova CLI
                </a>
              </li>
              <li>
                <a href="#developers" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Terraform Provider
                </a>
              </li>
              <li>
                <a href="#developers" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  REST API Documentation
                </a>
              </li>
              <li>
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                  Cloud-Init Recipes
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                  GitHub Actions Runner
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Company */}
          <div className="space-y-3 text-xs">
            <span className="font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono text-[11px]">
              Company & Legal
            </span>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
              <li>
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                  About CloudNova
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                  Global Datacenters
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                  Security & SOC2
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-200 dark:border-[#232736] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CloudNova Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>TLS 1.3 Strict</span>
            <span>•</span>
            <span>BGP Anycast Routing</span>
            <span>•</span>
            <span>Zero Egress Tax</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
