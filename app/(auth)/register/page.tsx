"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Building, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/store/auth-context";
import { RegisterSchema } from "@/lib/schemas/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Compute password strength score (0 to 4)
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const strengthColors = ["bg-rose-500", "bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-400"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = RegisterSchema.safeParse({
      name,
      email,
      company,
      password,
      agreeTerms,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Please check your inputs");
      return;
    }

    const res = await register(name, email, password);
    if (res.success) {
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } else {
      setError(res.error || "Failed to create account");
    }
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-mono mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>$200 Free Cloud Credit Included</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Create CloudNova Account
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Deploy high-performance KVM droplets and managed databases in seconds.
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
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Connor"
                required
                className="w-full h-9 pl-9 pr-3 rounded-md bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Company / Team</label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Cyberdyne AI"
                required
                className="w-full h-9 pl-9 pr-3 rounded-md bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Work Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="s.connor@cyberdyne.io"
              required
              className="w-full h-9 pl-9 pr-3 rounded-md bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 chars, 1 uppercase, 1 symbol"
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

          {/* Password Strength Gauge */}
          {password.length > 0 && (
            <div className="pt-1.5 space-y-1">
              <div className="flex gap-1 h-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 rounded-full transition-all duration-300 ${
                      strengthScore >= step
                        ? strengthColors[strengthScore]
                        : "bg-slate-200 dark:bg-[#232736]"
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>Password Strength:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {strengthLabels[strengthScore]}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-1">
          <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
              className="w-3.5 h-3.5 rounded border-slate-300 dark:border-[#232736] text-blue-600 focus:ring-blue-500 mt-0.5"
            />
            <span>
              I agree to the{" "}
              <span className="text-blue-600 dark:text-blue-400 underline">Terms of Service</span>,{" "}
              <span className="text-blue-600 dark:text-blue-400 underline">Acceptable Use Policy</span>, and{" "}
              <span className="text-blue-600 dark:text-blue-400 underline">99.995% SLA</span>.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-9 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <span>Creating account & sending OTP...</span>
          ) : (
            <>
              <span>Continue to Email Verification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Already have a CloudNova account?{" "}
        <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
