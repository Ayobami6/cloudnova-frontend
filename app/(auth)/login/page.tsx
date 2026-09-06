"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/store/auth-context";
import { LoginSchema } from "@/lib/schemas/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login, quickDemoLogin, isLoading } = useAuth();

  const [email, setEmail] = useState("alex.chen@cloudnova.io");
  const [password, setPassword] = useState("CloudNova#2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = LoginSchema.safeParse({ email, password, rememberMe });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Please check your credentials");
      return;
    }

    const res = await login(email, password, rememberMe);
    if (res.success) {
      router.push("/overview");
    } else {
      setError(res.error || "Failed to authenticate");
    }
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Welcome back
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Sign in to your CloudNova infrastructure console and telemetry dashboard.
        </p>
      </div>

      {/* 1-Click Demo Quick Fill Banner */}
      <div className="p-3.5 rounded-lg bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-blue-900 dark:text-blue-300 font-medium">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>Need quick test access?</span>
        </div>
        <button
          type="button"
          onClick={quickDemoLogin}
          className="h-7 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-xs transition-colors"
        >
          1-Click Demo Login
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Work Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              required
              className="w-full h-9 pl-9 pr-3 rounded-md bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-9 pl-9 pr-10 rounded-md bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-300 dark:border-[#232736] text-blue-600 focus:ring-blue-500"
            />
            <span>Remember session for 30 days</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-9 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <span>Sign In to Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200 dark:border-[#232736] w-full" />
        <span className="bg-slate-50 dark:bg-[#090A0F] px-3 text-[11px] text-slate-400 uppercase tracking-wider relative">
          or continue with
        </span>
      </div>

      {/* Social buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={quickDemoLogin}
          className="h-9 px-3 rounded-md bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] hover:bg-slate-50 dark:hover:bg-[#1E2230] text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          <span>GitHub</span>
        </button>

        <button
          type="button"
          onClick={quickDemoLogin}
          className="h-9 px-3 rounded-md bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] hover:bg-slate-50 dark:hover:bg-[#1E2230] text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27a7.22 7.22 0 010-4.54V6.58H1.25a12.01 12.01 0 000 10.84l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Google</span>
        </button>
      </div>

      {/* Switch to Register */}
      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Don&apos;t have an account yet?{" "}
        <Link href="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          Create account & get $200 credit
        </Link>
      </p>
    </div>
  );
}
