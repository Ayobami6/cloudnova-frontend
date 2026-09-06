"use client";

import React from "react";
import { CloudProvider } from "@/lib/store/cloud-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <CloudProvider>{children}</CloudProvider>;
}
