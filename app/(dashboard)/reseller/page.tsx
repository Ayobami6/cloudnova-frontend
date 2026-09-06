"use client";

import React, { useState } from "react";
import {
  Sliders,
  Users,
  Plus,
  TrendingUp,
  DollarSign,
  Calculator,
  ShieldAlert,
  Percent,
} from "lucide-react";
import { useCloud } from "@/lib/store/cloud-context";

export default function ResellerPage() {
  const {
    marginConfig,
    updateMarginConfig,
    clients,
    createClient,
    monthlyWholesale,
    monthlyRetail,
    monthlyProfit,
  } = useCloud();

  // Simulator Sliders State
  const [simDroplets, setSimDroplets] = useState(25);
  const [simDomains, setSimDomains] = useState(40);
  const [simStorageGb, setSimStorageGb] = useState(5000);
  const [simS3Gb, setSimS3Gb] = useState(8000);

  // New Client Modal State
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cCompany, setCCompany] = useState("");
  const [cMarkup, setCMarkup] = useState<number>(35);

  // Simulator calculation
  const simWholesale =
    simDroplets * 16.0 +
    simDomains * (15.0 / 12) +
    simStorageGb * 0.08 +
    simS3Gb * 0.015;

  const simRetail =
    simDroplets * 16.0 * (1 + marginConfig.computeMarkupPercent / 100) +
    simDomains * (15.0 / 12) * (1 + marginConfig.domainsMarkupPercent / 100) +
    simStorageGb * 0.08 * (1 + marginConfig.volumesMarkupPercent / 100) +
    simS3Gb * 0.015 * (1 + marginConfig.s3MarkupPercent / 100);

  const simProfit = simRetail - simWholesale;

  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createClient({
      name: cName,
      email: cEmail,
      company: cCompany || cName,
      balance: 500,
      creditLimit: 3000,
      status: "active",
      customMarkupPercent: cMarkup,
    });
    setIsNewClientOpen(false);
    setCName("");
    setCEmail("");
    setCCompany("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Reseller Margins & Tenant Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure automated wholesale markup rates, manage multi-tenant client sub-accounts, and simulate profits.
          </p>
        </div>

        <button
          onClick={() => setIsNewClientOpen(true)}
          className="h-9 px-3.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client Tenant</span>
        </button>
      </div>

      {/* Financial Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736]">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Gross Billed to Clients</span>
          <div className="mt-2 text-2xl font-semibold font-mono text-slate-900 dark:text-slate-100">
            ${monthlyRetail.toLocaleString()}
            <span className="text-xs text-slate-500 dark:text-slate-400 font-sans font-normal"> / mo</span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">Sum of all retail subscription charges</span>
        </div>

        <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736]">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Datacenter Wholesale Base</span>
          <div className="mt-2 text-2xl font-semibold font-mono text-slate-900 dark:text-slate-100">
            ${monthlyWholesale.toLocaleString()}
            <span className="text-xs text-slate-500 dark:text-slate-400 font-sans font-normal"> / mo</span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">Tier 1 upstream infrastructure cost</span>
        </div>

        <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736]">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Net Retained Profit</span>
          <div className="mt-2 text-2xl font-semibold font-mono text-emerald-600 dark:text-emerald-400">
            +${monthlyProfit.toLocaleString()}
            <span className="text-xs text-slate-500 dark:text-slate-400 font-sans font-normal"> / mo</span>
          </div>
          <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1 block font-medium">Retained directly in platform wallet</span>
        </div>
      </div>

      {/* Markup Multipliers Section */}
      <div className="p-6 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#232736]">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Percent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Wholesale Markup Multipliers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live updates applied automatically to new provisioned droplets, storage, and domain registrations.
            </p>
          </div>
        </div>

        {/* Global Markup Presets */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Global Base Resale Markup</label>
          <div className="flex items-center gap-2">
            {[5, 20, 35, 50, 100].map((rate) => (
              <button
                key={rate}
                onClick={() => updateMarginConfig({ globalMarkupPercent: rate })}
                className={`h-8 px-3 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                  marginConfig.globalMarkupPercent === rate
                    ? "bg-blue-600 text-white font-semibold shadow-sm"
                    : "bg-slate-100 dark:bg-[#11131A] text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-[#232736]"
                }`}
              >
                +{rate}%
              </button>
            ))}
          </div>
        </div>

        {/* Granular Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2 p-4 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736]">
            <div className="flex items-center justify-between text-xs font-medium text-slate-800 dark:text-slate-200">
              <span>Compute Droplets Markup</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">+{marginConfig.computeMarkupPercent}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={150}
              value={marginConfig.computeMarkupPercent}
              onChange={(e) => updateMarginConfig({ computeMarkupPercent: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="space-y-2 p-4 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736]">
            <div className="flex items-center justify-between text-xs font-medium text-slate-800 dark:text-slate-200">
              <span>Domain Names Markup</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">+{marginConfig.domainsMarkupPercent}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={150}
              value={marginConfig.domainsMarkupPercent}
              onChange={(e) => updateMarginConfig({ domainsMarkupPercent: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="space-y-2 p-4 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736]">
            <div className="flex items-center justify-between text-xs font-medium text-slate-800 dark:text-slate-200">
              <span>NVMe Block Storage Markup</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">+{marginConfig.volumesMarkupPercent}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={150}
              value={marginConfig.volumesMarkupPercent}
              onChange={(e) => updateMarginConfig({ volumesMarkupPercent: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="space-y-2 p-4 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736]">
            <div className="flex items-center justify-between text-xs font-medium text-slate-800 dark:text-slate-200">
              <span>S3 Object Storage Markup</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">+{marginConfig.s3MarkupPercent}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={150}
              value={marginConfig.s3MarkupPercent}
              onChange={(e) => updateMarginConfig({ s3MarkupPercent: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Interactive Reseller Profit Simulator */}
      <div className="p-6 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#232736]">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-500" />
              Interactive Reseller Profit Simulator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Simulate your monthly net margins as you onboard customer workloads.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500 uppercase font-medium">Projected Net Monthly Profit</span>
            <div className="text-xl font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              +${simProfit.toFixed(2)}/mo
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] rounded space-y-1">
            <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
              <span>Droplets</span>
              <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{simDroplets}</span>
            </div>
            <input
              type="range"
              min={1}
              max={200}
              value={simDroplets}
              onChange={(e) => setSimDroplets(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] rounded space-y-1">
            <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
              <span>Domains</span>
              <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{simDomains}</span>
            </div>
            <input
              type="range"
              min={1}
              max={300}
              value={simDomains}
              onChange={(e) => setSimDomains(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] rounded space-y-1">
            <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
              <span>NVMe Storage</span>
              <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{simStorageGb} GB</span>
            </div>
            <input
              type="range"
              min={100}
              max={50000}
              step={500}
              value={simStorageGb}
              onChange={(e) => setSimStorageGb(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] rounded space-y-1">
            <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
              <span>S3 Storage</span>
              <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{simS3Gb} GB</span>
            </div>
            <input
              type="range"
              min={100}
              max={100000}
              step={1000}
              value={simS3Gb}
              onChange={(e) => setSimS3Gb(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Client Tenants Directory */}
      <div className="rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-[#232736] flex items-center justify-between bg-slate-50 dark:bg-[#11131A]">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Client Sub-Account Directory</h3>
          <span className="text-xs text-slate-500">{clients.length} active tenants</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-[#11131A] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium text-[11px] border-b border-slate-200 dark:border-[#232736]">
            <tr>
              <th className="py-2.5 px-4">Client / Company</th>
              <th className="py-2.5 px-4">Contact Email</th>
              <th className="py-2.5 px-4">Tenant Balance</th>
              <th className="py-2.5 px-4">Active Resources</th>
              <th className="py-2.5 px-4">Custom Markup Override</th>
              <th className="py-2.5 px-4">Monthly Spend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-[#232736]">
            {clients.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/75 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4">
                  <span className="font-semibold text-slate-900 dark:text-slate-200 block">{c.company}</span>
                  <span className="text-[11px] text-slate-500">{c.name}</span>
                </td>
                <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{c.email}</td>
                <td className="py-3 px-4 font-mono">
                  <span className="text-slate-900 dark:text-slate-200 font-medium block">${c.balance.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500">Limit: ${c.creditLimit}</span>
                </td>
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{c.activeResourcesCount} assets</td>
                <td className="py-3 px-4 font-mono text-blue-600 dark:text-blue-400 font-medium">
                  {c.customMarkupPercent ? `+${c.customMarkupPercent}%` : "Default (35%)"}
                </td>
                <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  ${c.monthlySpend.toFixed(2)}/mo
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Client Modal */}
      {isNewClientOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] rounded-lg shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Add Multi-Tenant Client</h3>
            <form onSubmit={handleAddClientSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Company Name</label>
                <input
                  type="text"
                  value={cCompany}
                  onChange={(e) => setCCompany(e.target.value)}
                  className="w-full h-9 px-3 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Primary Contact Name</label>
                <input
                  type="text"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="w-full h-9 px-3 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Billing Email</label>
                <input
                  type="email"
                  value={cEmail}
                  onChange={(e) => setCEmail(e.target.value)}
                  className="w-full h-9 px-3 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Custom Markup Override (%)</label>
                <input
                  type="number"
                  value={cMarkup}
                  onChange={(e) => setCMarkup(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewClientOpen(false)}
                  className="h-8 px-3.5 rounded-md bg-slate-100 dark:bg-[#1E2230] border border-slate-200 dark:border-[#232736] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#252B3D] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-sm"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
