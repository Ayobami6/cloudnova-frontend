"use client";

import React, { useState } from "react";
import { X, CreditCard, Building2, Coins, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useCloud } from "@/lib/store/cloud-context";

export function DepositModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { depositFunds } = useCloud();
  const [selectedAmount, setSelectedAmount] = useState<number>(250);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "wire" | "crypto">("card");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const presets = [50, 100, 250, 500, 1000];
  const finalAmount = customAmount && Number(customAmount) > 0 ? Number(customAmount) : selectedAmount;

  const handleDeposit = () => {
    if (finalAmount <= 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      let desc = "Credit Card •••• 4242";
      if (paymentMethod === "wire") desc = "ACH / FedNow Instant Wire";
      if (paymentMethod === "crypto") desc = "USDC Instant Settlement (Base)";

      depositFunds(finalAmount, desc);
      setIsProcessing(false);
      setSuccessMessage(`Successfully credited $${finalAmount.toFixed(2)} to your prepaid balance.`);

      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#2563eb", "#10b981", "#38bdf8"],
        });
      } catch {
        // ignore if canvas not supported
      }

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161922] border border-[#232736] rounded-lg shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-100">Deposit Prepaid Cloud Funds</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Funds are debited hourly based on active VM and storage burn.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-white/[0.06]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMessage ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-2 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            <p className="text-sm font-medium text-slate-200">{successMessage}</p>
          </div>
        ) : (
          <>
            {/* Amount Presets */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Select Deposit Amount (USD)</label>
              <div className="grid grid-cols-5 gap-2">
                {presets.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount("");
                    }}
                    className={`h-9 rounded-md text-xs font-mono font-medium transition-colors ${
                      selectedAmount === amt && !customAmount
                        ? "bg-blue-600 text-white font-semibold shadow-sm"
                        : "bg-[#1E2230] text-slate-300 hover:bg-[#252B3D] border border-[#232736]"
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Or enter custom amount ($)"
                className="w-full h-9 px-3 rounded-md bg-[#11131A] border border-[#232736] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 mt-2"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Funding Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-md text-xs flex flex-col items-center gap-1.5 transition-colors ${
                    paymentMethod === "card"
                      ? "bg-blue-600/12 text-blue-400 border border-blue-600/40"
                      : "bg-[#1E2230] text-slate-400 border border-[#232736] hover:text-slate-200"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="font-medium">Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("wire")}
                  className={`p-3 rounded-md text-xs flex flex-col items-center gap-1.5 transition-colors ${
                    paymentMethod === "wire"
                      ? "bg-blue-600/12 text-blue-400 border border-blue-600/40"
                      : "bg-[#1E2230] text-slate-400 border border-[#232736] hover:text-slate-200"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium">FedNow Wire</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("crypto")}
                  className={`p-3 rounded-md text-xs flex flex-col items-center gap-1.5 transition-colors ${
                    paymentMethod === "crypto"
                      ? "bg-blue-600/12 text-blue-400 border border-blue-600/40"
                      : "bg-[#1E2230] text-slate-400 border border-[#232736] hover:text-slate-200"
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span className="font-medium">USDC Crypto</span>
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-[#232736] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500">Total charge:</span>
                <p className="text-base font-mono font-semibold text-slate-100">${finalAmount.toFixed(2)}</p>
              </div>
              <button
                onClick={handleDeposit}
                disabled={isProcessing || finalAmount <= 0}
                className="h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                {isProcessing ? "Settling Funds..." : "Confirm & Deposit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
