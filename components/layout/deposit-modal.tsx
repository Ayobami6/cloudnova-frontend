"use client";

import React, { useState } from "react";
import { useBilling } from "@/lib/store/billing-context";
import * as billingApi from "@/lib/api/billing";
import type { CryptoDepositInitializeResponse } from "@/lib/api/types";
import { MaterialIcon, PastelTypePill } from "@/components/ui/material-icon";

type FundingMethod = "card" | "bank_transfer" | "crypto" | "other";
const OTHER_PROVIDERS = ["stripe", "monnify", "bitnob"] as const;
const CRYPTO_CURRENCIES = [
  { label: "USDT (TRC20)", value: "usdttrc20" },
  { label: "USDT (ERC20)", value: "usdterc20" },
  { label: "Bitcoin (BTC)", value: "btc" },
  { label: "Ethereum (ETH)", value: "eth" },
  { label: "Solana (SOL)", value: "sol" },
] as const;

interface PaymentMethodConfig {
  id: FundingMethod;
  label: string;
  sublabel?: string;
  icon: string;
}

const PAYMENT_METHODS: PaymentMethodConfig[] = [
  { id: "card", label: "Card", sublabel: "(Paystack)", icon: "credit_card" },
  { id: "bank_transfer", label: "Bank Transfer", icon: "account_balance" },
  { id: "crypto", label: "Crypto", icon: "currency_bitcoin" },
  { id: "other", label: "Other", icon: "payments" },
];

