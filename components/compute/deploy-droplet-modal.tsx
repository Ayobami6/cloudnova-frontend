"use client";

import React, { useState } from "react";
import { useCloud } from "@/lib/store/cloud-context";
import { REGIONS, OS_IMAGES, COMPUTE_PLANS } from "@/lib/mock-data/initial-state";
import { DatacenterRegion, OSImageId } from "@/lib/types/cloud";
import { useBilling } from "@/lib/store/billing-context";
import { MaterialIcon } from "@/components/ui/material-icon";

export function DeployDropletModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { createInstance, clients } = useCloud();
  const { formatMoney } = useBilling();

  const [hostname, setHostname] = useState("app-server-edge");
  const [selectedRegion, setSelectedRegion] = useState<DatacenterRegion>("nyc1");
  const [selectedImage, setSelectedImage] = useState<OSImageId>("ubuntu-24-04");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("plan-std-4g");
  const [tags, setTags] = useState("production, web");
  const [selectedClient, setSelectedClient] = useState<string>("");

  if (!isOpen) return null;

  const currentPlan =
    COMPUTE_PLANS.find((p) => p.id === selectedPlanId) || COMPUTE_PLANS[2];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInstance({
      name: hostname.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      region: selectedRegion,
      image: selectedImage,
      planId: selectedPlanId,
      tags,
      enableBackups: false,
      enableMonitoring: true,
      sshKeyName: "id_ed25519_default",
      clientId: selectedClient || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] rounded-[28px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="h-16 bg-white dark:bg-[#1C2029] border-b border-[#E7E4DF] dark:border-[#282D3A] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#E6D8EA] text-[#1E1E1E] flex items-center justify-center">
              <MaterialIcon name="dns" size={18} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[#1E1E1E] dark:text-white">
                Provision New Compute Droplet
              </h3>
              <p className="text-[11px] text-[#8C8B87]">
                KVM hardware virtualization • NVMe Gen4 storage
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F6F6F4] dark:bg-[#232834] text-[#5A5A58] hover:text-[#1E1E1E] dark:hover:text-white flex items-center justify-center cursor-pointer"
          >
            <MaterialIcon name="close" size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Hostname */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1E1E1E] dark:text-slate-200">
              Droplet Hostname
            </label>
            <input
              type="text"
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
              required
              className="w-full h-10 px-4 rounded-full bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-mono text-[#1E1E1E] dark:text-white focus:outline-none focus:border-[#222222]"
            />
          </div>

          {/* 1. Datacenter Region */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#1E1E1E] dark:text-slate-200">
              1. Select Datacenter Region
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRegion(r.id)}
                  className={`p-3 rounded-2xl text-left transition-all cursor-pointer ${
                    selectedRegion === r.id
                      ? "bg-[#CFE0EC] text-[#1E1E1E] ring-2 ring-[#222222] shadow-2xs"
                      : "bg-white dark:bg-[#1C2029] text-[#5A5A58] dark:text-slate-300 hover:bg-[#EFECE8]"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span>
                      {r.flag} {r.name}
                    </span>
                    <span className="text-[10px] font-mono opacity-75">
                      {r.pingMs}ms
                    </span>
                  </div>
                  <span className="text-[10px] opacity-75 block mt-0.5">
                    {r.country}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. OS Image */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#1E1E1E] dark:text-slate-200">
              2. Operating System
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {OS_IMAGES.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImage(img.id)}
                  className={`p-3 rounded-2xl text-left transition-all cursor-pointer ${
                    selectedImage === img.id
                      ? "bg-[#E6D8EA] text-[#1E1E1E] ring-2 ring-[#222222] shadow-2xs"
                      : "bg-white dark:bg-[#1C2029] text-[#5A5A58] dark:text-slate-300 hover:bg-[#EFECE8]"
                  }`}
                >
                  <span className="text-xs font-semibold block">{img.name}</span>
                  <span className="text-[10px] opacity-75 block mt-0.5">
                    {img.version}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Hardware Plan */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#1E1E1E] dark:text-slate-200">
              3. Hardware Specification
            </label>
            <div className="space-y-2">
              {COMPUTE_PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`w-full p-3.5 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedPlanId === plan.id
                      ? "bg-[#F8D568] text-[#1E1E1E] ring-2 ring-[#222222] shadow-2xs"
                      : "bg-white dark:bg-[#1C2029] text-[#5A5A58] dark:text-slate-300 hover:bg-[#EFECE8]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-white/80 text-[#1E1E1E] flex items-center justify-center">
                      <MaterialIcon name="memory" size={16} />
                    </span>
                    <div>
                      <span className="text-xs font-semibold block">
                        {plan.name}
                      </span>
                      <span className="text-[11px] opacity-80 block mt-0.5">
                        {plan.vcpu} vCPU • {plan.ramGb} GB RAM • {plan.diskGb} GB NVMe •{" "}
                        {plan.transferTb} TB Transfer
                      </span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs font-bold block">
                      {formatMoney(plan.retailMonthly)}/mo
                    </span>
                    <span className="text-[10px] opacity-75 block">
                      {formatMoney(plan.hourlyRetail, 3)}/hr
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tags & Sub-account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1E1E1E] dark:text-slate-200">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="web, production, k8s"
                className="w-full h-10 px-4 rounded-full bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1E1E1E] dark:text-slate-200">
                Assign to Client Sub-account
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full h-10 px-4 rounded-full bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-white focus:outline-none"
              >
                <option value="">(Internal Platform Ops)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-[#E7E4DF] dark:border-[#282D3A] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#8C8B87]">Projected cost:</span>
              <p className="text-sm font-mono font-semibold text-[#1E1E1E] dark:text-white">
                {formatMoney(currentPlan.retailMonthly)}/month (
                {formatMoney(currentPlan.hourlyRetail, 3)}/hr)
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-5 rounded-full bg-white dark:bg-[#232834] text-xs font-medium text-[#5A5A58] dark:text-slate-200 hover:text-[#1E1E1E] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 px-6 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:text-[#1E1E1E] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Deploy Droplet
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
