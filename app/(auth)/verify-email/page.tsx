"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, CheckCircle2, AlertCircle, ArrowRight, RotateCw, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "@/lib/store/auth-context";
import { VerifyOtpSchema } from "@/lib/schemas/auth";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmailOtp, resendOtp, pendingVerificationEmail, generatedOtp, isLoading } = useAuth();

  const email = searchParams.get("email") || pendingVerificationEmail || "alex.chen@cloudnova.io";

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(30);
  const [resendSuccess, setResendSuccess] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 30s countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, val: string) => {
    // Take only last character typed if not pasting
    const char = val.slice(-1);
    if (!/^\d*$/.test(char)) return;

    const nextDigits = [...digits];
    nextDigits[index] = char;
    setDigits(nextDigits);

    // Auto-advance to next input
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim().slice(0, 6);
    if (/^\d{6}$/.test(pasted)) {
      const nextDigits = pasted.split("");
      setDigits(nextDigits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleQuickFill = () => {
    const code = generatedOtp || "849201";
    setDigits(code.split(""));
    setError(null);
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const fullOtp = digits.join("");
    const validation = VerifyOtpSchema.safeParse({ email, otp: fullOtp });
    if (!validation.success) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    const res = await verifyEmailOtp(email, fullOtp);
    if (res.success) {
      setIsSuccess(true);
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#2563eb", "#10b981", "#38bdf8"],
        });
      } catch {
        // canvas fallback
      }
      setTimeout(() => {
        router.push("/overview");
      }, 1200);
    } else {
      setError(res.error || "Invalid verification code");
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError(null);
    setResendSuccess(true);
    await resendOtp(email, "verification");
    setCountdown(30);
    setTimeout(() => setResendSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 shadow-xs">
          <Mail className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Verify Your Email
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          We sent a 6-digit verification code to{" "}
          <span className="font-mono font-medium text-slate-900 dark:text-slate-200">{email}</span>
        </p>
      </div>

      {/* Test Code Quick Fill */}
      <div className="p-3.5 rounded-lg bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-between gap-3">
        <div className="text-xs text-blue-900 dark:text-blue-300">
          <span className="font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Testing Environment
          </span>
          <span className="text-[11px] text-blue-700 dark:text-blue-400">
            Sample OTP code: <span className="font-mono font-semibold">{generatedOtp || "849201"}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={handleQuickFill}
          className="h-7 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-xs transition-colors"
        >
          Use Sample OTP
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success alert */}
      {isSuccess && (
        <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Email verified! Redirecting to CloudNova console...</span>
        </div>
      )}

      {/* 6 Digit Pin Form */}
      <form onSubmit={handleVerify} className="space-y-6">
        <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-11 h-12 sm:w-12 sm:h-14 text-center font-mono text-lg font-semibold rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-xs"
              autoFocus={idx === 0}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || isSuccess || digits.join("").length !== 6}
          className="w-full h-9 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <span>Verifying...</span>
          ) : isSuccess ? (
            <span>Verified!</span>
          ) : (
            <>
              <span>Verify & Launch Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Resend & Edit Email */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-[#232736]">
        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0}
          className={`flex items-center gap-1.5 ${
            countdown > 0
              ? "text-slate-400 cursor-not-allowed"
              : "text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          }`}
        >
          <RotateCw className="w-3 h-3" />
          <span>
            {countdown > 0 ? `Resend code in ${countdown}s` : "Resend 6-digit code"}
          </span>
        </button>

        <Link href="/register" className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
          Wrong email? Edit
        </Link>
      </div>

      {resendSuccess && (
        <p className="text-center text-xs text-emerald-600 dark:text-emerald-400">
          A new 6-digit code has been dispatched to {email}.
        </p>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading verification...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
