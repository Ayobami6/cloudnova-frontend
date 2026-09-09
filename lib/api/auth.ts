import { apiRequest } from "./http";
import type {
  AcceptInvitationRequest,
  AccountInvitationResponse,
  AccountResponse,
  AuthSuccessResponse,
  CreateAccountRequest,
  ForgotPasswordRequest,
  InviteMemberRequest,
  LoginRequest,
  MeResponse,
  MemberResponse,
  RefreshTokenRequest,
  RegisterUserRequest,
  ResendOtpRequest,
  ResetPasswordRequest,
  SwitchAccountRequest,
  SwitchAccountResponse,
  TokenPairResponse,
  UserResponse,
  VerifyEmailOtpRequest,
} from "./types";

// --- Auth ---

export function register(payload: RegisterUserRequest): Promise<UserResponse> {
  return apiRequest<UserResponse>("/auth/register", { method: "POST", body: payload, auth: false });
}

export function verifyEmailOtp(payload: VerifyEmailOtpRequest): Promise<AuthSuccessResponse> {
  return apiRequest<AuthSuccessResponse>("/auth/verify-email-otp", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export function resendOtp(payload: ResendOtpRequest): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/resend-otp", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export function login(payload: LoginRequest): Promise<AuthSuccessResponse> {
  return apiRequest<AuthSuccessResponse>("/auth/login", { method: "POST", body: payload, auth: false });
}

export function forgotPassword(payload: ForgotPasswordRequest): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export function resetPassword(payload: ResetPasswordRequest): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export function refreshToken(payload: RefreshTokenRequest): Promise<TokenPairResponse> {
  return apiRequest<TokenPairResponse>("/auth/refresh-token", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export function me(): Promise<MeResponse> {
  return apiRequest<MeResponse>("/auth/me");
}

// --- Accounts ---

export function listAccounts(): Promise<AccountResponse[]> {
  return apiRequest<AccountResponse[]>("/accounts");
}

export function createAccount(payload: CreateAccountRequest): Promise<AccountResponse> {
  return apiRequest<AccountResponse>("/accounts", { method: "POST", body: payload });
}

export function switchAccount(payload: SwitchAccountRequest): Promise<SwitchAccountResponse> {
  return apiRequest<SwitchAccountResponse>("/accounts/switch", { method: "POST", body: payload });
}

export function listMembers(accountId: string): Promise<MemberResponse[]> {
  return apiRequest<MemberResponse[]>(`/accounts/${accountId}/members`);
}

export function inviteMember(
  accountId: string,
  payload: InviteMemberRequest
): Promise<AccountInvitationResponse> {
  return apiRequest<AccountInvitationResponse>(`/accounts/${accountId}/invitations`, {
    method: "POST",
    body: payload,
  });
}

export function acceptInvitation(payload: AcceptInvitationRequest): Promise<MemberResponse> {
  return apiRequest<MemberResponse>("/accounts/invitations/accept", { method: "POST", body: payload });
}

export function removeMember(accountId: string, userId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/accounts/${accountId}/members/${userId}`, {
    method: "DELETE",
  });
}
