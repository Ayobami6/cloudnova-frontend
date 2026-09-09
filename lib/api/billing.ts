import { apiRequest } from "./http";
import type {
  BalanceResponse,
  CheckoutSessionResponse,
  CreateVirtualAccountRequest,
  DepositRequest,
  DepositResponse,
  InitializeCheckoutRequest,
  InvoiceResponse,
  MarginConfigResponse,
  ProvisioningCheckRequest,
  ProvisioningCheckResponse,
  SwitchCurrencyRequest,
  SwitchCurrencyResponse,
  TransactionResponse,
  UpdateMarginConfigRequest,
  UsageSummaryResponse,
  VirtualAccountResponse,
} from "./types";

export function getBalance(): Promise<BalanceResponse> {
  return apiRequest<BalanceResponse>("/billing/balance");
}

export function deposit(payload: DepositRequest): Promise<DepositResponse> {
  return apiRequest<DepositResponse>("/billing/deposit", { method: "POST", body: payload });
}

export function switchCurrency(payload: SwitchCurrencyRequest): Promise<SwitchCurrencyResponse> {
  return apiRequest<SwitchCurrencyResponse>("/billing/currency/switch", {
    method: "POST",
    body: payload,
  });
}

export function getCurrentUsage(billingPeriod?: string): Promise<UsageSummaryResponse> {
  return apiRequest<UsageSummaryResponse>("/billing/usage/current", {
    query: { billing_period: billingPeriod },
  });
}

export function checkProvisioning(
  payload: ProvisioningCheckRequest
): Promise<ProvisioningCheckResponse> {
  return apiRequest<ProvisioningCheckResponse>("/billing/provisioning/check", {
    method: "POST",
    body: payload,
  });
}

export function listVirtualAccounts(): Promise<VirtualAccountResponse[]> {
  return apiRequest<VirtualAccountResponse[]>("/billing/virtual-accounts");
}

export function createPaystackVirtualAccount(
  payload: CreateVirtualAccountRequest
): Promise<VirtualAccountResponse> {
  return apiRequest<VirtualAccountResponse>("/billing/virtual-accounts/paystack", {
    method: "POST",
    body: payload,
  });
}

export function initializePaystackCheckout(
  payload: InitializeCheckoutRequest
): Promise<CheckoutSessionResponse> {
  return apiRequest<CheckoutSessionResponse>("/billing/deposit/paystack/checkout", {
    method: "POST",
    body: payload,
  });
}

export function listTransactions(limit = 50, offset = 0): Promise<TransactionResponse[]> {
  return apiRequest<TransactionResponse[]>("/billing/transactions", { query: { limit, offset } });
}

export function listInvoices(): Promise<InvoiceResponse[]> {
  return apiRequest<InvoiceResponse[]>("/billing/invoices");
}

export function generateInvoice(period: string): Promise<InvoiceResponse> {
  return apiRequest<InvoiceResponse>(`/billing/invoices/${period}/generate`, { method: "POST" });
}

export function getMarginConfig(): Promise<MarginConfigResponse> {
  return apiRequest<MarginConfigResponse>("/billing/margin-config");
}

export function updateMarginConfig(payload: UpdateMarginConfigRequest): Promise<MarginConfigResponse> {
  return apiRequest<MarginConfigResponse>("/billing/margin-config", { method: "PUT", body: payload });
}
