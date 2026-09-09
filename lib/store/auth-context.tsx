"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as authApi from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { SESSION_EXPIRED_EVENT } from "@/lib/api/http";
import { clearTokens, getAccessToken, setTokens } from "@/lib/api/token-storage";
import type { AccountRole, MeResponse } from "@/lib/api/types";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AccountRole | "";
  /** Active account/organization name. Named `company` for compatibility
   *  with existing UI (components/layout/header.tsx) that predates the
   *  real backend's account model. */
  company: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: string;
  accountId: string | null;
  accountSlug: string | null;
  accountNumber: string | null;
}

type ActionResult = { success: boolean; error?: string };

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingVerificationEmail: string | null;
  pendingResetEmail: string | null;

  /** `rememberMe` is currently a no-op: token persistence to localStorage
   *  is unconditional (see lib/api/token-storage.ts). Kept in the
   *  signature for the existing login form and as a hook for a future
   *  sessionStorage-backed "don't remember me" mode. */
  login: (email: string, password: string, rememberMe?: boolean) => Promise<ActionResult>;
  register: (name: string, email: string, password: string) => Promise<ActionResult>;
  verifyEmailOtp: (email: string, otp: string) => Promise<ActionResult>;
  requestPasswordReset: (email: string) => Promise<ActionResult>;
  resetPasswordWithOtp: (email: string, otp: string, newPassword: string) => Promise<ActionResult>;
  resendOtp: (email: string, type: "verification" | "reset") => Promise<ActionResult>;
  logout: () => void;
  /** Re-fetch /auth/me, e.g. after switching the active account. */
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    return err.firstFieldError || err.detail || fallback;
  }
  return fallback;
}

function mapMeResponse(me: MeResponse): AuthUser {
  const { user, active_account: account } = me;
  return {
    id: user.id,
    name: `${user.first_name} ${user.last_name}`.trim(),
    email: user.email,
    role: account?.role ?? "",
    company: account?.name ?? "",
    emailVerified: user.is_email_verified,
    createdAt: new Date().toISOString(),
    accountId: account?.id ?? null,
    accountSlug: account?.slug ?? null,
    accountNumber: account?.account_number ?? null,
  };
}

/**
 * Splits a single "Full Name" input into (first_name, last_name) for the
 * backend's RegisterUserRequest, which requires them separately. The
 * registration form still collects one field for a smaller UI diff; a
 * single-word name is used as both first and last name.
 */
function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim().replace(/\s+/g, " ");
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) {
    return { firstName: trimmed, lastName: trimmed };
  }
  return { firstName: trimmed.slice(0, spaceIndex), lastName: trimmed.slice(spaceIndex + 1) };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [pendingResetEmail, setPendingResetEmail] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(mapMeResponse(me));
    } catch {
      clearTokens();
      setUser(null);
    }
  }, []);

  // Hydrate the session from a persisted token pair on first load.
  useEffect(() => {
    if (!getAccessToken()) {
      setIsLoading(false);
      return;
    }
    refreshSession().finally(() => setIsLoading(false));
  }, [refreshSession]);

  // A refresh-token failure anywhere in the app (see lib/api/http.ts) means
  // the session can no longer be recovered silently - drop back to login.
  useEffect(() => {
    const onSessionExpired = () => {
      setUser(null);
      router.push("/login");
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
  }, [router]);

  const login = useCallback(async (email: string, password: string): Promise<ActionResult> => {
    setIsLoading(true);
    try {
      const result = await authApi.login({ email, password });
      setTokens({ accessToken: result.tokens.access_token, refreshToken: result.tokens.refresh_token });
      await refreshSession();
      return { success: true };
    } catch (err) {
      return { success: false, error: extractErrorMessage(err, "Invalid credentials.") };
    } finally {
      setIsLoading(false);
    }
  }, [refreshSession]);

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<ActionResult> => {
      // Note: the backend has no "create account with this name at signup"
      // step - verify-email-otp below auto-creates a default Account named
      // "<first name>'s Team" for a brand-new user (see
      // AuthService.verify_email_otp), and login()/register() otherwise
      // requires the user to already belong to one. The registration
      // form's "Company / Team" field is validated client-side but has no
      // server-side effect yet; renaming the auto-created organization is
      // a job for the team page once the API exposes a rename endpoint.
      setIsLoading(true);
      try {
        const { firstName, lastName } = splitName(name);
        await authApi.register({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        });
        setPendingVerificationEmail(email);
        return { success: true };
      } catch (err) {
        return { success: false, error: extractErrorMessage(err, "Failed to create account.") };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const verifyEmailOtp = useCallback(async (email: string, otp: string): Promise<ActionResult> => {
    setIsLoading(true);
    try {
      const result = await authApi.verifyEmailOtp({ email, otp_code: otp });
      setTokens({ accessToken: result.tokens.access_token, refreshToken: result.tokens.refresh_token });
      await refreshSession();
      setPendingVerificationEmail(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: extractErrorMessage(err, "Invalid verification code.") };
    } finally {
      setIsLoading(false);
    }
  }, [refreshSession]);

  const requestPasswordReset = useCallback(async (email: string): Promise<ActionResult> => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setPendingResetEmail(email);
      return { success: true };
    } catch (err) {
      return { success: false, error: extractErrorMessage(err, "Failed to dispatch reset code.") };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPasswordWithOtp = useCallback(
    async (email: string, otp: string, newPassword: string): Promise<ActionResult> => {
      setIsLoading(true);
      try {
        await authApi.resetPassword({ email, otp_code: otp, new_password: newPassword });
        setPendingResetEmail(null);
        return { success: true };
      } catch (err) {
        return { success: false, error: extractErrorMessage(err, "Failed to reset password.") };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const resendOtp = useCallback(
    async (email: string, type: "verification" | "reset"): Promise<ActionResult> => {
      try {
        await authApi.resendOtp({
          email,
          purpose: type === "verification" ? "registration" : "password_reset",
        });
        return { success: true };
      } catch (err) {
        return { success: false, error: extractErrorMessage(err, "Failed to resend code.") };
      }
    },
    []
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && user.emailVerified,
        isLoading,
        pendingVerificationEmail,
        pendingResetEmail,
        login,
        register,
        verifyEmailOtp,
        requestPasswordReset,
        resetPasswordWithOtp,
        resendOtp,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
