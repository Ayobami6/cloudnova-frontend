"use client";

import React from "react";
import { CloudProvider } from "@/lib/store/cloud-context";
import { ThemeProvider } from "@/lib/store/theme-context";
import { AuthProvider } from "@/lib/store/auth-context";
import { BillingProvider } from "@/lib/store/billing-context";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BillingProvider>
          <ToastProvider>
            <CloudProvider>{children}</CloudProvider>
          </ToastProvider>
        </BillingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
