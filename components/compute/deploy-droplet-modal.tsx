"use client";

import React, { useState } from "react";
import { useCloud } from "@/lib/store/cloud-context";
import { REGIONS, OS_IMAGES, COMPUTE_PLANS } from "@/lib/mock-data/initial-state";
import { DatacenterRegion, OSImageId } from "@/lib/types/cloud";
import { useBilling } from "@/lib/store/billing-context";
import { MaterialIcon } from "@/components/ui/material-icon";

const HARDWARE_TIERS = [
  { id: "all", label: "All Plans" },
  { id: "basic", label: "Basic" },
  { id: "general", label: "General Purpose" },
  { id: "cpu-optimized", label: "CPU-Optimized" },
  { id: "memory-optimized", label: "Memory-Optimized" },
  { id: "gpu-ai", label: "GPU AI" },
] as const;

type HardwareTierFilter = (typeof HARDWARE_TIERS)[number]["id"];

export function DeployDropletModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    createInstance,
    clients,
    plans,
    vpcs,
    firewalls,
    sshKeys,
    createVPC,
    createFirewall,
    createSSHKey,
  } = useCloud();
  const { formatMoney } = useBilling();

  const availablePlans = plans && plans.length > 0 ? plans : COMPUTE_PLANS;

  const [hostname, setHostname] = useState("app-server-edge");
  const [selectedRegion, setSelectedRegion] = useState<DatacenterRegion>("nyc1");
  const [selectedImage, setSelectedImage] = useState<OSImageId>("ubuntu-24-04");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("basic-1x1");
  const [selectedTier, setSelectedTier] = useState<HardwareTierFilter>("all");
  const [tags, setTags] = useState("production, web");
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedVpcId, setSelectedVpcId] = useState<string>("");
  const [selectedSecurityGroupIds, setSelectedSecurityGroupIds] = useState<string[]>([]);
  const [selectedSshKeyIds, setSelectedSshKeyIds] = useState<string[]>([]);

  // Inline Creation Dialog States
  const [isCreateVpcOpen, setIsCreateVpcOpen] = useState(false);
  const [newVpcName, setNewVpcName] = useState("");
  const [newVpcCidr, setNewVpcCidr] = useState("10.10.0.0/16");
  const [isSubmittingVpc, setIsSubmittingVpc] = useState(false);

  const [isCreateSgOpen, setIsCreateSgOpen] = useState(false);
  const [newSgName, setNewSgName] = useState("");
  const [newSgPreset, setNewSgPreset] = useState<"web" | "ssh" | "custom">("web");
  const [isSubmittingSg, setIsSubmittingSg] = useState(false);

  const [isCreateSshOpen, setIsCreateSshOpen] = useState(false);
  const [newSshName, setNewSshName] = useState("");
  const [newSshPublicKey, setNewSshPublicKey] = useState("");
  const [isSubmittingSsh, setIsSubmittingSsh] = useState(false);
  const [sshError, setSshError] = useState("");

  const availableVpcs = React.useMemo(() => {
    return vpcs.filter((v) => v.region === selectedRegion);
  }, [vpcs, selectedRegion]);

  React.useEffect(() => {
    const defaultVpc = availableVpcs.find((v) => v.isDefault) || availableVpcs[0];
    if (defaultVpc) {
      setSelectedVpcId(defaultVpc.id);
    } else {
      setSelectedVpcId("");
    }
  }, [availableVpcs]);

  React.useEffect(() => {
    if (firewalls.length > 0 && selectedSecurityGroupIds.length === 0) {
      const defaultSg =
        firewalls.find((f) => f.name.includes("default") || f.name.includes("web")) ||
        firewalls[0];
      if (defaultSg) {
        setSelectedSecurityGroupIds([defaultSg.id]);
      }
    }
  }, [firewalls, selectedSecurityGroupIds.length]);

  React.useEffect(() => {
    if (sshKeys.length > 0 && selectedSshKeyIds.length === 0) {
      setSelectedSshKeyIds([sshKeys[0].id]);
    }
  }, [sshKeys, selectedSshKeyIds.length]);

  const handleCreateVpc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVpcName.trim()) return;
    setIsSubmittingVpc(true);
    try {
      const vpc = await createVPC(
        newVpcName.trim(),
        selectedRegion,
        newVpcCidr.trim() || "10.10.0.0/16"
      );
      setSelectedVpcId(vpc.id);
      setIsCreateVpcOpen(false);
      setNewVpcName("");
    } catch {
      // toast handled in context
    } finally {
      setIsSubmittingVpc(false);
    }
  };

  const handleCreateSecurityGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSgName.trim()) return;
    setIsSubmittingSg(true);
    try {
      const rules =
        newSgPreset === "web"
          ? [
              {
                id: "r1",
                type: "inbound" as const,
                protocol: "tcp" as const,
                ports: "80",
                sources: ["0.0.0.0/0"],
                action: "accept" as const,
                label: "HTTP",
              },
              {
                id: "r2",
                type: "inbound" as const,
                protocol: "tcp" as const,
                ports: "443",
                sources: ["0.0.0.0/0"],
                action: "accept" as const,
                label: "HTTPS",
              },
              {
                id: "r3",
                type: "inbound" as const,
                protocol: "tcp" as const,
                ports: "22",
                sources: ["0.0.0.0/0"],
                action: "accept" as const,
                label: "SSH",
              },
            ]
          : [
              {
                id: "r1",
                type: "inbound" as const,
                protocol: "tcp" as const,
                ports: "22",
                sources: ["0.0.0.0/0"],
                action: "accept" as const,
                label: "SSH",
              },
            ];
      const sg = await createFirewall(newSgName.trim(), rules);
      setSelectedSecurityGroupIds((prev) => [...prev, sg.id]);
      setIsCreateSgOpen(false);
      setNewSgName("");
    } catch {
      // toast handled in context
    } finally {
      setIsSubmittingSg(false);
    }
  };

  const handleCreateSshKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSshError("");
    if (!newSshName.trim()) {
      setSshError("Please provide a name for this key.");
      return;
    }
    const cleanKey = newSshPublicKey.trim();
    if (!cleanKey) {
      setSshError("Please paste an OpenSSH public key.");
      return;
    }
    if (!cleanKey.startsWith("ssh-") && !cleanKey.startsWith("ecdsa-")) {
      setSshError("Invalid format: Public key must begin with 'ssh-ed25519', 'ssh-rsa', or 'ecdsa-'.");
      return;
    }

    setIsSubmittingSsh(true);
    try {
      const key = await createSSHKey(newSshName.trim(), cleanKey);
      setSelectedSshKeyIds((prev) => [...prev, key.id]);
      setIsCreateSshOpen(false);
      setNewSshName("");
      setNewSshPublicKey("");
    } catch (err: unknown) {
      setSshError(err instanceof Error ? err.message : "Failed to register SSH key.");
    } finally {
      setIsSubmittingSsh(false);
    }
  };

  const filteredPlans = React.useMemo(() => {
    if (selectedTier === "all") return availablePlans;
    return availablePlans.filter((p) => p.tier === selectedTier);
  }, [availablePlans, selectedTier]);

  const handleTierChange = (tier: HardwareTierFilter) => {
    setSelectedTier(tier);
    const inTier = tier === "all" ? availablePlans : availablePlans.filter((p) => p.tier === tier);
    if (inTier.length > 0 && !inTier.some((p) => p.id === selectedPlanId)) {
      setSelectedPlanId(inTier[0].id);
    }
  };

  if (!isOpen) return null;

  const currentPlan =
    filteredPlans.find((p) => p.id === selectedPlanId) ||
    availablePlans.find((p) => p.id === selectedPlanId) ||
    filteredPlans[0] ||
    availablePlans[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInstance({
      name: hostname.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      region: selectedRegion,
      image: selectedImage,
      planId: currentPlan.id,
      tags,
      enableBackups: false,
      enableMonitoring: true,
      sshKeyName: "id_ed25519_default",
      clientId: selectedClient || undefined,
      vpcId: selectedVpcId || undefined,
      securityGroupIds: selectedSecurityGroupIds,
      sshKeyIds: selectedSshKeyIds,
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
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <label className="text-xs font-semibold text-[#1E1E1E] dark:text-slate-200">
                3. Hardware Specification
              </label>
              <span className="text-[11px] text-[#8C8B87]">
                {filteredPlans.length} {filteredPlans.length === 1 ? "plan" : "plans"} available
              </span>
            </div>

            {/* Hardware Tier Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {HARDWARE_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => handleTierChange(tier.id)}
                  className={`h-7 px-3 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedTier === tier.id
                      ? "bg-[#222222] text-white dark:bg-white dark:text-[#1E1E1E]"
                      : "bg-[#EFECE8] dark:bg-[#232834] text-[#5A5A58] dark:text-slate-300 hover:text-[#1E1E1E] dark:hover:text-white"
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-72 sm:max-h-80 overflow-y-auto pr-1">
              {filteredPlans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`w-full p-3.5 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer ${
                    currentPlan?.id === plan.id
                      ? "bg-[#F8D568] text-[#1E1E1E] ring-2 ring-[#222222] shadow-2xs"
                      : "bg-white dark:bg-[#1C2029] text-[#5A5A58] dark:text-slate-300 hover:bg-[#EFECE8]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-white/80 text-[#1E1E1E] flex items-center justify-center shrink-0">
                      <MaterialIcon name="memory" size={16} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold block">
                          {plan.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EFECE8] dark:bg-[#232834] text-[#5A5A58] dark:text-slate-300 uppercase">
                          {plan.tier}
                        </span>
                      </div>
                      <span className="text-[11px] opacity-80 block mt-0.5">
                        {plan.vcpu} vCPU • {plan.ramGb} GB RAM • {plan.diskGb} GB NVMe •{" "}
                        {plan.transferTb} TB Transfer
                      </span>
                    </div>
                  </div>
                  <div className="text-right font-mono shrink-0">
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

          {/* Networking & Security: VPC and Security Groups */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#1E1E1E] dark:text-slate-200 flex items-center gap-1.5">
                  <MaterialIcon name="lan" size={14} />
                  <span>VPC Network</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setNewVpcName(`vpc-${selectedRegion}`);
                    setIsCreateVpcOpen(true);
                  }}
                  className="text-[11px] font-medium text-[#222222] dark:text-slate-300 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <MaterialIcon name="add" size={13} />
                  <span>New VPC</span>
                </button>
              </div>
              <select
                value={selectedVpcId}
                onChange={(e) => setSelectedVpcId(e.target.value)}
                className="w-full h-10 px-4 rounded-full bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-white focus:outline-none cursor-pointer"
              >
                {availableVpcs.length === 0 ? (
                  <option value="">No VPC in this region (Default Network)</option>
                ) : (
                  availableVpcs.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.cidr}) {v.isDefault ? "• Default" : ""}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#1E1E1E] dark:text-slate-200 flex items-center gap-1.5">
                  <MaterialIcon name="security" size={14} />
                  <span>Security Group(s)</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setNewSgName("web-sg");
                    setIsCreateSgOpen(true);
                  }}
                  className="text-[11px] font-medium text-[#222222] dark:text-slate-300 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <MaterialIcon name="add" size={13} />
                  <span>New SG</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 p-1.5 bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] rounded-2xl min-h-[40px] items-center px-2">
                {firewalls.length === 0 ? (
                  <span className="text-[11px] text-[#8C8B87]">No security groups configured</span>
                ) : (
                  firewalls.map((fw) => {
                    const isSelected = selectedSecurityGroupIds.includes(fw.id);
                    return (
                      <button
                        type="button"
                        key={fw.id}
                        onClick={() => {
                          setSelectedSecurityGroupIds((prev) =>
                            isSelected ? prev.filter((id) => id !== fw.id) : [...prev, fw.id]
                          );
                        }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer border ${
                          isSelected
                            ? "bg-[#222222] text-white dark:bg-white dark:text-[#1E1E1E] border-transparent"
                            : "bg-[#F6F6F4] dark:bg-[#232834] text-[#5A5A58] dark:text-slate-300 border-[#E7E4DF] dark:border-[#282D3A] hover:border-slate-400"
                        }`}
                      >
                        {fw.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* SSH Key Authentication (Encrypted at rest) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-[#1E1E1E] dark:text-slate-200 flex items-center gap-1.5">
                  <MaterialIcon name="key" size={14} />
                  <span>SSH Key Authentication (Encrypted)</span>
                </label>
                <p className="text-[10px] text-[#8C8B87]">
                  Stored with authenticated symmetric encryption at rest. Keys are reusable across droplets.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewSshName("");
                  setNewSshPublicKey("");
                  setSshError("");
                  setIsCreateSshOpen(true);
                }}
                className="text-[11px] font-medium text-[#222222] dark:text-slate-300 hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
              >
                <MaterialIcon name="add" size={13} />
                <span>Add SSH Key</span>
              </button>
            </div>

            {sshKeys.length === 0 ? (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] flex items-center justify-between">
                <span className="text-[11px] text-[#8C8B87]">
                  No SSH keys registered yet. Add a public key for passwordless root SSH access.
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreateSshOpen(true)}
                  className="px-3 py-1 rounded-full bg-[#EFECE8] dark:bg-[#232834] text-[11px] font-semibold text-[#1E1E1E] dark:text-white hover:bg-[#E7E4DF] cursor-pointer"
                >
                  + Add Key
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                {sshKeys.map((k) => {
                  const isSelected = selectedSshKeyIds.includes(k.id);
                  return (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => {
                        setSelectedSshKeyIds((prev) =>
                          isSelected ? prev.filter((id) => id !== k.id) : [...prev, k.id]
                        );
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-[#E6D8EA] dark:bg-[#2c2235] border-[#1E1E1E] dark:border-white text-[#1E1E1E] dark:text-white"
                          : "bg-white dark:bg-[#1C2029] border-[#E7E4DF] dark:border-[#282D3A] text-[#5A5A58] dark:text-slate-300 hover:border-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MaterialIcon
                          name={isSelected ? "check_circle" : "key"}
                          size={16}
                          className={isSelected ? "text-[#1E1E1E] dark:text-white" : "text-[#8C8B87]"}
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-semibold truncate block">{k.name}</span>
                          <span className="text-[10px] font-mono text-[#8C8B87] truncate block">
                            {k.fingerprint || "SHA256:..."}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono shrink-0 ml-1 opacity-70">
                        {isSelected ? "Attached" : "Attach"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
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

        {/* Inline Create VPC Dialog */}
        {isCreateVpcOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] rounded-[24px] shadow-2xl p-6 w-full max-w-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[#CFE0EC] text-[#1E1E1E] flex items-center justify-center">
                    <MaterialIcon name="lan" size={16} />
                  </span>
                  <h4 className="text-sm font-semibold text-[#1E1E1E] dark:text-white">
                    Create Virtual Private Cloud
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateVpcOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#F6F6F4] dark:bg-[#232834] flex items-center justify-center text-[#5A5A58] hover:text-[#1E1E1E] cursor-pointer"
                >
                  <MaterialIcon name="close" size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1E1E1E] dark:text-slate-200">
                    VPC Name
                  </label>
                  <input
                    type="text"
                    value={newVpcName}
                    onChange={(e) => setNewVpcName(e.target.value)}
                    placeholder={`vpc-${selectedRegion}`}
                    required
                    className="w-full h-9 px-3 rounded-full bg-[#F6F6F4] dark:bg-[#232834] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-mono text-[#1E1E1E] dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1E1E1E] dark:text-slate-200">
                    Subnet IPv4 CIDR
                  </label>
                  <input
                    type="text"
                    value={newVpcCidr}
                    onChange={(e) => setNewVpcCidr(e.target.value)}
                    placeholder="10.10.0.0/16"
                    required
                    className="w-full h-9 px-3 rounded-full bg-[#F6F6F4] dark:bg-[#232834] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-mono text-[#1E1E1E] dark:text-white focus:outline-none"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-[#F6F6F4] dark:bg-[#232834] text-[11px] text-[#8C8B87]">
                  Region is pinned to <span className="font-semibold text-[#1E1E1E] dark:text-white">{selectedRegion.toUpperCase()}</span> to match this droplet.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateVpcOpen(false)}
                  className="h-8 px-4 rounded-full text-xs text-[#5A5A58] dark:text-slate-300 hover:text-[#1E1E1E] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateVpc}
                  disabled={isSubmittingVpc || !newVpcName.trim()}
                  className="h-8 px-4 rounded-full bg-[#222222] dark:bg-white text-white dark:text-[#1E1E1E] text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingVpc ? "Creating..." : "Create & Attach VPC"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Inline Create Security Group Dialog */}
        {isCreateSgOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] rounded-[24px] shadow-2xl p-6 w-full max-w-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[#F8D568] text-[#1E1E1E] flex items-center justify-center">
                    <MaterialIcon name="security" size={16} />
                  </span>
                  <h4 className="text-sm font-semibold text-[#1E1E1E] dark:text-white">
                    Create Security Group
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateSgOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#F6F6F4] dark:bg-[#232834] flex items-center justify-center text-[#5A5A58] hover:text-[#1E1E1E] cursor-pointer"
                >
                  <MaterialIcon name="close" size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1E1E1E] dark:text-slate-200">
                    Security Group Name
                  </label>
                  <input
                    type="text"
                    value={newSgName}
                    onChange={(e) => setNewSgName(e.target.value)}
                    placeholder="e.g. web-tier-sg"
                    required
                    className="w-full h-9 px-3 rounded-full bg-[#F6F6F4] dark:bg-[#232834] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1E1E1E] dark:text-slate-200">
                    Rule Inbound Preset
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewSgPreset("web")}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                        newSgPreset === "web"
                          ? "bg-[#222222] text-white dark:bg-white dark:text-[#1E1E1E] border-transparent"
                          : "bg-[#F6F6F4] dark:bg-[#232834] border-[#E7E4DF] dark:border-[#282D3A] text-[#5A5A58] dark:text-slate-300"
                      }`}
                    >
                      <span className="text-xs font-semibold block">Web & SSH</span>
                      <span className="text-[10px] opacity-80 block mt-0.5">Ports 80, 443, 22</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewSgPreset("ssh")}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                        newSgPreset === "ssh"
                          ? "bg-[#222222] text-white dark:bg-white dark:text-[#1E1E1E] border-transparent"
                          : "bg-[#F6F6F4] dark:bg-[#232834] border-[#E7E4DF] dark:border-[#282D3A] text-[#5A5A58] dark:text-slate-300"
                      }`}
                    >
                      <span className="text-xs font-semibold block">SSH Only</span>
                      <span className="text-[10px] opacity-80 block mt-0.5">Port 22 only</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateSgOpen(false)}
                  className="h-8 px-4 rounded-full text-xs text-[#5A5A58] dark:text-slate-300 hover:text-[#1E1E1E] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateSecurityGroup}
                  disabled={isSubmittingSg || !newSgName.trim()}
                  className="h-8 px-4 rounded-full bg-[#222222] dark:bg-white text-white dark:text-[#1E1E1E] text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingSg ? "Creating..." : "Create & Attach SG"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Inline Create SSH Key Dialog */}
        {isCreateSshOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] rounded-[24px] shadow-2xl p-6 w-full max-w-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[#E6D8EA] text-[#1E1E1E] flex items-center justify-center">
                    <MaterialIcon name="key" size={16} />
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-[#1E1E1E] dark:text-white">
                      Register SSH Public Key
                    </h4>
                    <span className="text-[10px] text-[#8C8B87]">
                      Encrypted with Fernet (AES-128-CBC + SHA256 HMAC)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateSshOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#F6F6F4] dark:bg-[#232834] flex items-center justify-center text-[#5A5A58] hover:text-[#1E1E1E] cursor-pointer"
                >
                  <MaterialIcon name="close" size={16} />
                </button>
              </div>

              {sshError && (
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-xs text-red-600 dark:text-red-400">
                  {sshError}
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1E1E1E] dark:text-slate-200">
                    Key Name / Identifier
                  </label>
                  <input
                    type="text"
                    value={newSshName}
                    onChange={(e) => setNewSshName(e.target.value)}
                    placeholder="e.g. dev-laptop, ci-cd-deploy-key"
                    required
                    className="w-full h-9 px-3 rounded-full bg-[#F6F6F4] dark:bg-[#232834] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1E1E1E] dark:text-slate-200">
                    Public Key (OpenSSH format)
                  </label>
                  <textarea
                    rows={4}
                    value={newSshPublicKey}
                    onChange={(e) => setNewSshPublicKey(e.target.value)}
                    placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA... user@machine"
                    required
                    className="w-full p-3 rounded-xl bg-[#F6F6F4] dark:bg-[#232834] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-mono text-[#1E1E1E] dark:text-white focus:outline-none resize-none"
                  />
                  <p className="text-[10px] text-[#8C8B87]">
                    Supports ssh-ed25519, ssh-rsa, and ecdsa public keys. Private keys should never be pasted here.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateSshOpen(false)}
                  className="h-8 px-4 rounded-full text-xs text-[#5A5A58] dark:text-slate-300 hover:text-[#1E1E1E] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateSshKey}
                  disabled={isSubmittingSsh || !newSshName.trim() || !newSshPublicKey.trim()}
                  className="h-8 px-4 rounded-full bg-[#222222] dark:bg-white text-white dark:text-[#1E1E1E] text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingSsh ? "Saving..." : "Save & Attach Key"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
