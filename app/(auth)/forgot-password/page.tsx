"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, RotateCw } from "lucide-react";
import { useAuth } from "@/lib/store/auth-context";
import { ForgotPasswordRequestSchema, ResetPasswordWithOtpSchema } from "@/lib/schemas/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { requestPasswordReset, resetPasswordWithOtp, resendOtp, generatedOtp, isLoading } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("alex.chen@cloudnova.io");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(30);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 2 && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdown]);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = ForgotPasswordRequestSchema.safeParse({ email });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Please enter a valid email");
      return;
    }

    const res = await requestPasswordReset(email);
    if (res.success) {
      setStep(2);
      setCountdown(30);
    } else {
      setError(res.error || "Failed to dispatch reset code");
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (!/^\d*$/.test(char)) return;

    const next = [...digits];
    next[index] = char;
    setDigits(next);

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
      setDigits(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleQuickFillResetOtp = () => {
    const code = generatedOtp || "491028";
    setDigits(code.split(""));
    setError(null);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const otp = digits.join("");
    const validation = ResetPasswordWithOtpSchema.safeParse({
      email,
      otp,
      newPassword,
      confirmPassword,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Please check all fields");
      return;
    }

    const res = await resetPasswordWithOtp(email, otp, newPassword);
    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } else {
      setError(res.error || "Failed to reset password");
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError(null);
    await resendOtp(email, "reset");
    setCountdown(30);
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Request Reset Code */}
      {step === 1 && (
        <>
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 shadow-xs">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Reset Your Password
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your registered work email to receive a secure 6-digit OTP verification code.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Work Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.chen@cloudnova.io"
                  required
                  className="w-full h-9 pl-9 pr-3 rounded-md bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-9 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Sending Code...</span>
              ) : (
                <>
                  <span>Send 6-Digit OTP Code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </>
      )}

      {/* Step 2: Verify OTP & Enter New Password */}
      {step === 2 && (
        <>
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Enter Reset Code & New Password
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verify the 6-digit OTP code sent to{" "}
              <span className="font-mono font-medium text-slate-900 dark:text-slate-200">{email}</span>
            </p>
          </div>

          {/* Test OTP Helper */}
          <div className="p-3.5 rounded-lg bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-between gap-3">
            <div className="text-xs text-blue-900 dark:text-blue-300">
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Testing Mode
              </span>
              <span className="text-[11px] text-blue-700 dark:text-blue-400">
                Sample Reset OTP: <span className="font-mono font-semibold">{generatedOtp || "491028"}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={handleQuickFillResetOtp}
              className="h-7 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-xs transition-colors"
            >
              Use Reset OTP
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Password successfully updated! Redirecting to Sign In...</span>
            </div>
          )}

          <form onSubmit={handleStep2Submit} className="space-y-4">
            {/* 6 Digit OTP input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">6-Digit Verification Code</label>
              <div className="flex items-center justify-between gap-2" onPaste={handlePaste}>
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
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-10 h-11 sm:w-11 sm:h-12 text-center font-mono text-base font-semibold rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-xs"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 symbol"
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="w-full h-9 pl-9 pr-3 rounded-md bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full h-9 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <span>Reset Password & Proceed to Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Resend & Back */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-[#232736]">
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0}
              className={`flex items-center gap-1.5 ${
                countdown > 0 ? "text-slate-400 cursor-not-allowed" : "text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              }`}
            >
              <RotateCw className="w-3 h-3" />
              <span>{countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              Change Email
            </button>
          </div>
        </>
      )}

      {/* Back to Login Link */}
      <div className="pt-2 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
}
