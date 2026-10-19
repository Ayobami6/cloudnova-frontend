"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Building, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/store/auth-context";
import { RegisterSchema } from "@/lib/schemas/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle, loginWithGithub, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    const res = await loginWithGoogle();
    if (res.success) {
      router.push("/overview");
    } else if (res.error) {
      setError(res.error);
    }
  };

  const handleGithubLogin = async () => {
    setError(null);
    const res = await loginWithGithub();
    if (res.success) {
      router.push("/overview");
    } else if (res.error) {
      setError(res.error);
    }
  };

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
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-[#4EA871] dark:text-[#56B87C] border border-emerald-500/20 text-[11px] font-mono mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>$200 Free Cloud Credit Included</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1E1E1E] dark:text-white">
          Create CloudNova Account
        </h1>
        <p className="text-xs text-[#8C8B87] dark:text-slate-400 mt-1">
          Deploy high-performance KVM droplets and managed databases in seconds.
        </p>
      </div>

      {/* Social Logins */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="h-9 px-3 rounded-md bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] hover:bg-slate-50 dark:hover:bg-[#1e222e] text-xs font-medium text-[#1E1E1E] dark:text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Google</span>
        </button>

        <button
          type="button"
          onClick={handleGithubLogin}
          disabled={isLoading}
          className="h-9 px-3 rounded-md bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] hover:bg-slate-50 dark:hover:bg-[#1e222e] text-xs font-medium text-[#1E1E1E] dark:text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0 fill-current text-[#1E1E1E] dark:text-slate-200" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          <span>GitHub</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E7E4DF] dark:border-[#282D3A]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-50 dark:bg-[#0f1117] px-2 text-slate-500 text-[10px] tracking-wider font-medium">
            Or register with email
          </span>
        </div>
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
                className="w-full h-9 pl-9 pr-3 rounded-md bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
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
                className="w-full h-9 pl-9 pr-3 rounded-md bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
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
              className="w-full h-9 pl-9 pr-3 rounded-md bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
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
              className="w-full h-9 pl-9 pr-10 rounded-md bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
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
          className="w-full h-9 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:text-[#1E1E1E] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
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
      <p className="text-center text-xs text-[#8C8B87] dark:text-slate-400">
        Already have a CloudNova account?{" "}
        <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
