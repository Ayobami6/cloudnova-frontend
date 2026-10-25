"use client";

import React, { useState, useMemo } from "react";
import { useCloud } from "@/lib/store/cloud-context";
import { REGIONS } from "@/lib/mock-data/initial-state";
import { FirewallRule, DatacenterRegion, VPC } from "@/lib/types/cloud";
import {
  MaterialIcon,
  PastelTypePill,
  StatusIndicator,
  PastelVariant,
} from "@/components/ui/material-icon";
import {
  PastelKpiCard,
  SegmentedPillTabs,
} from "@/components/ui/bento-primitives";

const CIDR_PRESETS = [
  { label: "10.0.0.0/16", desc: "Default Class A" },
  { label: "10.10.0.0/16", desc: "App Tier /16" },
  { label: "172.16.0.0/16", desc: "Class B Subnet" },
  { label: "192.168.1.0/24", desc: "Small /24 Block" },
];

export default function NetworkPage() {
  const {
    firewalls,
    vpcs,
    instances,
    createFirewall,
    deleteFirewall,
    addFirewallRule,
    deleteFirewallRule,
    attachSecurityGroupInstance,
    detachSecurityGroupInstance,
    createVPC,
    deleteVPC,
    selectedRegion,
    searchQuery,
  } = useCloud();

  const [activeTab, setActiveTab] = useState<"vpcs" | "securitygroups">("vpcs");
  const [selectedFirewallId, setSelectedFirewallId] = useState<string>(firewalls[0]?.id || "");

  // Security group modals & form state
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [isCreateFirewallOpen, setIsCreateFirewallOpen] = useState(false);
  const [isAttachDropletOpen, setIsAttachDropletOpen] = useState(false);
  const [instanceToAttach, setInstanceToAttach] = useState<string>("");
  const [newFirewallName, setNewFirewallName] = useState("web-production-sg");
  const [isSubmittingFirewall, setIsSubmittingFirewall] = useState(false);
  const [ruleType, setRuleType] = useState<"inbound" | "outbound">("inbound");
  const [ruleProtocol, setRuleProtocol] = useState<"tcp" | "udp" | "icmp" | "all">("tcp");
  const [rulePorts, setRulePorts] = useState("8080");
  const [ruleSources, setRuleSources] = useState("0.0.0.0/0");
  const [ruleLabel, setRuleLabel] = useState("Custom Web Port");

  // VPC modals & form state
  const [isCreateVpcOpen, setIsCreateVpcOpen] = useState(false);
  const [newVpcName, setNewVpcName] = useState("vpc-production");
  const [newVpcRegion, setNewVpcRegion] = useState<DatacenterRegion>("nyc1");
  const [newVpcCidr, setNewVpcCidr] = useState("10.10.0.0/16");
  const [newVpcIsDefault, setNewVpcIsDefault] = useState(false);
  const [isSubmittingVpc, setIsSubmittingVpc] = useState(false);
  const [vpcToDelete, setVpcToDelete] = useState<VPC | null>(null);
  const [isDeletingVpc, setIsDeletingVpc] = useState(false);
  const [copiedCidrId, setCopiedCidrId] = useState<string | null>(null);
  const [vpcSearch, setVpcSearch] = useState("");

  React.useEffect(() => {
    if (!selectedFirewallId && firewalls.length > 0) {
      setSelectedFirewallId(firewalls[0].id);
    } else if (
      selectedFirewallId &&
      !firewalls.some((f) => f.id === selectedFirewallId) &&
      firewalls.length > 0
    ) {
      setSelectedFirewallId(firewalls[0].id);
    }
  }, [firewalls, selectedFirewallId]);

  const activeFirewall = firewalls.find((f) => f.id === selectedFirewallId) || firewalls[0];

  // Attached instances for active security group
  const attachedInstances = useMemo(() => {
    return activeFirewall
      ? instances.filter((inst) => activeFirewall.attachedInstanceIds.includes(inst.id))
      : [];
  }, [activeFirewall, instances]);

  // Candidate unattached instances
  const unattachedInstances = useMemo(() => {
    return activeFirewall
      ? instances.filter((inst) => !activeFirewall.attachedInstanceIds.includes(inst.id))
      : [];
  }, [activeFirewall, instances]);

  // Total protected nodes count (either in a security group or inside a VPC)
  const totalProtectedCount = useMemo(() => {
    const protectedIds = new Set<string>();
    firewalls.forEach((fw) => fw.attachedInstanceIds.forEach((id) => protectedIds.add(id)));
    instances.forEach((inst) => {
      if (inst.vpcId) protectedIds.add(inst.id);
    });
    return protectedIds.size;
  }, [firewalls, instances]);

  // Filtered VPCs based on global search or region
  const filteredVpcs = useMemo(() => {
    return vpcs.filter((v) => {
      const q = (vpcSearch || searchQuery).toLowerCase().trim();
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.cidr.toLowerCase().includes(q) ||
        v.region.toLowerCase().includes(q);
      const matchesRegion = selectedRegion === "all" || v.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [vpcs, vpcSearch, searchQuery, selectedRegion]);

  const handleCopyCidr = (cidr: string, id: string) => {
    navigator.clipboard.writeText(cidr);
    setCopiedCidrId(id);
    setTimeout(() => setCopiedCidrId(null), 1500);
  };

  const handleCreateVpcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVpcName.trim()) return;
    setIsSubmittingVpc(true);
    try {
      await createVPC(
        newVpcName.trim(),
        newVpcRegion,
        newVpcCidr.trim() || "10.10.0.0/16",
        undefined,
        newVpcIsDefault
      );
      setIsCreateVpcOpen(false);
      setNewVpcName("vpc-production");
      setNewVpcCidr("10.10.0.0/16");
      setNewVpcIsDefault(false);
    } finally {
      setIsSubmittingVpc(false);
    }
  };

  const handleDeleteVpcConfirm = async () => {
    if (!vpcToDelete) return;
    setIsDeletingVpc(true);
    try {
      await deleteVPC(vpcToDelete.id);
      setVpcToDelete(null);
    } finally {
      setIsDeletingVpc(false);
    }
  };

  const handleCreateFirewallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirewallName.trim()) return;
    setIsSubmittingFirewall(true);
    try {
      const defaultTemplateRules: FirewallRule[] = [
        {
          id: `rule-ssh-${Date.now()}`,
          type: "inbound",
          protocol: "tcp",
          ports: "22",
          sources: ["0.0.0.0/0"],
          action: "accept",
          label: "SSH Administration",
        },
        {
          id: `rule-http-${Date.now() + 1}`,
          type: "inbound",
          protocol: "tcp",
          ports: "80",
          sources: ["0.0.0.0/0"],
          action: "accept",
          label: "HTTP Ingress",
        },
        {
          id: `rule-https-${Date.now() + 2}`,
          type: "inbound",
          protocol: "tcp",
          ports: "443",
          sources: ["0.0.0.0/0"],
          action: "accept",
          label: "HTTPS TLS Ingress",
        },
        {
          id: `rule-egress-${Date.now() + 3}`,
          type: "outbound",
          protocol: "all",
          ports: "1-65535",
          sources: ["0.0.0.0/0"],
          action: "accept",
          label: "Allow All Outbound Egress",
        },
      ];
      await createFirewall(newFirewallName.trim(), defaultTemplateRules);
      setIsCreateFirewallOpen(false);
      setNewFirewallName("web-production-sg");
    } finally {
      setIsSubmittingFirewall(false);
    }
  };

  const handleAddRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFirewall) return;
    const newRule: FirewallRule = {
      id: `rule-${Date.now()}`,
      type: ruleType,
      protocol: ruleProtocol,
      ports: rulePorts,
      sources: ruleSources.split(",").map((s) => s.trim()),
      action: "accept",
      label: ruleLabel,
    };
    addFirewallRule(activeFirewall.id, newRule);
    setIsAddRuleOpen(false);
  };

  const handleAttachDropletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFirewall || !instanceToAttach) return;
    await attachSecurityGroupInstance(activeFirewall.id, instanceToAttach);
    setIsAttachDropletOpen(false);
    setInstanceToAttach("");
  };

  const handleDetachDroplet = async (instanceId: string) => {
    if (!activeFirewall) return;
    await detachSecurityGroupInstance(activeFirewall.id, instanceId);
  };

  const getPillVariant = (index: number): PastelVariant => {
    const variants: PastelVariant[] = ["blue", "lavender", "sand", "yellow"];
    return variants[index % variants.length];
  };

  return (
    <div className="space-y-5">
      {/* Top 3 Pastel KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PastelKpiCard
          label="Active VPC Networks"
          value={`${vpcs.length} Subnets`}
          subtitle="Software-Defined Private Networks"
          variant="lavender"
          actionLabel="Create VPC"
          onAction={() => setIsCreateVpcOpen(true)}
        />
        <PastelKpiCard
          label="Perimeter Security Groups"
          value={`${firewalls.length} Groups`}
          subtitle="Stateful L4 Packet Inspection"
          variant="blue"
          actionLabel="New Group"
          onAction={() => setIsCreateFirewallOpen(true)}
        />
        <PastelKpiCard
          label="Protected Droplet Nodes"
          value={`${totalProtectedCount} Nodes`}
          subtitle="Zero-Trust Encrypted Fabric"
          variant="yellow"
          actionLabel="Inspect"
          onAction={() => setActiveTab("securitygroups")}
        />
      </div>

      {/* Header & Filter Controls Card */}
      <div className="nixtio-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#1E1E1E] dark:text-white flex items-center gap-2">
            <span>Networking & Zero-Trust Security</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#EFECE8] dark:bg-[#232834] text-[#5A5A58] dark:text-slate-300">
              {activeTab === "vpcs" ? `${filteredVpcs.length} networks` : `${firewalls.length} groups`}
            </span>
          </h2>
          <p className="text-xs text-[#8C8B87] dark:text-slate-400 mt-0.5">
            Stateful security groups, perimeter packet inspection, and isolated private VPC subnets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <SegmentedPillTabs
            value={activeTab}
            onChange={(tab) => setActiveTab(tab)}
            options={[
              { id: "vpcs", label: "VPC Networks", badge: vpcs.length, icon: "lan" },
              { id: "securitygroups", label: "Security Groups", badge: firewalls.length, icon: "security" },
            ]}
          />

          {activeTab === "vpcs" ? (
            <button
              type="button"
              onClick={() => setIsCreateVpcOpen(true)}
              className="h-9 px-4 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:hover:bg-slate-200 dark:text-[#1E1E1E] text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <MaterialIcon name="add" size={16} />
              <span>Create VPC Network</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreateFirewallOpen(true)}
              className="h-9 px-4 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:hover:bg-slate-200 dark:text-[#1E1E1E] text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <MaterialIcon name="add" size={16} />
              <span>New Security Group</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: VPC NETWORKS
      ========================================================================== */}
      {activeTab === "vpcs" && (
        <div className="space-y-3">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#8C8B87]">
                <MaterialIcon name="search" size={16} />
              </span>
              <input
                type="text"
                value={vpcSearch}
                onChange={(e) => setVpcSearch(e.target.value)}
                placeholder="Filter by VPC name or CIDR..."
                className="w-full h-8 pl-9 pr-3 rounded-full bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-slate-200 placeholder:text-[#8C8B87] focus:outline-none focus:border-blue-500 transition-colors"
              />
              {vpcSearch && (
                <button
                  type="button"
                  onClick={() => setVpcSearch("")}
                  className="absolute inset-y-0 right-3 flex items-center text-[#8C8B87] hover:text-[#1E1E1E] dark:hover:text-white"
                >
                  <MaterialIcon name="close" size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-[#8C8B87]">
              <span>RFC 1918 Private IPv4 Isolated Fabrics</span>
            </div>
          </div>

          {/* VPC Networks Table */}
          {filteredVpcs.length === 0 ? (
            <div className="nixtio-card border border-[#E7E4DF]/60 dark:border-[#282D3A] p-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#E6D8EA]/40 text-[#1E1E1E] dark:text-white flex items-center justify-center">
                <MaterialIcon name="lan" size={24} />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-sm font-semibold text-[#1E1E1E] dark:text-white">
                  No VPC Networks Found
                </h3>
                <p className="text-xs text-[#8C8B87] dark:text-slate-400">
                  Virtual Private Clouds (VPC) provide isolated private IP networks with non-routable
                  RFC 1918 address space. Droplets in the same VPC communicate privately without traversing
                  the public internet.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateVpcOpen(true)}
                className="h-9 px-4 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:hover:bg-slate-200 dark:text-[#1E1E1E] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <MaterialIcon name="add" size={16} />
                <span>Create VPC Network</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Header row */}
              <div className="grid grid-cols-12 items-center px-4 py-1.5 text-xs font-medium text-[#5A5A58] dark:text-slate-400">
                <div className="col-span-4 sm:col-span-3">VPC & Region</div>
                <div className="col-span-3 sm:col-span-3">Subnet CIDR Range</div>
                <div className="hidden sm:block sm:col-span-2">Network State</div>
                <div className="col-span-3 sm:col-span-3">Connected Droplets</div>
                <div className="col-span-2 sm:col-span-1 text-right pr-2">Actions</div>
              </div>

              {/* Rows */}
              {filteredVpcs.map((vpc, idx) => {
                const pillVariant = getPillVariant(idx);
                const isCopied = copiedCidrId === vpc.id;
                const regionInfo = REGIONS.find((r) => r.id === vpc.region);
                const connectedDroplets = instances.filter((i) => i.vpcId === vpc.id);
                const dropletCount = connectedDroplets.length || vpc.connectedInstancesCount;

                return (
                  <div
                    key={vpc.id}
                    className="nixtio-floating-row grid grid-cols-12 items-center px-4 py-3.5 text-xs gap-2"
                  >
                    {/* VPC Name & Region */}
                    <div className="col-span-4 sm:col-span-3 flex items-center gap-2.5 min-w-0">
                      <PastelTypePill
                        icon="lan"
                        label={vpc.region.toUpperCase()}
                        variant={pillVariant}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#1E1E1E] dark:text-white truncate">
                            {vpc.name}
                          </span>
                          {vpc.isDefault && (
                            <span
                              title="Default VPC for this region"
                              className="text-[10px] font-semibold uppercase px-2 py-0.2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0 inline-flex items-center gap-0.5"
                            >
                              <MaterialIcon name="verified" size={11} />
                              <span>Default</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#8C8B87] block truncate">
                          {regionInfo ? `${regionInfo.flag} ${regionInfo.city}` : vpc.region.toUpperCase()} • ID: {vpc.id.slice(0, 10)}
                        </span>
                      </div>
                    </div>

                    {/* Subnet CIDR Range */}
                    <div className="col-span-3 sm:col-span-3 flex items-center gap-1.5">
                      <div className="px-2.5 py-1 rounded bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] font-mono text-xs text-[#1E1E1E] dark:text-slate-200 inline-flex items-center gap-2">
                        <span>{vpc.cidr}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCidr(vpc.cidr, vpc.id)}
                          className="text-[#8C8B87] hover:text-[#1E1E1E] dark:hover:text-white transition-colors cursor-pointer"
                          title="Copy CIDR block"
                        >
                          <MaterialIcon name={isCopied ? "check" : "content_copy"} size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Network State */}
                    <div className="hidden sm:block sm:col-span-2">
                      <StatusIndicator
                        status="completed"
                        label="Active Subnet"
                        icon="check_circle"
                      />
                    </div>

                    {/* Connected Droplets */}
                    <div className="col-span-3 sm:col-span-3 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-[#1E1E1E] dark:text-slate-200">
                          {dropletCount} {dropletCount === 1 ? "Droplet" : "Droplets"}
                        </span>
                        {connectedDroplets.length > 0 && (
                          <div className="hidden md:flex items-center gap-1">
                            {connectedDroplets.slice(0, 2).map((inst) => (
                              <span
                                key={inst.id}
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EFECE8] dark:bg-[#232834] text-[#5A5A58] dark:text-slate-300 truncate max-w-[100px]"
                                title={inst.name}
                              >
                                {inst.name}
                              </span>
                            ))}
                            {connectedDroplets.length > 2 && (
                              <span className="text-[10px] text-[#8C8B87]">
                                +{connectedDroplets.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setVpcToDelete(vpc)}
                        disabled={vpc.isDefault}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          vpc.isDefault
                            ? "text-[#D5D0C8] dark:text-[#383F52] cursor-not-allowed"
                            : "hover:bg-rose-500/10 text-[#8C8B87] hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                        }`}
                        title={vpc.isDefault ? "Default VPCs cannot be deleted" : "Delete VPC Network"}
                      >
                        <MaterialIcon name="delete" size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: SECURITY GROUPS
      ========================================================================== */}
      {activeTab === "securitygroups" &&
        (firewalls.length === 0 ? (
          <div className="nixtio-card border border-[#E7E4DF]/60 dark:border-[#282D3A] p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#CFE0EC]/40 text-[#1E1E1E] dark:text-white flex items-center justify-center">
              <MaterialIcon name="security" size={24} />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="text-sm font-semibold text-[#1E1E1E] dark:text-white">
                No Security Groups Configured
              </h3>
              <p className="text-xs text-[#8C8B87] dark:text-slate-400">
                Security Groups provide stateful packet filtering at the network perimeter. Create your
                first security group to allow SSH, HTTP, and secure internal traffic to your droplets.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateFirewallOpen(true)}
              className="h-9 px-4 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:hover:bg-slate-200 dark:text-[#1E1E1E] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
            >
              <MaterialIcon name="add" size={16} />
              <span>Create Security Group</span>
            </button>
          </div>
        ) : activeFirewall ? (
          <div className="space-y-5">
            {/* Security Groups Selector Strip */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#8C8B87] dark:text-slate-400">
                Configured Security Groups ({firewalls.length})
              </span>
              <button
                type="button"
                onClick={() => setIsCreateFirewallOpen(true)}
                className="h-7 px-3 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:hover:bg-slate-200 dark:text-[#1E1E1E] text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
              >
                <MaterialIcon name="add" size={14} />
                <span>New Security Group</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {firewalls.map((fw, idx) => {
                const isSelected = activeFirewall.id === fw.id;
                const pillVariant = getPillVariant(idx);
                return (
                  <button
                    key={fw.id}
                    type="button"
                    onClick={() => setSelectedFirewallId(fw.id)}
                    className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-white dark:bg-[#1C2029] border-[#222222] dark:border-white shadow-xs"
                        : "bg-[#F6F6F4] dark:bg-[#161920] border-[#E7E4DF] dark:border-[#282D3A] hover:bg-white dark:hover:bg-[#1C2029]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PastelTypePill
                          icon="security"
                          label={fw.name}
                          variant={pillVariant}
                          size="sm"
                        />
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <div className="mt-3 text-[11px] text-[#8C8B87] dark:text-slate-400 flex items-center justify-between">
                      <span>{fw.rules.length} inspection rules</span>
                      <span>{fw.attachedInstanceIds.length} attached nodes</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Security Group Detail Card */}
            <div className="nixtio-card border border-[#E7E4DF]/60 dark:border-[#282D3A] overflow-hidden">
              <div className="p-4 border-b border-[#E7E4DF] dark:border-[#282D3A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F6F6F4] dark:bg-[#161920]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#1E1E1E] dark:text-white">
                      {activeFirewall.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                      STATEFUL L4
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8C8B87] dark:text-slate-400">
                    Default ingress policy: DROP all packets without matching allow rule.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddRuleOpen(true)}
                    className="h-8 px-3.5 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:hover:bg-slate-200 dark:text-[#1E1E1E] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <MaterialIcon name="add" size={15} />
                    <span>Add Rule</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteFirewall(activeFirewall.id)}
                    className="h-8 w-8 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center cursor-pointer transition-colors"
                    title="Delete Security Group"
                  >
                    <MaterialIcon name="delete" size={16} />
                  </button>
                </div>
              </div>

              {/* Rules Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F7] dark:bg-[#181C24] text-[#8C8B87] dark:text-slate-400 uppercase tracking-wider font-medium text-[11px] border-b border-[#E7E4DF] dark:border-[#282D3A]">
                    <tr>
                      <th className="py-2.5 px-4">Direction</th>
                      <th className="py-2.5 px-4">Rule Description</th>
                      <th className="py-2.5 px-4">Protocol & Ports</th>
                      <th className="py-2.5 px-4">Sources / Destinations</th>
                      <th className="py-2.5 px-4">Action</th>
                      <th className="py-2.5 px-4 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E4DF] dark:divide-[#282D3A]">
                    {activeFirewall.rules.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-[#8C8B87] dark:text-slate-400">
                          No rules defined for this security group. Click &quot;Add Rule&quot; to configure packet inspection.
                        </td>
                      </tr>
                    ) : (
                      activeFirewall.rules.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/75 dark:hover:bg-white/[0.02]">
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                                r.type === "inbound"
                                  ? "bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-600/20"
                                  : "bg-emerald-50 dark:bg-emerald-500/10 text-[#4EA871] dark:text-[#56B87C] border-emerald-200 dark:border-emerald-500/20"
                              }`}
                            >
                              {r.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-[#1E1E1E] dark:text-slate-200">
                            {r.label}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                            {r.protocol.toUpperCase()} : {r.ports}
                          </td>
                          <td className="py-3 px-4 font-mono text-[#8C8B87] dark:text-slate-400 text-[11px]">
                            {r.sources.join(", ")}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[10px] font-mono text-[#4EA871] dark:text-[#56B87C] bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                              <MaterialIcon name="check" size={11} />
                              <span>ACCEPT</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => deleteFirewallRule(activeFirewall.id, r.id)}
                              className="text-[#8C8B87] hover:text-rose-600 dark:hover:text-rose-400 p-1 cursor-pointer transition-colors"
                              title="Delete Rule"
                            >
                              <MaterialIcon name="delete" size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Attached Droplets Section */}
              <div className="p-4 border-t border-[#E7E4DF] dark:border-[#282D3A] bg-[#FAF9F7] dark:bg-[#181C24] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-[#1E1E1E] dark:text-white flex items-center gap-1.5">
                      <MaterialIcon name="dns" size={15} />
                      <span>Attached Droplets ({attachedInstances.length})</span>
                    </h4>
                    <p className="text-[11px] text-[#8C8B87] dark:text-slate-400">
                      Compute droplet instances protected by this security group policy.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (unattachedInstances.length > 0) {
                        setInstanceToAttach(unattachedInstances[0].id);
                      }
                      setIsAttachDropletOpen(true);
                    }}
                    className="h-7 px-3 rounded-full bg-[#EFECE8] dark:bg-[#232834] hover:bg-slate-200 dark:hover:bg-[#282D3A] border border-[#E7E4DF] dark:border-[#282D3A] text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <MaterialIcon name="add" size={13} />
                    <span>Attach Droplet</span>
                  </button>
                </div>

                {attachedInstances.length === 0 ? (
                  <div className="py-5 text-center text-xs text-[#8C8B87] dark:text-slate-400 border border-dashed border-[#E7E4DF] dark:border-[#282D3A] rounded-xl">
                    No droplets currently attached to this security group. Click &quot;Attach Droplet&quot; to bind an instance.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {attachedInstances.map((inst) => (
                      <div
                        key={inst.id}
                        className="p-3 rounded-xl bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-xs text-[#1E1E1E] dark:text-slate-200 truncate flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="truncate">{inst.name}</span>
                          </div>
                          <div className="text-[10px] font-mono text-[#8C8B87] dark:text-slate-400">
                            {inst.ipv4 || "No Public IP"} • {inst.region.toUpperCase()}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDetachDroplet(inst.id)}
                          className="w-6 h-6 rounded-full hover:bg-rose-500/10 text-[#8C8B87] hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                          title="Detach Droplet"
                        >
                          <MaterialIcon name="close" size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null)}

      {/* =========================================================================
          MODALS
      ========================================================================== */}

      {/* 1. Create VPC Network Modal */}
      {isCreateVpcOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E7E4DF] dark:border-[#282D3A] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#E6D8EA]/50 dark:bg-[#E6D8EA]/20 text-[#1E1E1E] dark:text-white flex items-center justify-center">
                  <MaterialIcon name="lan" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1E1E1E] dark:text-white">
                    Create Virtual Private Cloud (VPC)
                  </h3>
                  <p className="text-[11px] text-[#8C8B87] dark:text-slate-400">
                    Isolated software-defined RFC 1918 private IPv4 network.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateVpcOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-[#EFECE8] dark:hover:bg-[#282D3A] text-[#8C8B87] hover:text-[#1E1E1E] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <MaterialIcon name="close" size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateVpcSubmit} className="p-5 space-y-4">
              {/* VPC Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  VPC Name
                </label>
                <input
                  type="text"
                  value={newVpcName}
                  onChange={(e) => setNewVpcName(e.target.value)}
                  placeholder="e.g. vpc-production-useast"
                  className="w-full h-9 px-3 rounded-xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              {/* Region */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Datacenter Region
                </label>
                <select
                  value={newVpcRegion}
                  onChange={(e) => setNewVpcRegion(e.target.value as DatacenterRegion)}
                  className="w-full h-9 px-3 rounded-xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  {REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.flag} {r.name} ({r.country}) — {r.id.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subnet CIDR Range */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Subnet CIDR Block
                  </label>
                  <span className="text-[10px] text-[#8C8B87]">RFC 1918 Private Range</span>
                </div>
                <input
                  type="text"
                  value={newVpcCidr}
                  onChange={(e) => setNewVpcCidr(e.target.value)}
                  placeholder="10.10.0.0/16"
                  className="w-full h-9 px-3 rounded-xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-mono text-[#1E1E1E] dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />

                {/* Preset Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {CIDR_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setNewVpcCidr(preset.label)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-colors cursor-pointer border ${
                        newVpcCidr === preset.label
                          ? "bg-[#222222] text-white dark:bg-white dark:text-[#1E1E1E] border-transparent"
                          : "bg-[#F6F6F4] dark:bg-[#232834] text-[#5A5A58] dark:text-slate-300 border-[#E7E4DF] dark:border-[#282D3A] hover:border-slate-400"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Set as Default VPC checkbox */}
              <div className="p-3 rounded-xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] flex items-center justify-between cursor-pointer">
                <div>
                  <label htmlFor="vpc-default-check" className="text-xs font-medium text-[#1E1E1E] dark:text-white block cursor-pointer">
                    Set as default VPC for {newVpcRegion.toUpperCase()}
                  </label>
                  <span className="text-[11px] text-[#8C8B87] dark:text-slate-400 block">
                    Automatically attaches new droplets created in this datacenter region.
                  </span>
                </div>
                <input
                  id="vpc-default-check"
                  type="checkbox"
                  checked={newVpcIsDefault}
                  onChange={(e) => setNewVpcIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-[#383F52] cursor-pointer"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E4DF] dark:border-[#282D3A]">
                <button
                  type="button"
                  onClick={() => setIsCreateVpcOpen(false)}
                  className="h-8 px-4 rounded-full bg-[#EFECE8] dark:bg-[#232834] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#282D3A] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVpc}
                  className="h-8 px-4 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:hover:bg-slate-200 dark:text-[#1E1E1E] text-white text-xs font-semibold cursor-pointer shadow-sm transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <MaterialIcon name="lan" size={14} />
                  <span>{isSubmittingVpc ? "Provisioning..." : "Create VPC Network"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Delete VPC Confirmation Modal */}
      {vpcToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <MaterialIcon name="warning" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#1E1E1E] dark:text-white">
                  Delete VPC Network
                </h3>
                <p className="text-xs text-[#8C8B87] dark:text-slate-400">
                  This action permanently destroys the software-defined subnet.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs text-rose-900 dark:text-rose-300 space-y-1">
              <div className="font-semibold">{vpcToDelete.name} ({vpcToDelete.cidr})</div>
              <p className="text-[11px] opacity-90">
                Any droplets currently connected to this VPC will lose private inter-node communication and fall back to public IP routing.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVpcToDelete(null)}
                disabled={isDeletingVpc}
                className="h-8 px-4 rounded-full bg-[#EFECE8] dark:bg-[#232834] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#282D3A] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteVpcConfirm}
                disabled={isDeletingVpc}
                className="h-8 px-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer shadow-sm transition-colors disabled:opacity-50"
              >
                {isDeletingVpc ? "Deleting..." : "Delete VPC"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Create Security Group Modal */}
      {isCreateFirewallOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#E7E4DF] dark:border-[#282D3A] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#CFE0EC]/50 dark:bg-[#CFE0EC]/20 text-[#1E1E1E] dark:text-white flex items-center justify-center">
                  <MaterialIcon name="security" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1E1E1E] dark:text-white">
                    Create Security Group
                  </h3>
                  <p className="text-[11px] text-[#8C8B87] dark:text-slate-400">
                    Stateful perimeter L4 firewall policy.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateFirewallOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-[#EFECE8] dark:hover:bg-[#282D3A] text-[#8C8B87] hover:text-[#1E1E1E] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <MaterialIcon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateFirewallSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Security Group Name
                </label>
                <input
                  type="text"
                  value={newFirewallName}
                  onChange={(e) => setNewFirewallName(e.target.value)}
                  placeholder="e.g. web-production-sg"
                  className="w-full h-9 px-3 rounded-xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] space-y-1">
                <label className="text-xs font-medium text-[#1E1E1E] dark:text-white block">
                  Default Baseline Policy
                </label>
                <p className="text-[11px] text-[#8C8B87] dark:text-slate-400">
                  Initializes standard SSH (port 22) and Web ingress (ports 80 &amp; 443) with full outbound egress.
                  Additional packet rules can be attached anytime.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E4DF] dark:border-[#282D3A]">
                <button
                  type="button"
                  onClick={() => setIsCreateFirewallOpen(false)}
                  className="h-8 px-4 rounded-full bg-[#EFECE8] dark:bg-[#232834] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#282D3A] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFirewall}
                  className="h-8 px-4 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:hover:bg-slate-200 dark:text-[#1E1E1E] text-white text-xs font-semibold cursor-pointer shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmittingFirewall ? "Creating..." : "Create Security Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Inspection Rule Modal */}
      {isAddRuleOpen && activeFirewall && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#E7E4DF] dark:border-[#282D3A] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#1E1E1E] dark:text-white">
                  Add Rule to {activeFirewall.name}
                </h3>
                <p className="text-[11px] text-[#8C8B87] dark:text-slate-400">
                  Configure stateful port and protocol filtering.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddRuleOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-[#EFECE8] dark:hover:bg-[#282D3A] text-[#8C8B87] hover:text-[#1E1E1E] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <MaterialIcon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleAddRuleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Rule Label
                </label>
                <input
                  type="text"
                  value={ruleLabel}
                  onChange={(e) => setRuleLabel(e.target.value)}
                  placeholder="e.g. Postgres DB Access"
                  className="w-full h-9 px-3 rounded-xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Direction
                  </label>
                  <select
                    value={ruleType}
                    onChange={(e) => setRuleType(e.target.value as "inbound" | "outbound")}
                    className="w-full h-9 px-3 rounded-xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="inbound">Inbound (Ingress)</option>
                    <option value="outbound">Outbound (Egress)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Protocol
                  </label>
                  <select
                    value={ruleProtocol}
                    onChange={(e) => setRuleProtocol(e.target.value as "tcp" | "udp" | "icmp" | "all")}
                    className="w-full h-9 px-3 rounded-xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="tcp">TCP</option>
                    <option value="udp">UDP</option>
                    <option value="icmp">ICMP (Ping)</option>
                    <option value="all">ALL Protocols</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Port Range (e.g. 80, 443, 8000-9000)
                </label>
                <input
                  type="text"
                  value={rulePorts}
                  onChange={(e) => setRulePorts(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-mono text-[#1E1E1E] dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Source CIDR
                </label>
                <input
                  type="text"
                  value={ruleSources}
                  onChange={(e) => setRuleSources(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-mono text-[#1E1E1E] dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E4DF] dark:border-[#282D3A]">
                <button
                  type="button"
                  onClick={() => setIsAddRuleOpen(false)}
                  className="h-8 px-4 rounded-full bg-[#EFECE8] dark:bg-[#232834] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#282D3A] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:hover:bg-slate-200 dark:text-[#1E1E1E] text-white text-xs font-semibold cursor-pointer shadow-sm transition-colors"
                >
                  Add Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Attach Droplet Modal */}
      {isAttachDropletOpen && activeFirewall && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#E7E4DF] dark:border-[#282D3A] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#1E1E1E] dark:text-white">
                  Attach Droplet to {activeFirewall.name}
                </h3>
                <p className="text-[11px] text-[#8C8B87] dark:text-slate-400">
                  Bind instance to perimeter security group inspection.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAttachDropletOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-[#EFECE8] dark:hover:bg-[#282D3A] text-[#8C8B87] hover:text-[#1E1E1E] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <MaterialIcon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleAttachDropletSubmit} className="p-5 space-y-4">
              {unattachedInstances.length === 0 ? (
                <p className="text-xs text-[#8C8B87] dark:text-slate-400">
                  All your active compute droplet instances are already protected by this security group.
                </p>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Select Compute Droplet
                  </label>
                  <select
                    value={instanceToAttach}
                    onChange={(e) => setInstanceToAttach(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                    required
                  >
                    {unattachedInstances.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.ipv4 || "No Public IP"}) — {inst.region.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E4DF] dark:border-[#282D3A]">
                <button
                  type="button"
                  onClick={() => setIsAttachDropletOpen(false)}
                  className="h-8 px-4 rounded-full bg-[#EFECE8] dark:bg-[#232834] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#282D3A] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={unattachedInstances.length === 0}
                  className="h-8 px-4 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:hover:bg-slate-200 dark:text-[#1E1E1E] text-white text-xs font-semibold cursor-pointer shadow-sm transition-colors disabled:opacity-50"
                >
                  Attach Droplet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
