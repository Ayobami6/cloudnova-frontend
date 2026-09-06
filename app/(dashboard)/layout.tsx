"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { TerminalModal } from "@/components/layout/terminal-modal";
import { DepositModal } from "@/components/layout/deposit-modal";
import { DeployDropletModal } from "@/components/compute/deploy-droplet-modal";
import { useCloud } from "@/lib/store/cloud-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { terminalInstance, setTerminalInstance, isDepositModalOpen, setIsDepositModalOpen } =
    useCloud();
  const [isDeployOpen, setIsDeployOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090A0F]">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onOpenDeploy={() => setIsDeployOpen(true)} />

        <main className="flex-1 overflow-y-auto px-6 lg:px-8 py-6 w-full space-y-6">
          {children}
        </main>
      </div>

      {/* Global Modals & Overlays */}
      <TerminalModal instance={terminalInstance} onClose={() => setTerminalInstance(null)} />
      <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} />
      <DeployDropletModal isOpen={isDeployOpen} onClose={() => setIsDeployOpen(false)} />
    </div>
  );
}
