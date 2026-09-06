"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingVerificationEmail: string | null;
  pendingResetEmail: string | null;
  generatedOtp: string;

  login: (email: string, pass: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  quickDemoLogin: () => void;
  register: (name: string, email: string, pass: string, company: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmailOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPasswordWithOtp: (email: string, otp: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (email: string, type: "verification" | "reset") => Promise<string>;
  logout: () => void;
}

const DEFAULT_USER: AuthUser = {
  id: "usr-prod-01",
  name: "Alex Chen",
  email: "alex.chen@cloudnova.io",
  role: "Principal Systems Architect",
  company: "NovaScale Technologies",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  emailVerified: true,
  createdAt: "2024-01-15T08:00:00.000Z",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(DEFAULT_USER);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [pendingResetEmail, setPendingResetEmail] = useState<string | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState<string>("849201");

  // Load persisted session on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("cloudnova_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Default demo session active
        setUser(DEFAULT_USER);
        localStorage.setItem("cloudnova_user", JSON.stringify(DEFAULT_USER));
      }
    } catch {
      setUser(DEFAULT_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (
    email: string,
    pass: string,
    rememberMe = true
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    // Demo authentication check
    if (pass.length < 8) {
      setIsLoading(false);
      return { success: false, error: "Invalid credentials. Password must be at least 8 characters." };
    }

    const authenticatedUser: AuthUser = {
      id: "usr-" + Math.random().toString(36).substring(2, 8),
      name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role: "Infrastructure Engineer",
      company: "CloudNova Edge Tenant",
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };

    setUser(authenticatedUser);
    if (rememberMe) {
      localStorage.setItem("cloudnova_user", JSON.stringify(authenticatedUser));
    }
    setIsLoading(false);
    return { success: true };
  };

  const quickDemoLogin = () => {
    setUser(DEFAULT_USER);
    localStorage.setItem("cloudnova_user", JSON.stringify(DEFAULT_USER));
    router.push("/overview");
  };

  const register = async (
    name: string,
    email: string,
    _pass: string,
    company: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700));

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setPendingVerificationEmail(email);

    // Store temporary unverified user state in memory
    const unverifiedUser: AuthUser = {
      id: "usr-" + Math.random().toString(36).substring(2, 8),
      name,
      email,
      role: "Account Owner",
      company,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };
    setUser(unverifiedUser);
    setIsLoading(false);

    return { success: true };
  };

  const verifyEmailOtp = async (
    email: string,
    otp: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    // Accepts the generated OTP or the universal test OTP 849201
    if (otp !== generatedOtp && otp !== "849201") {
      setIsLoading(false);
      return { success: false, error: "Invalid verification code. Please check your email or enter sample OTP 849201." };
    }

    if (user && user.email === email) {
      const verified = { ...user, emailVerified: true };
      setUser(verified);
      localStorage.setItem("cloudnova_user", JSON.stringify(verified));
    } else {
      const newUser: AuthUser = {
        id: "usr-" + Math.random().toString(36).substring(2, 8),
        name: email.split("@")[0],
        email,
        role: "Account Owner",
        company: "CloudNova Tenant",
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem("cloudnova_user", JSON.stringify(newUser));
    }

    setPendingVerificationEmail(null);
    setIsLoading(false);
    return { success: true };
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(resetOtp);
    setPendingResetEmail(email);
    setIsLoading(false);
    return { success: true };
  };

  const resetPasswordWithOtp = async (
    email: string,
    otp: string,
    _newPass: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700));

    // Accepts the generated OTP or the universal test OTP 491028
    if (otp !== generatedOtp && otp !== "491028") {
      setIsLoading(false);
      return { success: false, error: "Invalid or expired reset code. Please enter sample OTP 491028 or request a new code." };
    }

    setPendingResetEmail(null);
    setIsLoading(false);
    return { success: true };
  };

  const resendOtp = async (_email: string, _type: "verification" | "reset"): Promise<string> => {
    const freshOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(freshOtp);
    return freshOtp;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("cloudnova_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && user.emailVerified,
        isLoading,
        pendingVerificationEmail,
        pendingResetEmail,
        generatedOtp,
        login,
        quickDemoLogin,
        register,
        verifyEmailOtp,
        requestPasswordReset,
        resetPasswordWithOtp,
        resendOtp,
        logout,
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
