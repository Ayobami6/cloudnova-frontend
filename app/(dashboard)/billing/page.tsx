"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Wallet,
  Download,
  Plus,
  TrendingUp,
  FileText,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { useCloud } from "@/lib/store/cloud-context";

export default function BillingPage() {
  const {
    walletBalance,
    transactions,
    invoices,
    monthlyWholesale,
    monthlyRetail,
    monthlyProfit,
    setIsDepositModalOpen,
  } = useCloud();

  const [activeTab, setActiveTab] = useState<"ledger" | "breakdown" | "invoices">("ledger");
  const [txFilter, setTxFilter] = useState<"all" | "deposit" | "usage_charge" | "domain_purchase">("all");

  const filteredTx = transactions.filter((t) => (txFilter === "all" ? true : t.type === txFilter));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Billing, Invoices & Reseller Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time hourly usage metering, upstream wholesale settlement, and itemized client tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDepositModalOpen(true)}
            className="h-9 px-3.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Deposit Funds</span>
          </button>
        </div>
      </div>

      {/* Top 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736]">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Prepaid Wallet Balance</span>
          <div className="mt-2 text-2xl font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            ${walletBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-500 mt-1 block">Auto-refill enabled (VISA •••• 4242)</span>
        </div>

        <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736]">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Gross Retail Invoiced</span>
          <div className="mt-2 text-2xl font-mono font-semibold text-slate-900 dark:text-slate-100">
            ${monthlyRetail.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-500 mt-1 block">Billed across all tenant sub-accounts</span>
        </div>

        <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736]">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Datacenter Wholesale Base</span>
          <div className="mt-2 text-2xl font-mono font-semibold text-slate-900 dark:text-slate-100">
            ${monthlyWholesale.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-500 mt-1 block">Upstream KVM & transit infrastructure</span>
        </div>

        <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736]">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Net Reseller Margin</span>
          <div className="mt-2 text-2xl font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            +${monthlyProfit.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1 block">Retained in platform wallet</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#232736] pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab("ledger")}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "ledger" ? "bg-blue-600 text-white font-semibold" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Transaction Ledger ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab("breakdown")}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "breakdown" ? "bg-blue-600 text-white font-semibold" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Product Utilization Breakdown
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "invoices" ? "bg-blue-600 text-white font-semibold" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Monthly Invoices ({invoices.length})
        </button>
      </div>

      {/* Tab 1: Transaction Ledger */}
      {activeTab === "ledger" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Filter Event:</span>
            {(["all", "deposit", "usage_charge", "domain_purchase"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTxFilter(f)}
                className={`h-7 px-2.5 rounded text-[11px] capitalize transition-colors ${
                  txFilter === f
                    ? "bg-blue-50 text-blue-600 font-semibold border border-blue-200 dark:bg-[#1E2230] dark:text-blue-400 dark:border-blue-500/40"
                    : "bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900 dark:bg-[#11131A] dark:text-slate-400 dark:border-[#232736] dark:hover:text-slate-200"
                }`}
              >
                {f.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#11131A] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium text-[11px] border-b border-slate-200 dark:border-[#232736]">
                <tr>
                  <th className="py-2.5 px-4">Transaction ID</th>
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4">Event Type</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-right">Amount (USD)</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#232736]">
                {filteredTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-slate-200">{tx.id}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{tx.date}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                        tx.type === "deposit"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-600/20"
                      }`}>
                        {tx.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-slate-200">{tx.description}</td>
                    <td className="py-3 px-4 font-mono text-right">
                      <span className={tx.amount > 0 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-900 dark:text-slate-200"}>
                        {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-1.5 py-0.5 rounded">
                        COMPLETED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Product Utilization Breakdown */}
      {activeTab === "breakdown" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] space-y-2">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">Compute Droplets</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Hourly dynamic KVM CPU & RAM allocation.</p>
            <div className="pt-2 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-500 dark:text-slate-400">Wholesale: $48.00</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Retail: $72.00 (+50%)</span>
            </div>
          </div>

          <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] space-y-2">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">Managed Databases</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">PostgreSQL HA, Redis cache clusters & PITR.</p>
            <div className="pt-2 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-500 dark:text-slate-400">Wholesale: $125.00</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Retail: $187.00 (+50%)</span>
            </div>
          </div>

          <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] space-y-2">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">Storage Fabric (NVMe & S3)</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Network block storage & S3 CDN edge cache.</p>
            <div className="pt-2 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-500 dark:text-slate-400">Wholesale: $162.50</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Retail: $246.00 (+51%)</span>
            </div>
          </div>

          <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] space-y-2">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">Domains & Anycast DNS</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">TLD annual registrations and DNSSEC routing.</p>
            <div className="pt-2 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-500 dark:text-slate-400">Wholesale: $3.83/mo</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Retail: $5.83/mo (+52%)</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Monthly Invoices */}
      {activeTab === "invoices" && (
        <div className="rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#11131A] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium text-[11px] border-b border-slate-200 dark:border-[#232736]">
              <tr>
                <th className="py-2.5 px-4">Invoice #</th>
                <th className="py-2.5 px-4">Billing Period</th>
                <th className="py-2.5 px-4">Due Date</th>
                <th className="py-2.5 px-4">Gross Retail</th>
                <th className="py-2.5 px-4">Wholesale Base</th>
                <th className="py-2.5 px-4">Net Profit</th>
                <th className="py-2.5 px-4 text-right">PDF Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#232736] font-mono text-xs">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-200">{inv.id}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-sans">{inv.period}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-sans">{inv.dueDate}</td>
                  <td className="py-3 px-4 text-slate-900 dark:text-slate-100 font-semibold">${inv.totalRetail.toFixed(2)}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">${inv.totalWholesale.toFixed(2)}</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">+${inv.netProfit.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="h-7 px-2.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] text-slate-700 dark:bg-[#1E2230] dark:hover:bg-[#252B3D] dark:border-[#232736] dark:text-slate-300 inline-flex items-center gap-1 cursor-pointer transition-colors">
                      <Download className="w-3 h-3 text-slate-400" />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
