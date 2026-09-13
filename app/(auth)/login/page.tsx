"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/store/auth-context";
import { LoginSchema } from "@/lib/schemas/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
