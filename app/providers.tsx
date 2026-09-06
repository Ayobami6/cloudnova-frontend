"use client";

import React from "react";
import { CloudProvider } from "@/lib/store/cloud-context";
import { ThemeProvider } from "@/lib/store/theme-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CloudProvider>{children}</CloudProvider>
    </ThemeProvider>
  );
}
