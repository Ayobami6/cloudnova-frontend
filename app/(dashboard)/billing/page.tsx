"use client";

import React, { useState } from "react";
import {
  Landmark,
  Download,
  Plus,
  FileText,
  RefreshCw,
  Loader2,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { useBilling } from "@/lib/store/billing-context";

function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function BillingPage() {
  const {
    isLoading,
    loadError,
    balance,
    usage,
    transactions,
    invoices,
    virtualAccounts,
    marginConfig,
    walletBalance,
    setIsDepositModalOpen,
    switchCurrency,
    generateInvoice,
  } = useBilling();

  const [activeTab, setActiveTab] = useState<"ledger" | "breakdown" | "invoices">("ledger");
  const [txFilter, setTxFilter] = useState<"all" | "deposit" | "usage_charge" | "domain_purchase" | "refund">(
    "all"
  );
  const [isSwitchingCurrency, setIsSwitchingCurrency] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const filteredTx = transactions.filter((t) => (txFilter === "all" ? true : t.type === txFilter));
  const paystackAccount = virtualAccounts.find((a) => a.provider.toLowerCase() === "paystack");
  const currency = balance?.currency || "USD";

  const handleSwitchCurrency = async () => {
    const next = currency === "USD" ? "NGN" : "USD";
    setIsSwitchingCurrency(true);
    setActionError(null);
    const result = await switchCurrency(next);
    setIsSwitchingCurrency(false);
    if (!result.success) setActionError(result.error || "Failed to switch currency.");
  };

  const handleGenerateInvoice = async () => {
    setIsGeneratingInvoice(true);
    setActionError(null);
    const result = await generateInvoice(currentPeriod());
    setIsGeneratingInvoice(false);
    if (!result.success) setActionError(result.error || "Failed to generate invoice.");
  };

  const handleCopyAccount = () => {
    if (!paystackAccount) return;
    navigator.clipboard
      .writeText(paystackAccount.account_number)
      .then(() => {
        setCopiedAccount(true);
        setTimeout(() => setCopiedAccount(false), 1500);
      })
      .catch(() => {});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Billing, Usage & Invoices
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time resource metering, hourly prepaid balance drawdowns, and itemized invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSwitchCurrency}
            disabled={isSwitchingCurrency}
            className="h-9 px-3.5 rounded-md bg-slate-100 dark:bg-[#1E2230] hover:bg-slate-200 dark:hover:bg-[#252B3D] border border-slate-200 dark:border-[#232736] text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSwitchingCurrency ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>Switch to {currency === "USD" ? "NGN" : "USD"}</span>
          </button>
          <button
            onClick={() => setIsDepositModalOpen(true)}
            className="h-9 px-3.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Deposit Funds</span>
          </button>
        </div>
      </div>

      {loadError && (
        <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736]">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Prepaid Cloud Balance</span>
          <div className="mt-2 text-2xl font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            {isLoading ? "..." : `${currency} ${walletBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-500 mt-1 block">
            Account {balance?.account_number || "—"}
          </span>
        </div>

        <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736]">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Current Month Incurred</span>
          <div className="mt-2 text-2xl font-mono font-semibold text-slate-900 dark:text-slate-100">
            {usage ? `${usage.currency} ${Number(usage.accrued_usage_amount).toLocaleString()}` : "—"}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-500 mt-1 block">
            Accrued across all running resources ({usage?.billing_period || "—"})
          </span>
        </div>

        <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736]">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Projected Month-End</span>
          <div className="mt-2 text-2xl font-mono font-semibold text-slate-900 dark:text-slate-100">
            {usage ? `${usage.currency} ${Number(usage.projected_month_end_amount).toLocaleString()}` : "—"}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-500 mt-1 block">
            Burn rate: {usage ? `${usage.currency} ${Number(usage.hourly_burn_rate).toFixed(3)}/hr` : "—"}
          </span>
        </div>

        <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736]">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5" /> Bank Transfer Account
          </span>
          {paystackAccount ? (
            <div className="mt-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {paystackAccount.account_number}
                </span>
                <button onClick={handleCopyAccount} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                  {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-500 mt-1 block">{paystackAccount.bank_name}</span>
            </div>
          ) : (
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Set up dedicated account →
            </button>
          )}
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
          Resource Usage Breakdown
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
            {(["all", "deposit", "usage_charge", "domain_purchase", "refund"] as const).map((f) => (
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

          <div className="rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] overflow-hidden shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#11131A] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium text-[11px] border-b border-slate-200 dark:border-[#232736]">
                <tr>
                  <th className="py-2.5 px-4">Transaction ID</th>
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4">Event Type</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#232736]">
                {filteredTx.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-slate-400 dark:text-slate-500">
                      {isLoading ? "Loading transactions..." : "No transactions yet."}
                    </td>
                  </tr>
                )}
                {filteredTx.map((tx) => {
                  const amount = Number(tx.amount);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-slate-200">{tx.id.slice(0, 8)}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {new Date(tx.date).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                            tx.type === "deposit"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                              : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-600/20"
                          }`}
                        >
                          {tx.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-slate-200">{tx.description}</td>
                      <td className="py-3 px-4 font-mono text-right">
                        <span className={amount > 0 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-900 dark:text-slate-200"}>
                          {amount > 0 ? `+${tx.currency} ${amount.toFixed(2)}` : `-${tx.currency} ${Math.abs(amount).toFixed(2)}`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-1.5 py-0.5 rounded">
                          {tx.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Real Resource Usage Breakdown */}
      {activeTab === "breakdown" && (
        <div className="space-y-3">
          {(!usage || usage.resources.length === 0) && (
            <div className="p-5 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] text-center text-xs text-slate-500 dark:text-slate-400">
              No metered resources for the current billing period yet.
            </div>
          )}
          {usage?.resources.map((r) => (
            <div
              key={r.resource_id}
              className="p-4 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">{r.resource_name}</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {r.resource_type} • {r.status} • {Number(r.hours_run_this_month).toFixed(1)}h this month
                </p>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">
                  {r.currency} {Number(r.accrued_cost).toFixed(2)}
                </span>
                <p className="text-[10px] text-slate-400">{r.currency} {Number(r.hourly_rate).toFixed(4)}/hr</p>
              </div>
            </div>
          ))}

          {marginConfig && (
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] mt-4">
              <span className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">
                Platform Reseller Margins
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-2 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Global</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{marginConfig.global_markup_percent}%</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Compute</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{marginConfig.compute_markup_percent}%</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Database</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{marginConfig.database_markup_percent}%</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Storage</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{marginConfig.storage_markup_percent}%</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Domains</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{marginConfig.domains_markup_percent}%</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                Platform-wide markups (read-only here; updated by platform administrators).
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Monthly Invoices */}
      {activeTab === "invoices" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={handleGenerateInvoice}
              disabled={isGeneratingInvoice}
              className="h-8 px-3 rounded-md bg-slate-100 dark:bg-[#1E2230] hover:bg-slate-200 dark:hover:bg-[#252B3D] border border-slate-200 dark:border-[#232736] text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isGeneratingInvoice ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              <span>Generate Invoice for {currentPeriod()}</span>
            </button>
          </div>

          <div className="rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] overflow-hidden shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#11131A] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium text-[11px] border-b border-slate-200 dark:border-[#232736]">
                <tr>
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-4">Billing Period</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4">Total Invoiced</th>
                  <th className="py-2.5 px-4">Payment Status</th>
                  <th className="py-2.5 px-4 text-right">Receipt / PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#232736] font-mono text-xs">
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-slate-400 dark:text-slate-500 font-sans">
                      {isLoading ? "Loading invoices..." : "No invoices generated yet."}
                    </td>
                  </tr>
                )}
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-200">{inv.id.slice(0, 8)}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-sans">{inv.period}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-sans">
                      {new Date(inv.due_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-slate-100 font-semibold">
                      {inv.currency} {Number(inv.total_retail).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          inv.status === "paid"
                            ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
                            : "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20"
                        }`}
                      >
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {inv.pdf_url ? (
                        <a
                          href={inv.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="h-7 px-2.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] text-slate-700 dark:bg-[#1E2230] dark:hover:bg-[#252B3D] dark:border-[#232736] dark:text-slate-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Download className="w-3 h-3 text-slate-400" />
                          <span>Download PDF</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-sans">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
