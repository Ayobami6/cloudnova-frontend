"use client";

import React from "react";
import { CloudProvider } from "@/lib/store/cloud-context";
import { ThemeProvider } from "@/lib/store/theme-context";
import { AuthProvider } from "@/lib/store/auth-context";
import { BillingProvider } from "@/lib/store/billing-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BillingProvider>
          <CloudProvider>{children}</CloudProvider>
        </BillingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
