"use client";

import React, { useState } from "react";
import { X, CreditCard, Building2, Landmark, CheckCircle2, Loader2, AlertCircle, Copy, Check } from "lucide-react";
import { useBilling } from "@/lib/store/billing-context";

type FundingMethod = "card" | "bank_transfer" | "other";
const OTHER_PROVIDERS = ["stripe", "monnify", "bitnob"] as const;

export function DepositModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { virtualAccounts, recordDeposit, provisionPaystackVirtualAccount, startPaystackCheckout } =
    useBilling();

  const [method, setMethod] = useState<FundingMethod>("card");
  const [selectedAmount, setSelectedAmount] = useState<number>(250);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [otherProvider, setOtherProvider] = useState<(typeof OTHER_PROVIDERS)[number]>("stripe");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isProvisioning, setIsProvisioning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const presets = [50, 100, 250, 500, 1000];
  const finalAmount = customAmount && Number(customAmount) > 0 ? Number(customAmount) : selectedAmount;
  const paystackAccount = virtualAccounts.find((a) => a.provider.toLowerCase() === "paystack");

  const handleClose = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    onClose();
  };

  const handleCardCheckout = async () => {
    if (finalAmount <= 0) return;
    setIsProcessing(true);
    setErrorMessage(null);
    const result = await startPaystackCheckout(finalAmount, "NGN");
    setIsProcessing(false);
    if (result.success && result.data) {
      window.location.href = result.data;
    } else {
      setErrorMessage(result.error || "Failed to start Paystack checkout.");
    }
  };

  const handleProvisionDva = async () => {
    setIsProvisioning(true);
    setErrorMessage(null);
    const result = await provisionPaystackVirtualAccount();
    setIsProvisioning(false);
    if (!result.success) {
      setErrorMessage(result.error || "Failed to provision a dedicated account.");
    }
  };

  const handleCopyAccountNumber = () => {
    if (!paystackAccount) return;
    navigator.clipboard
      .writeText(paystackAccount.account_number)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        // Clipboard API unavailable - not fatal, the number is visible on screen.
      });
  };

  const handleOtherDeposit = async () => {
    if (finalAmount <= 0) return;
    setIsProcessing(true);
    setErrorMessage(null);
    const reference = `manual-${otherProvider}-${Date.now()}`;
    const result = await recordDeposit(finalAmount, "USD", otherProvider, reference);
    setIsProcessing(false);
    if (result.success) {
      setSuccessMessage(`Successfully credited $${finalAmount.toFixed(2)} to your prepaid balance.`);
      setTimeout(handleClose, 1500);
    } else {
      setErrorMessage(result.error || "Deposit failed.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] rounded-lg shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Deposit Prepaid Cloud Funds</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Funds are debited hourly based on active VM and storage burn.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-white/[0.06]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMessage ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-2 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{successMessage}</p>
          </div>
        ) : (
          <>
            {/* Funding Method Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod("card")}
                className={`p-3 rounded-md text-xs flex flex-col items-center gap-1.5 transition-colors ${
                  method === "card"
                    ? "bg-blue-50 dark:bg-blue-600/12 text-blue-600 dark:text-blue-400 border border-blue-500"
                    : "bg-slate-50 dark:bg-[#1E2230] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#232736] hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="font-medium">Pay with Card</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod("bank_transfer")}
                className={`p-3 rounded-md text-xs flex flex-col items-center gap-1.5 transition-colors ${
                  method === "bank_transfer"
                    ? "bg-blue-50 dark:bg-blue-600/12 text-blue-600 dark:text-blue-400 border border-blue-500"
                    : "bg-slate-50 dark:bg-[#1E2230] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#232736] hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Landmark className="w-4 h-4" />
                <span className="font-medium">Bank Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod("other")}
                className={`p-3 rounded-md text-xs flex flex-col items-center gap-1.5 transition-colors ${
                  method === "other"
                    ? "bg-blue-50 dark:bg-blue-600/12 text-blue-600 dark:text-blue-400 border border-blue-500"
                    : "bg-slate-50 dark:bg-[#1E2230] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#232736] hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="font-medium">Other</span>
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Pay with Card (Paystack Checkout) */}
            {method === "card" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Select Amount (NGN)</label>
                  <div className="grid grid-cols-5 gap-2">
                    {presets.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(amt);
                          setCustomAmount("");
                        }}
                        className={`h-9 rounded-md text-xs font-mono font-medium transition-colors ${
                          selectedAmount === amt && !customAmount
                            ? "bg-blue-600 text-white font-semibold shadow-sm"
                            : "bg-slate-100 dark:bg-[#1E2230] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#252B3D] border border-slate-200 dark:border-[#232736]"
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Or enter custom amount (NGN)"
                    className="w-full h-9 px-3 rounded-md bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 mt-2"
                  />
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  You&apos;ll be redirected to Paystack&apos;s hosted checkout to complete payment. Your
                  balance is credited automatically once Paystack confirms the charge.
                </p>

                <button
                  onClick={handleCardCheckout}
                  disabled={isProcessing || finalAmount <= 0}
                  className="w-full h-9 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isProcessing ? "Redirecting to Paystack..." : `Pay ₦${finalAmount.toLocaleString()} with Card`}</span>
                </button>
              </div>
            )}

            {/* Bank Transfer (Paystack Dedicated Virtual Account) */}
            {method === "bank_transfer" && (
              <div className="space-y-3">
                {paystackAccount ? (
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">
                        Your Dedicated Account
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-1.5 py-0.5 rounded">
                        {paystackAccount.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Bank Name</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {paystackAccount.bank_name}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Account Number</span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-mono font-semibold text-slate-900 dark:text-slate-100 tracking-wider">
                          {paystackAccount.account_number}
                        </span>
                        <button
                          onClick={handleCopyAccountNumber}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-200 dark:hover:bg-[#1E2230] transition-colors"
                          aria-label="Copy account number"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Account Name</span>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {paystackAccount.account_name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-[#232736]">
                      Transfer any amount to this account. Your prepaid balance is credited automatically
                      within minutes of the transfer clearing.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#11131A] border border-dashed border-slate-300 dark:border-[#33394D] text-center space-y-3">
                    <Landmark className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      You don&apos;t have a dedicated bank transfer account yet. Provision one to get a
                      permanent account number for direct bank transfers.
                    </p>
                    <button
                      onClick={handleProvisionDva}
                      disabled={isProvisioning}
                      className="h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer inline-flex items-center gap-2"
                    >
                      {isProvisioning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{isProvisioning ? "Provisioning..." : "Provision Bank Transfer Account"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Other / Manual Deposit */}
            {method === "other" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Select Deposit Amount (USD)</label>
                  <div className="grid grid-cols-5 gap-2">
                    {presets.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(amt);
                          setCustomAmount("");
                        }}
                        className={`h-9 rounded-md text-xs font-mono font-medium transition-colors ${
                          selectedAmount === amt && !customAmount
                            ? "bg-blue-600 text-white font-semibold shadow-sm"
                            : "bg-slate-100 dark:bg-[#1E2230] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#252B3D] border border-slate-200 dark:border-[#232736]"
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Or enter custom amount ($)"
                    className="w-full h-9 px-3 rounded-md bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 mt-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Provider</label>
                  <select
                    value={otherProvider}
                    onChange={(e) => setOtherProvider(e.target.value as (typeof OTHER_PROVIDERS)[number])}
                    className="w-full h-9 px-3 rounded-md bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {OTHER_PROVIDERS.map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-[#232736] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500">Total charge:</span>
                    <p className="text-base font-mono font-semibold text-slate-900 dark:text-slate-100">${finalAmount.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={handleOtherDeposit}
                    disabled={isProcessing || finalAmount <= 0}
                    className="h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    {isProcessing ? "Settling Funds..." : "Confirm & Deposit"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
