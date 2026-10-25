"use client";

import React, { useState } from "react";
import { useBilling } from "@/lib/store/billing-context";
import {
  MaterialIcon,
  PastelTypePill,
  StatusIndicator,
} from "@/components/ui/material-icon";
import {
  PastelKpiCard,
  SegmentedPillTabs,
} from "@/components/ui/bento-primitives";

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
    walletBalance,
    setIsDepositModalOpen,
    switchCurrency,
    generateInvoice,
  } = useBilling();

  const [activeTab, setActiveTab] = useState<"ledger" | "breakdown" | "invoices">("ledger");
  const [txFilter, setTxFilter] = useState<
    "all" | "deposit" | "usage_charge" | "domain_purchase" | "refund"
  >("all");
  const [isSwitchingCurrency, setIsSwitchingCurrency] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const filteredTx = transactions.filter((t) =>
    txFilter === "all" ? true : t.type === txFilter
  );
  const paystackAccount = virtualAccounts.find(
    (a) => a.provider.toLowerCase() === "paystack"
  );
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
    <div className="space-y-5">
      {/* Top 3 Pastel KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PastelKpiCard
          label="Prepaid Cloud Balance"
          value={
            isLoading
              ? "..."
              : `${currency} ${walletBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}`
          }
          subtitle={`Account ${balance?.account_number || "Active"}`}
          variant="lavender"
          actionLabel="Deposit"
          onAction={() => setIsDepositModalOpen(true)}
        />
        <PastelKpiCard
          label="Current Month Incurred"
          value={
            usage
              ? `${usage.currency} ${Number(usage.accrued_usage_amount).toLocaleString()}`
              : `${currency} 0.00`
          }
          subtitle={`Period ${usage?.billing_period || currentPeriod()}`}
          variant="blue"
          actionLabel="Check"
          onAction={() => setActiveTab("breakdown")}
        />
        <PastelKpiCard
          label="Projected Month-End"
          value={
            usage
              ? `${usage.currency} ${Number(usage.projected_month_end_amount).toLocaleString()}`
              : `${currency} 0.00`
          }
          subtitle={
            usage
              ? `Burn: ${usage.currency} ${Number(usage.hourly_burn_rate).toFixed(3)}/hr`
              : "Zero-overdraft ledger"
          }
          variant="yellow"
          actionLabel="Invoices"
          onAction={() => setActiveTab("invoices")}
        />
      </div>

      {/* Controls & Dedicated Virtual Account Bar */}
      <div className="nixtio-card p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedPillTabs
            value={activeTab}
            onChange={setActiveTab}
            options={[
              { id: "ledger", label: "Transaction Ledger", badge: transactions.length },
              { id: "breakdown", label: "Usage Breakdown" },
              { id: "invoices", label: "Invoices", badge: invoices.length },
            ]}
          />

          {paystackAccount && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFECE8] dark:bg-[#232834] text-xs">
              <MaterialIcon name="account_balance" size={15} />
              <span className="font-mono font-semibold">
                {paystackAccount.account_number}
              </span>
              <span className="text-[#8C8B87]">({paystackAccount.bank_name})</span>
              <button
                type="button"
                onClick={handleCopyAccount}
                className="text-[#1E1E1E] dark:text-white cursor-pointer"
              >
                <MaterialIcon
                  name={copiedAccount ? "check" : "content_copy"}
                  size={14}
                />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSwitchCurrency}
            disabled={isSwitchingCurrency}
            className="h-9 px-4 rounded-full bg-[#EFECE8] dark:bg-[#232834] hover:bg-[#CFE0EC] text-xs font-medium text-[#1E1E1E] dark:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <MaterialIcon name="currency_exchange" size={16} />
            <span>Switch to {currency === "USD" ? "NGN" : "USD"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDepositModalOpen(true)}
            className="h-9 px-4 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:hover:bg-slate-200 dark:text-[#1E1E1E] text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MaterialIcon name="add" size={16} />
            <span>Deposit Funds</span>
          </button>
        </div>
      </div>

      {(loadError || actionError) && (
        <div className="nixtio-card p-4 border border-[#D94E4E]/30 text-xs text-[#D94E4E] flex items-center gap-2">
          <MaterialIcon name="error" size={18} />
          <span>{loadError || actionError}</span>
        </div>
      )}

      {/* Tab 1: Floating Row Transaction Ledger */}
      {activeTab === "ledger" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 px-1">
            <span className="text-xs text-[#8C8B87]">Filter Event:</span>
            {(
              ["all", "deposit", "usage_charge", "domain_purchase", "refund"] as const
            ).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setTxFilter(f)}
                className={`h-7 px-3 rounded-full text-[11px] font-medium capitalize transition-colors cursor-pointer ${
                  txFilter === f
                    ? "bg-[#222222] text-white dark:bg-white dark:text-[#1E1E1E]"
                    : "bg-white dark:bg-[#1C2029] text-[#5A5A58] hover:text-[#1E1E1E] dark:text-slate-300"
                }`}
              >
                {f.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-12 items-center px-4 py-1.5 text-xs font-medium text-[#5A5A58] dark:text-slate-400">
            <div className="col-span-3">Type</div>
            <div className="col-span-4">Description</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3 text-right">Amount & Date</div>
          </div>

          {filteredTx.length === 0 ? (
            <div className="nixtio-card p-8 text-center text-xs text-[#8C8B87]">
              {isLoading ? "Loading transactions..." : "No transactions recorded yet."}
            </div>
          ) : (
            filteredTx.map((tx) => {
              const amount = Number(tx.amount);
              const isCredit = amount > 0 || tx.type === "deposit";
              return (
                <div
                  key={tx.id}
                  className="nixtio-floating-row grid grid-cols-12 items-center px-4 py-3 text-xs gap-2"
                >
                  <div className="col-span-3 flex items-center gap-2.5">
                    <PastelTypePill
                      icon={isCredit ? "call_received" : "bolt"}
                      label={tx.type.replace("_", " ")}
                      variant={isCredit ? "yellow" : "lavender"}
                      size="sm"
                    />
                  </div>
                  <div className="col-span-4 truncate font-medium text-[#1E1E1E] dark:text-white">
                    {tx.description}
                    <span className="block text-[10px] font-mono text-[#8C8B87]">
                      #{tx.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <StatusIndicator
                      status={tx.status === "completed" ? "completed" : "pending"}
                      label={tx.status}
                    />
                  </div>
                  <div className="col-span-3 text-right">
                    <span
                      className={`font-mono font-semibold block ${
                        isCredit ? "text-[#4EA871]" : "text-[#1E1E1E] dark:text-white"
                      }`}
                    >
                      {isCredit
                        ? `+${tx.currency} ${Math.abs(amount).toFixed(2)}`
                        : `-${tx.currency} ${Math.abs(amount).toFixed(2)}`}
                    </span>
                    <span className="text-[10px] text-[#8C8B87]">
                      {new Date(tx.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Resource Usage Breakdown */}
      {activeTab === "breakdown" && (
        <div className="space-y-3">
          {(!usage || usage.resources.length === 0) && (
            <div className="nixtio-card p-8 text-center text-xs text-[#8C8B87]">
              No metered resources for the current billing period yet.
            </div>
          )}
          {usage?.resources.map((r) => (
            <div
              key={r.resource_id}
              className="nixtio-floating-row p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <PastelTypePill
                  icon="dns"
                  label={r.resource_type}
                  variant="blue"
                  size="sm"
                />
                <div>
                  <span className="text-xs font-semibold text-[#1E1E1E] dark:text-white">
                    {r.resource_name}
                  </span>
                  <p className="text-[11px] text-[#8C8B87]">
                    {r.status} • {Number(r.hours_run_this_month).toFixed(1)}h this month
                  </p>
                </div>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="text-[#1E1E1E] dark:text-white font-semibold">
                  {r.currency} {Number(r.accrued_cost).toFixed(2)}
                </span>
                <p className="text-[10px] text-[#8C8B87]">
                  {r.currency} {Number(r.hourly_rate).toFixed(4)}/hr
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Invoices */}
      {activeTab === "invoices" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGenerateInvoice}
              disabled={isGeneratingInvoice}
              className="h-9 px-4 rounded-full bg-[#222222] text-white dark:bg-white dark:text-[#1E1E1E] text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <MaterialIcon name="receipt_long" size={16} />
              <span>Generate Invoice for {currentPeriod()}</span>
            </button>
          </div>

          {invoices.length === 0 ? (
            <div className="nixtio-card p-8 text-center text-xs text-[#8C8B87]">
              No invoices generated yet.
            </div>
          ) : (
            invoices.map((inv) => (
              <div
                key={inv.id}
                className="nixtio-floating-row px-4 py-3.5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <PastelTypePill
                    icon="description"
                    label={inv.period}
                    variant="yellow"
                    size="sm"
                  />
                  <div>
                    <span className="font-mono font-semibold text-[#1E1E1E] dark:text-white">
                      #{inv.id.slice(0, 8)}
                    </span>
                    <span className="block text-[11px] text-[#8C8B87]">
                      Due {new Date(inv.due_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <StatusIndicator
                  status={inv.status === "paid" ? "completed" : "pending"}
                  label={inv.status.toUpperCase()}
                />

                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold">
                    {inv.currency} {Number(inv.total_retail).toFixed(2)}
                  </span>
                  {inv.pdf_url && (
                    <a
                      href={inv.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-full bg-[#EFECE8] dark:bg-[#232834] text-xs font-medium inline-flex items-center gap-1"
                    >
                      <MaterialIcon name="download" size={14} />
                      <span>PDF</span>
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
