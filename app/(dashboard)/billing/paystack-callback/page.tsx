"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Clock, ArrowRight } from "lucide-react";
import * as billingApi from "@/lib/api/billing";
import { useBilling } from "@/lib/store/billing-context";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 20; // ~60 seconds

type PollStatus = "polling" | "credited" | "timed_out";

function PaystackCallbackContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const { walletBalance: contextBalance, refreshAll } = useBilling();

  const [status, setStatus] = useState<PollStatus>("polling");
  const [pollCount, setPollCount] = useState(0);
  const initialBalanceRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    initialBalanceRef.current = contextBalance;

    const poll = async () => {
      for (let attempt = 0; attempt < MAX_POLLS; attempt++) {
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        if (cancelled) return;

        try {
          const balance = await billingApi.getBalance();
          const current = Number(balance.balance);
          setPollCount(attempt + 1);

          if (initialBalanceRef.current === null || current > initialBalanceRef.current) {
            await refreshAll();
            if (!cancelled) setStatus("credited");
            return;
          }
        } catch {
          // Transient failure - keep polling rather than surfacing an error;
          // the webhook may still land within the polling window.
        }
      }
      if (!cancelled) setStatus("timed_out");
    };

    poll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-md mx-auto mt-16 p-8 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] text-center space-y-4">
      {status === "polling" && (
        <>
          <Loader2 className="w-10 h-10 text-blue-500 mx-auto animate-spin" />
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Confirming your payment</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Paystack is processing your transaction{reference ? ` (ref: ${reference})` : ""}. Your
            balance updates automatically once the payment is confirmed - this usually takes a few
            seconds.
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            Checking... ({pollCount}/{MAX_POLLS})
          </p>
        </>
      )}

      {status === "credited" && (
        <>
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Payment confirmed</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your prepaid cloud balance has been credited.
          </p>
          <Link
            href="/billing"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <span>Back to Billing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </>
      )}

      {status === "timed_out" && (
        <>
          <Clock className="w-10 h-10 text-amber-500 mx-auto" />
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Still processing</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            We haven&apos;t seen the credit land yet. This can happen if Paystack&apos;s webhook is
            delayed - your balance will update automatically once it arrives. Feel free to check back
            on the billing page.
          </p>
          <Link
            href="/billing"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-slate-100 dark:bg-[#1E2230] hover:bg-slate-200 dark:hover:bg-[#252B3D] border border-slate-200 dark:border-[#232736] text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <span>Back to Billing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </>
      )}
    </div>
  );
}

export default function PaystackCallbackPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading...</div>}>
      <PaystackCallbackContent />
    </Suspense>
  );
}
