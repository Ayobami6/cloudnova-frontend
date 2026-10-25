"use client";

import React from "react";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-icon";

export function LandingFooter() {
  return (
    <footer className="bg-[#F6F6F4] dark:bg-[#0F1115] border-t border-[#E7E4DF] dark:border-[#282D3A] pt-16 pb-12 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12">
          {/* Col 1: Brand */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#CFE0EC] flex items-center justify-center text-[#222222] shadow-2xs">
                <MaterialIcon name="cloud_done" size={18} />
              </div>
              <span className="font-semibold text-base tracking-tight text-[#1E1E1E] dark:text-white">
                TibiCloud
              </span>
            </Link>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Developer-first cloud infrastructure for African tech teams. Spin up high-performance KVM compute, managed databases, and NVMe block storage with seamless Naira bank transfers and 0% foreign card fees.
            </p>
          </div>

          {/* Col 2: Products */}
          <div className="space-y-3 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[#1E1E1E] dark:text-white font-mono text-[11px]">
              Products
            </span>
            <ul className="space-y-2 text-[#8C8B87] dark:text-slate-400">
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
                <a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Naira Pricing Calculator
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Payment Rails */}
          <div className="space-y-3 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[#1E1E1E] dark:text-white font-mono text-[11px]">
              Payment Rails
            </span>
            <ul className="space-y-2 text-[#8C8B87] dark:text-slate-400">
              <li>
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Dedicated NUBAN Accounts
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Instant Bank Transfers
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Paystack & Monnify Checkout
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Verve & Nigerian Cards
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Zero FX Volatility Surcharge
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Company */}
          <div className="space-y-3 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[#1E1E1E] dark:text-white font-mono text-[11px]">
              Company & Legal
            </span>
            <ul className="space-y-2 text-[#8C8B87] dark:text-slate-400">
              <li>
                <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                  About TibiCloud
                </span>
              </li>
              <li>
                <a href="#faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Developer FAQ
                </a>
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
        <div className="pt-8 border-t border-[#E7E4DF] dark:border-[#282D3A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TibiCloud Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Lagos & Global</span>
            <span>•</span>
            <span>Naira (NGN) Billing</span>
            <span>•</span>
            <span>Zero Egress Tax</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
