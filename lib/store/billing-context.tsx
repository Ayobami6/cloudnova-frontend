"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as billingApi from "@/lib/api/billing";
import { ApiError } from "@/lib/api/errors";
import type {
  BalanceResponse,
  InvoiceResponse,
  MarginConfigResponse,
  TransactionResponse,
  UsageSummaryResponse,
  VirtualAccountResponse,
} from "@/lib/api/types";
import { useAuth } from "./auth-context";

type ActionResult<T = undefined> = { success: boolean; error?: string; data?: T };

interface BillingContextType {
  isLoading: boolean;
  loadError: string | null;

  balance: BalanceResponse | null;
  usage: UsageSummaryResponse | null;
  transactions: TransactionResponse[];
  invoices: InvoiceResponse[];
  virtualAccounts: VirtualAccountResponse[];
  marginConfig: MarginConfigResponse | null;

  /** Convenience numeric read of balance.balance, defaulting to 0 while loading. */
  walletBalance: number;
  /** Convenience numeric read of usage.hourly_burn_rate, defaulting to 0. */
  hourlyBurnRate: number;

  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (open: boolean) => void;

  refreshAll: () => Promise<void>;
  recordDeposit: (
    amount: number,
    currency: string,
    paymentMethod: string,
    reference: string
  ) => Promise<ActionResult>;
  provisionPaystackVirtualAccount: (phone?: string) => Promise<ActionResult<VirtualAccountResponse>>;
  startPaystackCheckout: (amount: number, currency: string) => Promise<ActionResult<string>>;
  switchCurrency: (currency: string) => Promise<ActionResult>;
  generateInvoice: (period: string) => Promise<ActionResult>;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.firstFieldError || err.detail || fallback;
  return fallback;
}

/** Backend accepts either an OWNER or ADMIN tenant role for GET /billing/margin-config. */
const MARGIN_CONFIG_ROLES = new Set(["OWNER", "ADMIN"]);

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [usage, setUsage] = useState<UsageSummaryResponse | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [virtualAccounts, setVirtualAccounts] = useState<VirtualAccountResponse[]>([]);
  const [marginConfig, setMarginConfig] = useState<MarginConfigResponse | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);

  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setLoadError(null);

    const canReadMarginConfig = !!user?.role && MARGIN_CONFIG_ROLES.has(user.role);

    const [balanceR, usageR, txR, invoicesR, vaR, marginR] = await Promise.allSettled([
      billingApi.getBalance(),
      billingApi.getCurrentUsage(),
      billingApi.listTransactions(),
      billingApi.listInvoices(),
      billingApi.listVirtualAccounts(),
      canReadMarginConfig ? billingApi.getMarginConfig() : Promise.resolve(null),
    ]);

    if (balanceR.status === "fulfilled") setBalance(balanceR.value);
    if (usageR.status === "fulfilled") setUsage(usageR.value);
    if (txR.status === "fulfilled") setTransactions(txR.value);
    if (invoicesR.status === "fulfilled") setInvoices(invoicesR.value);
    if (vaR.status === "fulfilled") setVirtualAccounts(vaR.value);
    if (marginR.status === "fulfilled" && marginR.value) setMarginConfig(marginR.value);

    // Surface the balance fetch failure specifically - it's the figure
    // shown everywhere (header, sidebar, billing page) and a silent
    // failure there would otherwise read as "zero funds".
    if (balanceR.status === "rejected") {
      setLoadError(errorMessage(balanceR.reason, "Failed to load billing data."));
    }

    setIsLoading(false);
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    } else {
      setBalance(null);
      setUsage(null);
      setTransactions([]);
      setInvoices([]);
      setVirtualAccounts([]);
      setMarginConfig(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const recordDeposit = useCallback(
    async (amount: number, currency: string, paymentMethod: string, reference: string): Promise<ActionResult> => {
      try {
        await billingApi.deposit({
          amount: amount.toFixed(2),
          currency,
          payment_method: paymentMethod,
          reference,
        });
        await refreshAll();
        return { success: true };
      } catch (err) {
        return { success: false, error: errorMessage(err, "Deposit failed.") };
      }
    },
    [refreshAll]
  );

  const provisionPaystackVirtualAccount = useCallback(
    async (phone?: string): Promise<ActionResult<VirtualAccountResponse>> => {
      try {
        const account = await billingApi.createPaystackVirtualAccount({ phone: phone || "" });
        setVirtualAccounts((prev) => {
          const withoutThis = prev.filter((a) => a.id !== account.id);
          return [...withoutThis, account];
        });
        return { success: true, data: account };
      } catch (err) {
        return { success: false, error: errorMessage(err, "Failed to provision virtual account.") };
      }
    },
    []
  );

  const startPaystackCheckout = useCallback(
    async (amount: number, currency: string): Promise<ActionResult<string>> => {
      try {
        const session = await billingApi.initializePaystackCheckout({
          amount: amount.toFixed(2),
          currency,
        });
        return { success: true, data: session.authorization_url };
      } catch (err) {
        return { success: false, error: errorMessage(err, "Failed to start Paystack checkout.") };
      }
    },
    []
  );

  const switchCurrency = useCallback(
    async (currency: string): Promise<ActionResult> => {
      try {
        await billingApi.switchCurrency({ currency });
        await refreshAll();
        return { success: true };
      } catch (err) {
        return { success: false, error: errorMessage(err, "Failed to switch currency.") };
      }
    },
    [refreshAll]
  );

  const generateInvoice = useCallback(
    async (period: string): Promise<ActionResult> => {
      try {
        await billingApi.generateInvoice(period);
        await refreshAll();
        return { success: true };
      } catch (err) {
        return { success: false, error: errorMessage(err, "Failed to generate invoice.") };
      }
    },
    [refreshAll]
  );

  const value: BillingContextType = {
    isLoading,
    loadError,
    balance,
    usage,
    transactions,
    invoices,
    virtualAccounts,
    marginConfig,
    walletBalance: balance ? Number(balance.balance) : 0,
    hourlyBurnRate: usage ? Number(usage.hourly_burn_rate) : 0,
    isDepositModalOpen,
    setIsDepositModalOpen,
    refreshAll,
    recordDeposit,
    provisionPaystackVirtualAccount,
    startPaystackCheckout,
    switchCurrency,
    generateInvoice,
  };

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling(): BillingContextType {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error("useBilling must be used within a BillingProvider");
  }
  return context;
}
