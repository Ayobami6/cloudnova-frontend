"use client";

import React, { useState } from "react";
import { X, Server, ShieldCheck, Check, Cpu } from "lucide-react";
import { useCloud } from "@/lib/store/cloud-context";
import { REGIONS, OS_IMAGES, COMPUTE_PLANS } from "@/lib/mock-data/initial-state";
import { DatacenterRegion, OSImageId } from "@/lib/types/cloud";

export function DeployDropletModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { createInstance, clients } = useCloud();

  const [hostname, setHostname] = useState("app-server-edge");
  const [selectedRegion, setSelectedRegion] = useState<DatacenterRegion>("nyc1");
  const [selectedImage, setSelectedImage] = useState<OSImageId>("ubuntu-24-04");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("plan-std-4g");
  const [tags, setTags] = useState("production, web");
  const [selectedClient, setSelectedClient] = useState<string>("");

  if (!isOpen) return null;

  const currentPlan = COMPUTE_PLANS.find((p) => p.id === selectedPlanId) || COMPUTE_PLANS[2];

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161922] border border-[#232736] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="h-14 bg-[#11131A] border-b border-[#232736] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-100">Provision New Compute Droplet</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-white/[0.06]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Hostname */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Droplet Hostname</label>
            <input
              type="text"
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
              required
              className="w-full h-9 px-3 rounded-md bg-[#11131A] border border-[#232736] text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 1. Datacenter Region */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">1. Select Datacenter Region</label>
            <div className="grid grid-cols-4 gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRegion(r.id)}
                  className={`p-2.5 rounded-md text-left transition-colors border ${
                    selectedRegion === r.id
                      ? "bg-blue-600/12 border-blue-500/50 text-slate-100"
                      : "bg-[#11131A] border-[#232736] text-slate-400 hover:text-slate-200 hover:border-[#33394D]"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span>{r.flag} {r.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">{r.pingMs}ms</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{r.country}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. OS Image */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">2. Operating System</label>
            <div className="grid grid-cols-4 gap-2">
              {OS_IMAGES.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImage(img.id)}
                  className={`p-2.5 rounded-md text-left transition-colors border ${
                    selectedImage === img.id
                      ? "bg-blue-600/12 border-blue-500/50 text-slate-100"
                      : "bg-[#11131A] border-[#232736] text-slate-400 hover:text-slate-200 hover:border-[#33394D]"
                  }`}
                >
                  <span className="text-xs font-medium block">{img.name}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{img.version}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Hardware Plan */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">3. Hardware Specification</label>
            <div className="space-y-1.5">
              {COMPUTE_PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`w-full p-3 rounded-md text-left flex items-center justify-between transition-colors border ${
                    selectedPlanId === plan.id
                      ? "bg-blue-600/12 border-blue-500/50 text-slate-100"
                      : "bg-[#11131A] border-[#232736] text-slate-400 hover:text-slate-200 hover:border-[#33394D]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Cpu className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-xs font-semibold text-slate-200">{plan.name}</span>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        {plan.vcpu} vCPU • {plan.ramGb} GB RAM • {plan.diskGb} GB NVMe • {plan.transferTb} TB Transfer
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-semibold text-slate-100">
                      ${plan.retailMonthly}/mo
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block">
                      ${plan.hourlyRetail.toFixed(3)}/hr
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tags & Sub-account */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Tags (comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="web, production, k8s"
                className="w-full h-9 px-3 rounded-md bg-[#11131A] border border-[#232736] text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Assign to Client Sub-account</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full h-9 px-3 rounded-md bg-[#11131A] border border-[#232736] text-xs text-slate-200 focus:outline-none focus:border-blue-500"
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
          <div className="pt-4 border-t border-[#232736] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500">Projected cost:</span>
              <p className="text-sm font-mono font-semibold text-slate-100">
                ${currentPlan.retailMonthly}/month ({`$${currentPlan.hourlyRetail}/hr`})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-3.5 rounded-md bg-[#1E2230] hover:bg-[#252B3D] border border-[#232736] text-xs font-medium text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
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
