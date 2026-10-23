"use client";

import React, { useState } from "react";
import {
  Shield,
  Plus,
  Server,
  Trash2,
  Lock,
  Layers,
  X,
  Radio,
  CheckCircle2,
} from "lucide-react";
import { useCloud } from "@/lib/store/cloud-context";
import { FirewallRule } from "@/lib/types/cloud";

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
  } = useCloud();

  const [activeTab, setActiveTab] = useState<"securitygroups" | "vpcs">("securitygroups");
  const [selectedFirewallId, setSelectedFirewallId] = useState<string>(firewalls[0]?.id || "");
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

  // Attached instances for the active security group
  const attachedInstances = activeFirewall
    ? instances.filter((inst) => activeFirewall.attachedInstanceIds.includes(inst.id))
    : [];

  // Candidate unattached instances that can be attached
  const unattachedInstances = activeFirewall
    ? instances.filter((inst) => !activeFirewall.attachedInstanceIds.includes(inst.id))
    : [];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#1E1E1E] dark:text-white flex items-center gap-2">
            Networking & Zero-Trust Security
          </h1>
          <p className="text-xs text-[#8C8B87] dark:text-slate-400 mt-1">
            Stateful security groups, perimeter packet inspection, and isolated private VPC subnets.
          </p>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex items-center rounded-full bg-[#EFECE8] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] p-0.5 text-xs">
          {[
            { id: "securitygroups", label: "Security Groups" },
            { id: "vpcs", label: "VPC Networks" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 rounded-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#222222] text-white dark:bg-white dark:text-[#1E1E1E] shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Security Groups */}
      {activeTab === "securitygroups" &&
        (firewalls.length === 0 ? (
          <div className="nixtio-card border border-[#E7E4DF]/60 dark:border-[#282D3A] p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Shield className="w-6 h-6" />
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
              onClick={() => setIsCreateFirewallOpen(true)}
              className="h-9 px-4 rounded bg-[#222222] hover:bg-[#111111] dark:bg-white dark:text-[#1E1E1E] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Security Group</span>
            </button>
          </div>
        ) : activeFirewall ? (
          <div className="space-y-6">
            {/* Security Groups Selector Strip */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#8C8B87] dark:text-slate-400">
                Configured Security Groups ({firewalls.length})
              </span>
              <button
                onClick={() => setIsCreateFirewallOpen(true)}
                className="h-7 px-2.5 rounded bg-[#222222] hover:bg-[#111111] dark:bg-white dark:text-[#1E1E1E] text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>New Security Group</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {firewalls.map((fw) => (
                <button
                  key={fw.id}
                  onClick={() => setSelectedFirewallId(fw.id)}
                  className={`p-4 rounded-lg text-left transition-colors border ${
                    activeFirewall.id === fw.id
                      ? "bg-white dark:bg-[#1C2029] border-blue-500 shadow-xs"
                      : "bg-[#F6F6F4] dark:bg-[#161920] border-[#E7E4DF] dark:border-[#282D3A] hover:bg-white dark:hover:bg-[#161922] hover:border-slate-300 dark:hover:border-[#33394D]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-200">
                      {fw.name}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="mt-2 text-[11px] text-[#8C8B87] dark:text-slate-400">
                    {fw.rules.length} rules • {fw.attachedInstanceIds.length} attached droplets
                  </div>
                </button>
              ))}
            </div>

            {/* Security Group Detail Card */}
            <div className="nixtio-card border border-[#E7E4DF]/60 dark:border-[#282D3A] overflow-hidden">
              <div className="p-4 border-b border-[#E7E4DF] dark:border-[#282D3A] flex items-center justify-between bg-[#F6F6F4] dark:bg-[#161920]">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                    {activeFirewall.name}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Default policy: Drop all unmatching ingress
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddRuleOpen(true)}
                    className="h-8 px-3 rounded bg-[#222222] hover:bg-[#111111] dark:bg-white dark:text-[#1E1E1E] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Rule</span>
                  </button>
                  <button
                    onClick={() => deleteFirewall(activeFirewall.id)}
                    className="h-8 w-8 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center cursor-pointer"
                    title="Delete Security Group"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Rules Table */}
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F6F6F4] dark:bg-[#161920] text-[#8C8B87] dark:text-slate-400 uppercase tracking-wider font-medium text-[11px] border-b border-[#E7E4DF] dark:border-[#282D3A]">
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
                            className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                              r.type === "inbound"
                                ? "bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-600/20"
                                : "bg-emerald-50 dark:bg-emerald-500/10 text-[#4EA871] dark:text-[#56B87C] border-emerald-200 dark:border-emerald-500/20"
                            }`}
                          >
                            {r.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-200">
                          {r.label}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                          {r.protocol.toUpperCase()} : {r.ports}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#8C8B87] dark:text-slate-400 text-[11px]">
                          {r.sources.join(", ")}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-mono text-[#4EA871] dark:text-[#56B87C] bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium">
                            ACCEPT
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => deleteFirewallRule(activeFirewall.id, r.id)}
                            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Attached Droplets Section */}
              <div className="p-4 border-t border-[#E7E4DF] dark:border-[#282D3A] bg-[#FAF9F7] dark:bg-[#181C24] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-[#1E1E1E] dark:text-white flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-blue-500" />
                      Attached Droplets ({attachedInstances.length})
                    </h4>
                    <p className="text-[11px] text-[#8C8B87] dark:text-slate-400">
                      Compute droplet instances protected by this security group policy.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (unattachedInstances.length > 0) {
                        setInstanceToAttach(unattachedInstances[0].id);
                      }
                      setIsAttachDropletOpen(true);
                    }}
                    className="h-7 px-2.5 rounded bg-[#EFECE8] dark:bg-[#232834] hover:bg-slate-200 dark:hover:bg-[#252B3D] border border-[#E7E4DF] dark:border-[#282D3A] text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Attach Droplet</span>
                  </button>
                </div>

                {attachedInstances.length === 0 ? (
                  <div className="py-4 text-center text-xs text-[#8C8B87] dark:text-slate-400 border border-dashed border-[#E7E4DF] dark:border-[#282D3A] rounded-md">
                    No droplets currently attached to this security group. Click &quot;Attach Droplet&quot; to bind an instance.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {attachedInstances.map((inst) => (
                      <div
                        key={inst.id}
                        className="p-2.5 rounded bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-xs text-slate-900 dark:text-slate-200 truncate flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="truncate">{inst.name}</span>
                          </div>
                          <div className="text-[10px] font-mono text-[#8C8B87] dark:text-slate-400">
                            {inst.ipv4 || "No Public IP"} • {inst.region.toUpperCase()}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDetachDroplet(inst.id)}
                          className="w-6 h-6 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center shrink-0 cursor-pointer"
                          title="Detach Droplet"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null)}

      {/* 2. VPC Networks */}
      {activeTab === "vpcs" && (
        <div className="nixtio-card border border-[#E7E4DF]/60 dark:border-[#282D3A] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F6F4] dark:bg-[#161920] text-[#8C8B87] dark:text-slate-400 uppercase tracking-wider font-medium text-[11px] border-b border-[#E7E4DF] dark:border-[#282D3A]">
              <tr>
                <th className="py-2.5 px-4">VPC Name</th>
                <th className="py-2.5 px-4">Region</th>
                <th className="py-2.5 px-4">Subnet CIDR Range</th>
                <th className="py-2.5 px-4">Default VPC</th>
                <th className="py-2.5 px-4">Connected Droplets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E4DF] dark:divide-[#282D3A]">
              {vpcs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[#8C8B87] dark:text-slate-400">
                    No VPC Networks provisioned yet.
                  </td>
                </tr>
              ) : (
                vpcs.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/75 dark:hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-200">
                      {v.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#8C8B87] dark:text-slate-400 uppercase">
                      {v.region}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-900 dark:text-slate-200">{v.cidr}</td>
                    <td className="py-3 px-4">
                      {v.isDefault ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-600/20">
                          DEFAULT
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {v.connectedInstancesCount} Droplets
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Attach Droplet Modal */}
      {isAttachDropletOpen && activeFirewall && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] rounded-lg shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#1E1E1E] dark:text-white flex items-center gap-1.5">
                <Server className="w-4 h-4 text-blue-500" />
                Attach Droplet to {activeFirewall.name}
              </h3>
              <button
                onClick={() => setIsAttachDropletOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAttachDropletSubmit} className="space-y-4">
              {unattachedInstances.length === 0 ? (
                <p className="text-xs text-slate-500">
                  All your active compute droplet instances are already attached to this security group.
                </p>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Select Compute Droplet
                  </label>
                  <select
                    value={instanceToAttach}
                    onChange={(e) => setInstanceToAttach(e.target.value)}
                    className="w-full h-9 px-3 rounded bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-slate-200 focus:outline-none focus:border-blue-500"
                    required
                  >
                    {unattachedInstances.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.ipv4 || "Pending IP"} • {inst.region.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAttachDropletOpen(false)}
                  className="h-8 px-3.5 rounded-full bg-[#EFECE8] dark:bg-[#232834] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#252B3D] cursor-pointer"
                >
                  Cancel
                </button>
                {unattachedInstances.length > 0 && (
                  <button
                    type="submit"
                    className="h-8 px-4 rounded bg-[#222222] hover:bg-[#111111] dark:bg-white dark:text-[#1E1E1E] text-white text-xs font-semibold cursor-pointer shadow-sm"
                  >
                    Attach Droplet
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Rule Modal */}
      {isAddRuleOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] rounded-lg shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#1E1E1E] dark:text-white">
              Add Security Group Rule
            </h3>
            <form onSubmit={handleAddRuleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Rule Label
                </label>
                <input
                  type="text"
                  value={ruleLabel}
                  onChange={(e) => setRuleLabel(e.target.value)}
                  className="w-full h-9 px-3 rounded bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-slate-200 focus:outline-none focus:border-blue-500"
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
                    className="w-full h-9 px-3 rounded bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-slate-200 focus:outline-none focus:border-blue-500"
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
                    onChange={(e) =>
                      setRuleProtocol(e.target.value as "tcp" | "udp" | "icmp" | "all")
                    }
                    className="w-full h-9 px-3 rounded bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="tcp">TCP</option>
                    <option value="udp">UDP</option>
                    <option value="icmp">ICMP (Ping)</option>
                    <option value="all">All Traffic</option>
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
                  className="w-full h-9 px-3 rounded bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-mono text-[#1E1E1E] dark:text-slate-200 focus:outline-none focus:border-blue-500"
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
                  className="w-full h-9 px-3 rounded bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-mono text-[#1E1E1E] dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddRuleOpen(false)}
                  className="h-8 px-3.5 rounded-full bg-[#EFECE8] dark:bg-[#232834] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#252B3D] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded bg-[#222222] hover:bg-[#111111] dark:bg-white dark:text-[#1E1E1E] text-white text-xs font-semibold cursor-pointer shadow-sm"
                >
                  Add Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Security Group Modal */}
      {isCreateFirewallOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] rounded-lg shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#1E1E1E] dark:text-white">
              Create Security Group
            </h3>
            <form onSubmit={handleCreateFirewallSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Security Group Name
                </label>
                <input
                  type="text"
                  value={newFirewallName}
                  onChange={(e) => setNewFirewallName(e.target.value)}
                  placeholder="e.g. web-production-sg"
                  className="w-full h-9 px-3 rounded bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Default Template Rules
                </label>
                <p className="text-[11px] text-[#8C8B87] dark:text-slate-400">
                  Initializes standard SSH (port 22) and Web (ports 80 &amp; 443) ingress with full
                  outbound egress. You can customize additional rules anytime.
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateFirewallOpen(false)}
                  className="h-8 px-3.5 rounded-full bg-[#EFECE8] dark:bg-[#232834] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#252B3D] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFirewall}
                  className="h-8 px-4 rounded bg-[#222222] hover:bg-[#111111] dark:bg-white dark:text-[#1E1E1E] text-white text-xs font-semibold cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmittingFirewall ? "Creating..." : "Create Security Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
