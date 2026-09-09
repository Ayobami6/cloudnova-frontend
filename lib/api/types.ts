/**
 * TypeScript mirrors of cloudnova-api's Pydantic v2 schemas.
 *
 * Field names deliberately match the API's wire format (snake_case) rather
 * than being remapped to camelCase - these types exist to keep the frontend
 * honest about the actual contract, and a 1:1 mapping makes that contract
 * easy to audit against each app's schemas.py.
 */

// --- Auth ---

export interface RegisterUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface VerifyEmailOtpRequest {
  email: string;
  otp_code: string;
}

export type OtpPurpose = "registration" | "password_reset";

export interface ResendOtpRequest {
  email: string;
  purpose?: OtpPurpose;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp_code: string;
  new_password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface TokenPairResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_email_verified: boolean;
}

export interface AccountResponse {
  id: string;
  name: string;
  slug: string;
  account_number: string;
  owner_id: string;
}

export interface AuthSuccessResponse {
  user: UserResponse;
  account: AccountResponse | null;
  tokens: TokenPairResponse;
}

/** Shape of GET /auth/me - a raw dict, not a typed Pydantic schema. */
export interface MeResponse {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    is_email_verified: boolean;
  };
  active_account: {
    id: string;
    name: string;
    slug: string;
    account_number: string;
    role: AccountRole;
  } | null;
}

// --- Accounts ---

export type AccountRole = "OWNER" | "ADMIN" | "DEVELOPER" | "BILLING_VIEWER";

export interface CreateAccountRequest {
  name: string;
}

export interface SwitchAccountRequest {
  account_id: string;
}

/** Shape of POST /accounts/switch - a raw dict, not a typed Pydantic schema. */
export interface SwitchAccountResponse {
  access_token: string;
  token_type: string;
  active_account: {
    id: string;
    name: string;
    slug: string;
    account_number: string;
  };
}

export interface InviteMemberRequest {
  email: string;
  role?: AccountRole;
}

export interface AcceptInvitationRequest {
  token: string;
}

export interface MemberResponse {
  id: string;
  user_id: string;
  account_id: string;
  role: AccountRole;
  joined_at: string;
}

export interface AccountInvitationResponse {
  id: string;
  account_id: string;
  email: string;
  role: AccountRole;
  expires_at: string;
  is_accepted: boolean;
}

// --- Billing ---

export interface BalanceResponse {
  account_id: string;
  account_number: string;
  currency: string;
  balance: string;
}

export interface DepositRequest {
  amount: string;
  currency?: string;
  payment_method?: string;
  reference: string;
}

export interface DepositResponse {
  reference: string;
  amount: string;
  currency: string;
  wallet_balance: string;
  status: string;
}

export interface SwitchCurrencyRequest {
  currency: string;
}

export interface SwitchCurrencyResponse {
  account_id: string;
  currency: string;
  message: string;
}

export interface CreateVirtualAccountRequest {
  phone?: string;
}

export interface InitializeCheckoutRequest {
  amount: string;
  currency?: string;
  reference?: string;
}

export interface CheckoutSessionResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface WebhookAckResponse {
  status: string;
}

export interface VirtualAccountResponse {
  id: string;
  provider: string;
  currency: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  account_reference: string;
  crypto_address: string;
  lightning_address: string;
  is_active: boolean;
}

export interface ResourceUsageItemResponse {
  resource_id: string;
  resource_type: string;
  resource_name: string;
  status: string;
  hourly_rate: string;
  currency: string;
  hours_run_this_month: string;
  accrued_cost: string;
}

export interface UsageSummaryResponse {
  billing_period: string;
  currency: string;
  wallet_balance: string;
  accrued_usage_amount: string;
  projected_month_end_amount: string;
  hourly_burn_rate: string;
  daily_burn_rate: string;
  estimated_runway_hours: number;
  resources: ResourceUsageItemResponse[];
}

export interface ProvisioningCheckRequest {
  hourly_rate: string;
  currency?: string;
}

export interface ProvisioningCheckResponse {
  can_provision: boolean;
  wallet_balance: string;
  projected_monthly_cost: string;
  currency: string;
  message: string;
}

export interface TransactionResponse {
  id: string;
  date: string;
  type: string;
  description: string;
  amount: string;
  currency: string;
  status: string;
  resource_category: string;
}

export interface InvoiceLineItemResponse {
  id: string;
  resource_id: string;
  resource_type: string;
  resource_name: string;
  running_hours: string;
  hourly_rate: string;
  total_amount: string;
  currency: string;
}

export interface InvoiceResponse {
  id: string;
  period: string;
  due_date: string;
  total_wholesale: string;
  total_retail: string;
  net_profit: string;
  currency: string;
  status: string;
  pdf_url: string;
  paid_at: string | null;
  line_items: InvoiceLineItemResponse[];
}

export interface MarginConfigResponse {
  global_markup_percent: string;
  compute_markup_percent: string;
  database_markup_percent: string;
  storage_markup_percent: string;
  domains_markup_percent: string;
  currency: string;
}

export interface UpdateMarginConfigRequest {
  global_markup_percent: number;
  compute_markup_percent: number;
  database_markup_percent: number;
  storage_markup_percent: number;
  domains_markup_percent: number;
  currency?: string;
}
