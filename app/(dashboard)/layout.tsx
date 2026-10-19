"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { RightInspectorPanel } from "@/components/layout/right-inspector-panel";
import { TerminalModal } from "@/components/layout/terminal-modal";
import { DepositModal } from "@/components/layout/deposit-modal";
import { DeployDropletModal } from "@/components/compute/deploy-droplet-modal";
import { useCloud } from "@/lib/store/cloud-context";
import { useBilling } from "@/lib/store/billing-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { terminalInstance, setTerminalInstance } = useCloud();
  const { isDepositModalOpen, setIsDepositModalOpen } = useBilling();
  const [isDeployOpen, setIsDeployOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#222222] dark:bg-[#14161B] text-[#1E1E1E] dark:text-[#F4F5F7]">
      {/* Left Slim Matte-Charcoal Icon Rail */}
      <Sidebar />

      {/* Rounded Warm Alabaster Main Sheet + Right Stone Inspector Panel */}
      <div className="flex-1 flex min-w-0 h-full overflow-hidden bg-[#F6F6F4] dark:bg-[#0F1115] rounded-l-[32px] shadow-2xl">
        {/* Center Workspace Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header onOpenDeploy={() => setIsDeployOpen(true)} />

          <main className="flex-1 overflow-y-auto px-6 lg:px-8 pb-8 pt-2 w-full space-y-6">
            {children}
          </main>
        </div>

        {/* Right Contextual Stone Inspector Panel (Exact Dribbble Match) */}
        <RightInspectorPanel onOpenDeploy={() => setIsDeployOpen(true)} />
      </div>

      {/* Global Modals & Overlays */}
      <TerminalModal
        instance={terminalInstance}
        onClose={() => setTerminalInstance(null)}
      />
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
      <DeployDropletModal
        isOpen={isDeployOpen}
        onClose={() => setIsDeployOpen(false)}
      />
    </div>
  );
}