export function DepositModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    virtualAccounts,
    recordDeposit,
    provisionPaystackVirtualAccount,
    startPaystackCheckout,
    currency,
    currencySymbol,
  } = useBilling();

  const [method, setMethod] = useState<FundingMethod>("card");
  const [selectedAmount, setSelectedAmount] = useState<number>(currency === "NGN" ? 50000 : 100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [cryptoCurrency, setCryptoCurrency] = useState<string>("usdttrc20");
  const [cryptoSession, setCryptoSession] = useState<CryptoDepositInitializeResponse | null>(null);
  const [otherProvider, setOtherProvider] = useState<(typeof OTHER_PROVIDERS)[number]>("stripe");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isProvisioning, setIsProvisioning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const presets =
    currency === "NGN"
      ? [20000, 50000, 100000, 250000, 500000]
      : [50, 100, 250, 500, 1000];
  const finalAmount = customAmount && Number(customAmount) > 0 ? Number(customAmount) : selectedAmount;
  const paystackAccount = virtualAccounts.find((a) => a.provider.toLowerCase() === "paystack");

  const handleClose = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setCryptoSession(null);
    onClose();
  };

  const handleCardCheckout = async () => {
    if (finalAmount <= 0) return;
    setIsProcessing(true);
    setErrorMessage(null);
    const result = await startPaystackCheckout(finalAmount, currency);
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

  const handleCopyText = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };

  const handleInitCrypto = async () => {
    if (finalAmount <= 0) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const session = await billingApi.initializeCryptoDeposit({
        amount: finalAmount,
        price_currency: currency,
        pay_currency: cryptoCurrency,
      });
      setCryptoSession(session);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to initialize crypto payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOtherDeposit = async () => {
    if (finalAmount <= 0) return;
    setIsProcessing(true);
    setErrorMessage(null);
    const reference = `manual-${otherProvider}-${Date.now()}`;
    const result = await recordDeposit(finalAmount, currency, otherProvider, reference);
    setIsProcessing(false);
    if (result.success) {
      setSuccessMessage(`Successfully credited ${currencySymbol}${finalAmount.toLocaleString()} to your prepaid balance.`);
      setTimeout(handleClose, 1500);
    } else {
      setErrorMessage(result.error || "Deposit failed.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-white dark:bg-[#1C2029] border-b border-[#E7E4DF] dark:border-[#282D3A] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-[#CFE0EC] dark:bg-[#CFE0EC]/20 text-[#1E1E1E] dark:text-[#E2EEF7] flex items-center justify-center shrink-0">
              <MaterialIcon name="account_balance_wallet" size={20} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[#1E1E1E] dark:text-white font-display">
                Deposit Prepaid Cloud Funds
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-[#8C8B87]">Current Billing Currency:</span>
                <PastelTypePill
                  icon="payments"
                  label={`${currency} (${currencySymbol})`}
                  variant="blue"
                  size="sm"
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#F6F6F4] dark:bg-[#232834] text-[#5A5A58] hover:text-[#1E1E1E] dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors border border-[#E7E4DF] dark:border-[#282D3A]"
            aria-label="Close modal"
          >
            <MaterialIcon name="close" size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 bg-[#F6F6F4] dark:bg-[#161920] overflow-y-auto max-h-[calc(88vh-80px)]">
          {successMessage ? (
            <div className="py-10 flex flex-col items-center justify-center space-y-3 text-center">
              <span className="w-12 h-12 rounded-full bg-[#4EA871]/15 text-[#4EA871] dark:text-[#56B87C] flex items-center justify-center">
                <MaterialIcon name="check_circle" size={28} />
              </span>
              <p className="text-sm font-medium text-[#1E1E1E] dark:text-slate-200">
                {successMessage}
              </p>
            </div>
          ) : (
            <>
              {/* Funding Method 4-Card Selector */}
              <div className="grid grid-cols-4 gap-2.5">
                {PAYMENT_METHODS.map((pm) => {
                  const isActive = method === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => {
                        setMethod(pm.id);
                        setCryptoSession(null);
                      }}
                      className={`p-3 rounded-[16px] text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer font-medium ${
                        isActive
                          ? "bg-[#222222] text-white dark:bg-white dark:text-[#1E1E1E] shadow-xs"
                          : "bg-white dark:bg-[#1C2029] text-[#5A5A58] dark:text-slate-400 border border-[#E7E4DF] dark:border-[#282D3A] hover:border-[#D5D0C8] dark:hover:border-[#383F52] hover:text-[#1E1E1E] dark:hover:text-white"
                      }`}
                    >
                      <MaterialIcon name={pm.icon} size={20} />
                      <div className="text-center leading-tight">
                        <span className="block text-[11px] font-medium">{pm.label}</span>
                        {pm.sublabel && (
                          <span className={`block text-[10px] ${isActive ? "opacity-75" : "text-[#8C8B87]"}`}>
                            {pm.sublabel}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Error Callout */}
              {errorMessage && (
                <div className="p-3.5 rounded-[16px] bg-[#D94E4E]/10 border border-[#D94E4E]/30 text-xs text-[#D94E4E] dark:text-[#EF6363] flex items-center gap-2.5">
                  <MaterialIcon name="error" size={18} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Method 1: Card (Paystack Checkout) */}
              {method === "card" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#5A5A58] dark:text-slate-300">
                      Select Amount ({currency})
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {presets.map((amt) => {
                        const isAmtSelected = selectedAmount === amt && !customAmount;
                        return (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => {
                              setSelectedAmount(amt);
                              setCustomAmount("");
                            }}
                            className={`h-10 rounded-[14px] text-xs font-mono font-medium transition-all cursor-pointer ${
                              isAmtSelected
                                ? "bg-[#222222] text-white dark:bg-white dark:text-[#1E1E1E] font-semibold shadow-xs"
                                : "bg-white dark:bg-[#1C2029] text-[#5A5A58] dark:text-slate-300 border border-[#E7E4DF] dark:border-[#282D3A] hover:bg-[#EFECE8] dark:hover:bg-[#232834]"
                            }`}
                          >
                            {currencySymbol}{amt.toLocaleString()}
                          </button>
                        );
                      })}
                    </div>
                    <div className="relative mt-2">
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder={`Or enter custom amount (${currencySymbol})`}
                        className="w-full h-10 px-4 rounded-[14px] bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-mono text-[#1E1E1E] dark:text-white placeholder:text-[#8C8B87] dark:placeholder:text-slate-500 focus:outline-none focus:border-[#222222] dark:focus:border-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-[16px] bg-[#EFECE8] dark:bg-[#232834]/60 border border-[#E7E4DF] dark:border-[#282D3A] text-[11px] text-[#5A5A58] dark:text-slate-400 flex items-start gap-2.5">
                    <MaterialIcon name="info" size={16} className="text-[#8C8B87] shrink-0 mt-0.5" />
                    <span>
                      Redirects to Paystack secured checkout. Your balance is credited automatically once payment is confirmed.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCardCheckout}
                    disabled={isProcessing || finalAmount <= 0}
                    className="w-full h-11 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:text-[#1E1E1E] dark:hover:bg-slate-100 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isProcessing && <MaterialIcon name="progress_activity" size={16} className="animate-spin" />}
                    <span>
                      {isProcessing
                        ? "Redirecting to Paystack..."
                        : `Pay ${currencySymbol}${finalAmount.toLocaleString()} with Card`}
                    </span>
                  </button>
                </div>
              )}

              {/* Method 2: Bank Transfer (DVA) */}
              {method === "bank_transfer" && (
                <div className="space-y-4">
                  {paystackAccount ? (
                    <div className="p-5 rounded-[22px] bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] space-y-3.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-[#8C8B87] dark:text-slate-400 font-medium">
                          Your Dedicated Virtual Account (NUBAN)
                        </span>
                        <PastelTypePill
                          icon={paystackAccount.is_active ? "check_circle" : "cancel"}
                          label={paystackAccount.is_active ? "ACTIVE" : "INACTIVE"}
                          variant={paystackAccount.is_active ? "sage" : "sand"}
                          size="sm"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-[#8C8B87] dark:text-slate-400 block">Bank Name</span>
                        <span className="text-sm font-semibold text-[#1E1E1E] dark:text-white">
                          {paystackAccount.bank_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#8C8B87] dark:text-slate-400 block">Account Number</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-base font-mono font-semibold text-[#1E1E1E] dark:text-white tracking-wider">
                            {paystackAccount.account_number}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(paystackAccount.account_number)}
                            className="w-8 h-8 rounded-full bg-[#F6F6F4] dark:bg-[#232834] text-[#5A5A58] hover:text-[#1E1E1E] dark:hover:text-white flex items-center justify-center transition-colors border border-[#E7E4DF] dark:border-[#282D3A] cursor-pointer"
                            aria-label="Copy account number"
                          >
                            <MaterialIcon
                              name={copied ? "check" : "content_copy"}
                              size={15}
                              className={copied ? "text-[#4EA871]" : ""}
                            />
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#8C8B87] dark:text-slate-400 block">Account Name</span>
                        <span className="text-sm font-medium text-[#1E1E1E] dark:text-slate-200">
                          {paystackAccount.account_name}
                        </span>
                      </div>
                      <div className="p-3 rounded-[16px] bg-[#EFECE8] dark:bg-[#232834]/60 border border-[#E7E4DF] dark:border-[#282D3A] text-[11px] text-[#5A5A58] dark:text-slate-400 flex items-start gap-2.5">
                        <MaterialIcon name="info" size={16} className="text-[#8C8B87] shrink-0 mt-0.5" />
                        <span>
                          Transfer from any Nigerian banking app. Your prepaid wallet will be credited automatically within minutes.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-[22px] bg-white dark:bg-[#1C2029] border border-dashed border-[#D5D0C8] dark:border-[#383F52] text-center space-y-3">
                      <span className="w-12 h-12 rounded-full bg-[#CFE0EC] dark:bg-[#CFE0EC]/20 text-[#1E1E1E] dark:text-[#E2EEF7] inline-flex items-center justify-center">
                        <MaterialIcon name="account_balance" size={24} />
                      </span>
                      <p className="text-xs text-[#5A5A58] dark:text-slate-400 max-w-sm mx-auto">
                        You don&apos;t have a dedicated bank transfer account yet. Provision one to get a
                        permanent account number for direct bank transfers.
                      </p>
                      <button
                        type="button"
                        onClick={handleProvisionDva}
                        disabled={isProvisioning}
                        className="h-10 px-5 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:text-[#1E1E1E] dark:hover:bg-slate-100 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
                      >
                        {isProvisioning && <MaterialIcon name="progress_activity" size={16} className="animate-spin" />}
                        <span>{isProvisioning ? "Provisioning..." : "Provision Bank Transfer Account"}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Method 3: Crypto (NOWPayments) */}
              {method === "crypto" && (
                <div className="space-y-4">
                  {!cryptoSession ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-[#5A5A58] dark:text-slate-300">
                          Select Deposit Amount ({currency})
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {presets.map((amt) => {
                            const isAmtSelected = selectedAmount === amt && !customAmount;
                            return (
                              <button
                                key={amt}
                                type="button"
                                onClick={() => {
                                  setSelectedAmount(amt);
                                  setCustomAmount("");
                                }}
                                className={`h-10 rounded-[14px] text-xs font-mono font-medium transition-all cursor-pointer ${
                                  isAmtSelected
                                    ? "bg-[#222222] text-white dark:bg-white dark:text-[#1E1E1E] font-semibold shadow-xs"
                                    : "bg-white dark:bg-[#1C2029] text-[#5A5A58] dark:text-slate-300 border border-[#E7E4DF] dark:border-[#282D3A] hover:bg-[#EFECE8] dark:hover:bg-[#232834]"
                                }`}
                              >
                                {currencySymbol}{amt.toLocaleString()}
                              </button>
                            );
                          })}
                        </div>
                        <div className="relative mt-2">
                          <input
                            type="number"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            placeholder={`Or enter custom amount (${currencySymbol})`}
                            className="w-full h-10 px-4 rounded-[14px] bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-mono text-[#1E1E1E] dark:text-white placeholder:text-[#8C8B87] dark:placeholder:text-slate-500 focus:outline-none focus:border-[#222222] dark:focus:border-white transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-[#5A5A58] dark:text-slate-300">
                          Payment Coin / Token
                        </label>
                        <select
                          value={cryptoCurrency}
                          onChange={(e) => setCryptoCurrency(e.target.value)}
                          className="w-full h-10 px-4 rounded-[14px] bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-slate-200 focus:outline-none focus:border-[#222222] dark:focus:border-white transition-all"
                        >
                          {CRYPTO_CURRENCIES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleInitCrypto}
                        disabled={isProcessing || finalAmount <= 0}
                        className="w-full h-11 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:text-[#1E1E1E] dark:hover:bg-slate-100 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isProcessing && <MaterialIcon name="progress_activity" size={16} className="animate-spin" />}
                        <span>{isProcessing ? "Generating Crypto Address..." : "Generate Deposit Address"}</span>
                      </button>
                    </>
                  ) : (
                    <div className="p-5 rounded-[22px] bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] space-y-3.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-[#2563EB] dark:text-[#3B82F6] font-semibold">
                          Awaiting Crypto Payment
                        </span>
                        <PastelTypePill
                          icon="hourglass_top"
                          label={cryptoSession.payment_status.toUpperCase()}
                          variant="yellow"
                          size="sm"
                        />
                      </div>

                      <div>
                        <span className="text-[11px] text-[#8C8B87] dark:text-slate-400 block">Amount to Send</span>
                        <span className="text-base font-mono font-bold text-[#1E1E1E] dark:text-white">
                          {cryptoSession.pay_amount} {cryptoSession.pay_currency}
                        </span>
                        <span className="text-[11px] text-[#8C8B87] ml-2">
                          (≈ {currencySymbol}{Number(cryptoSession.price_amount).toLocaleString()} {cryptoSession.price_currency})
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-[#8C8B87] dark:text-slate-400 block">Deposit Address</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-mono bg-[#F6F6F4] dark:bg-[#161920] p-2.5 rounded-[12px] border border-[#E7E4DF] dark:border-[#282D3A] flex-1 break-all select-all font-medium text-[#1E1E1E] dark:text-slate-200">
                            {cryptoSession.pay_address}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(cryptoSession.pay_address)}
                            className="w-8 h-8 rounded-full bg-[#F6F6F4] dark:bg-[#232834] text-[#5A5A58] hover:text-[#1E1E1E] dark:hover:text-white flex items-center justify-center transition-colors border border-[#E7E4DF] dark:border-[#282D3A] cursor-pointer shrink-0"
                            aria-label="Copy crypto address"
                          >
                            <MaterialIcon
                              name={copied ? "check" : "content_copy"}
                              size={15}
                              className={copied ? "text-[#4EA871]" : ""}
                            />
                          </button>
                        </div>
                      </div>

                      {cryptoSession.invoice_url && (
                        <a
                          href={cryptoSession.invoice_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-[#2563EB] dark:text-[#3B82F6] hover:underline pt-1 font-medium"
                        >
                          <MaterialIcon name="open_in_new" size={14} />
                          <span>Open NOWPayments Checkout Page</span>
                        </a>
                      )}

                      <div className="p-3 rounded-[16px] bg-[#EFECE8] dark:bg-[#232834]/60 border border-[#E7E4DF] dark:border-[#282D3A] text-[11px] text-[#5A5A58] dark:text-slate-400 flex items-start gap-2.5">
                        <MaterialIcon name="info" size={16} className="text-[#8C8B87] shrink-0 mt-0.5" />
                        <span>
                          Send exactly {cryptoSession.pay_amount} {cryptoSession.pay_currency} to this address.
                          Your prepaid wallet will be credited automatically once the network confirms the transaction.
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCryptoSession(null)}
                        className="w-full h-9 rounded-full bg-[#EFECE8] dark:bg-[#232834] hover:bg-[#D5D0C8] dark:hover:bg-[#282D3A] text-xs font-medium text-[#1E1E1E] dark:text-white transition-colors cursor-pointer"
                      >
                        Start New Deposit
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Method 4: Other / Manual Deposit */}
              {method === "other" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#5A5A58] dark:text-slate-300">
                      Select Deposit Amount ({currency})
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {presets.map((amt) => {
                        const isAmtSelected = selectedAmount === amt && !customAmount;
                        return (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => {
                              setSelectedAmount(amt);
                              setCustomAmount("");
                            }}
                            className={`h-10 rounded-[14px] text-xs font-mono font-medium transition-all cursor-pointer ${
                              isAmtSelected
                                ? "bg-[#222222] text-white dark:bg-white dark:text-[#1E1E1E] font-semibold shadow-xs"
                                : "bg-white dark:bg-[#1C2029] text-[#5A5A58] dark:text-slate-300 border border-[#E7E4DF] dark:border-[#282D3A] hover:bg-[#EFECE8] dark:hover:bg-[#232834]"
                            }`}
                          >
                            {currencySymbol}{amt.toLocaleString()}
                          </button>
                        );
                      })}
                    </div>
                    <div className="relative mt-2">
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder={`Or enter custom amount (${currencySymbol})`}
                        className="w-full h-10 px-4 rounded-[14px] bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-mono text-[#1E1E1E] dark:text-white placeholder:text-[#8C8B87] dark:placeholder:text-slate-500 focus:outline-none focus:border-[#222222] dark:focus:border-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#5A5A58] dark:text-slate-300">Provider</label>
                    <select
                      value={otherProvider}
                      onChange={(e) => setOtherProvider(e.target.value as (typeof OTHER_PROVIDERS)[number])}
                      className="w-full h-10 px-4 rounded-[14px] bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-slate-200 focus:outline-none focus:border-[#222222] dark:focus:border-white transition-all"
                    >
                      {OTHER_PROVIDERS.map((p) => (
                        <option key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-4 rounded-[18px] bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#8C8B87] block">Total charge:</span>
                      <p className="text-base font-mono font-semibold text-[#1E1E1E] dark:text-white">
                        {currencySymbol}{finalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOtherDeposit}
                      disabled={isProcessing || finalAmount <= 0}
                      className="h-10 px-5 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:text-[#1E1E1E] dark:hover:bg-slate-100 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      {isProcessing && <MaterialIcon name="progress_activity" size={16} className="animate-spin" />}
                      <span>{isProcessing ? "Settling Funds..." : "Confirm & Deposit"}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
