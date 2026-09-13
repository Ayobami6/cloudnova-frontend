"use client";

import React, { useState } from "react";
import {
  Shield,
  Plus,
  Server,
  Activity,
  Globe,
  Trash2,
  CheckCircle2,
  Lock,
  Radio,
  Sliders,
} from "lucide-react";
import { useCloud } from "@/lib/store/cloud-context";
import { FirewallRule } from "@/lib/types/cloud";

export default function NetworkPage() {
  const {
    firewalls,
    vpcs,
    loadBalancers,
    floatingIps,
    instances,
    createFirewall,
    deleteFirewall,
    addFirewallRule,
    deleteFirewallRule,
  } = useCloud();

  const [activeTab, setActiveTab] = useState<
    "firewalls" | "loadbalancers" | "vpcs" | "floatingips" | "ddos"
  >("firewalls");

  const [selectedFirewallId, setSelectedFirewallId] = useState<string>(firewalls[0]?.id || "");
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [ruleType, setRuleType] = useState<"inbound" | "outbound">("inbound");
  const [ruleProtocol, setRuleProtocol] = useState<"tcp" | "udp" | "icmp" | "all">("tcp");
  const [rulePorts, setRulePorts] = useState("8080");
  const [ruleSources, setRuleSources] = useState("0.0.0.0/0");
  const [ruleLabel, setRuleLabel] = useState("Custom Web Port");

  const activeFirewall = firewalls.find((f) => f.id === selectedFirewallId) || firewalls[0];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Networking & Zero-Trust Security
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Stateful packet filtering, Layer 4/7 load balancers, private VPC subnets, and Anycast Floating IPs.
          </p>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex items-center rounded-md bg-slate-100 dark:bg-[#161922] border border-slate-200 dark:border-[#232736] p-0.5 text-xs">
          {[
            { id: "firewalls", label: "Firewalls" },
            { id: "loadbalancers", label: "Load Balancers" },
            { id: "vpcs", label: "VPC Networks" },
            { id: "floatingips", label: "Static Anycast IPs" },
            { id: "ddos", label: "DDoS Shield" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 rounded-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Firewalls */}
      {activeTab === "firewalls" && activeFirewall && (
        <div className="space-y-6">
          {/* Firewalls Selector Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {firewalls.map((fw) => (
              <button
                key={fw.id}
                onClick={() => setSelectedFirewallId(fw.id)}
                className={`p-4 rounded-lg text-left transition-colors border ${
                  activeFirewall.id === fw.id
                    ? "bg-white dark:bg-[#161922] border-blue-500 shadow-xs"
                    : "bg-slate-50 dark:bg-[#11131A] border-slate-200 dark:border-[#232736] hover:bg-white dark:hover:bg-[#161922] hover:border-slate-300 dark:hover:border-[#33394D]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900 dark:text-slate-200">{fw.name}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  {fw.rules.length} rules • {fw.attachedInstanceIds.length} attached droplets
                </div>
              </button>
            ))}
          </div>

          {/* Firewall Detail Card */}
          <div className="rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-[#232736] flex items-center justify-between bg-slate-50 dark:bg-[#11131A]">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">{activeFirewall.name}</h3>
                <span className="text-[11px] text-slate-500">Default policy: Drop all unmatching ingress</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddRuleOpen(true)}
                  className="h-8 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Rule</span>
                </button>
                <button
                  onClick={() => deleteFirewall(activeFirewall.id)}
                  className="h-8 w-8 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Rules Table */}
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#11131A] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium text-[11px] border-b border-slate-200 dark:border-[#232736]">
                <tr>
                  <th className="py-2.5 px-4">Direction</th>
                  <th className="py-2.5 px-4">Rule Description</th>
                  <th className="py-2.5 px-4">Protocol & Ports</th>
                  <th className="py-2.5 px-4">Sources / Destinations</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#232736]">
                {activeFirewall.rules.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/75 dark:hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                        r.type === "inbound"
                          ? "bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-600/20"
                          : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                      }`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-200">{r.label}</td>
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {r.protocol.toUpperCase()} : {r.ports}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                      {r.sources.join(", ")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium">
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Load Balancers */}
      {activeTab === "loadbalancers" && (
        <div className="rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#11131A] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium text-[11px] border-b border-slate-200 dark:border-[#232736]">
              <tr>
                <th className="py-2.5 px-4">Load Balancer Name</th>
                <th className="py-2.5 px-4">VIP Address</th>
                <th className="py-2.5 px-4">Protocol & Port</th>
                <th className="py-2.5 px-4">Algorithm</th>
                <th className="py-2.5 px-4">SSL Offload</th>
                <th className="py-2.5 px-4">Target Droplets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#232736]">
              {loadBalancers.map((lb) => (
                <tr key={lb.id} className="hover:bg-slate-50/75 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-200">{lb.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{lb.ip}</td>
                  <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">{lb.protocol} : {lb.port}</td>
                  <td className="py-3 px-4 capitalize text-slate-700 dark:text-slate-300">{lb.algorithm.replace("_", " ")}</td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">✓ Auto Let&apos;s Encrypt</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{lb.targetInstanceIds.length} active backends</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. VPC Networks */}
      {activeTab === "vpcs" && (
        <div className="rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#11131A] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium text-[11px] border-b border-slate-200 dark:border-[#232736]">
              <tr>
                <th className="py-2.5 px-4">VPC Name</th>
                <th className="py-2.5 px-4">Region</th>
                <th className="py-2.5 px-4">Subnet CIDR Range</th>
                <th className="py-2.5 px-4">Default VPC</th>
                <th className="py-2.5 px-4">Connected Droplets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#232736]">
              {vpcs.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/75 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-200">{v.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 uppercase">{v.region}</td>
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
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{v.connectedInstancesCount} Droplets</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Floating Anycast IPs */}
      {activeTab === "floatingips" && (
        <div className="rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#11131A] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium text-[11px] border-b border-slate-200 dark:border-[#232736]">
              <tr>
                <th className="py-2.5 px-4">Reserved Static IP</th>
                <th className="py-2.5 px-4">Datacenter Region</th>
                <th className="py-2.5 px-4">Assigned Resource</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#232736]">
              {floatingIps.map((fip) => {
                const assigned = instances.find((i) => i.id === fip.assignedInstanceId);
                return (
                  <tr key={fip.id} className="hover:bg-slate-50/75 dark:hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-slate-200">{fip.ip}</td>
                    <td className="py-3 px-4 font-mono uppercase text-slate-500 dark:text-slate-400">{fip.region}</td>
                    <td className="py-3 px-4">
                      {assigned ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                          <Server className="w-3.5 h-3.5" />
                          {assigned.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned (Standby pool)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="h-7 px-2.5 rounded bg-slate-100 dark:bg-[#1E2230] hover:bg-slate-200 dark:hover:bg-[#252B3D] border border-slate-200 dark:border-[#232736] text-[11px] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                        Reassign IP
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. DDoS Shield */}
      {activeTab === "ddos" && (
        <div className="p-6 rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#232736]">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                CloudNova DDoS Shield Active
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Upstream Anycast BGP scrubbing centers inspect all inbound ingress at Layer 3/4/7.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
              100% OPERATIONAL
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736]">
              <span className="text-slate-500 block">Threats Blocked (Last 24h)</span>
              <span className="text-xl font-mono font-semibold text-slate-900 dark:text-slate-100 mt-1 block">14,280</span>
            </div>
            <div className="p-4 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736]">
              <span className="text-slate-500 block">Peak Mitigated Volume</span>
              <span className="text-xl font-mono font-semibold text-slate-900 dark:text-slate-100 mt-1 block">82.4 Gbps</span>
            </div>
            <div className="p-4 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736]">
              <span className="text-slate-500 block">Scrubbing Latency Added</span>
              <span className="text-xl font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">&lt; 1.2ms</span>
            </div>
          </div>
        </div>
      )}

      {/* Add Rule Modal */}
      {isAddRuleOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] rounded-lg shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Add Firewall Rule</h3>
            <form onSubmit={handleAddRuleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Rule Label</label>
                <input
                  type="text"
                  value={ruleLabel}
                  onChange={(e) => setRuleLabel(e.target.value)}
                  className="w-full h-9 px-3 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Direction</label>
                  <select
                    value={ruleType}
                    onChange={(e) => setRuleType(e.target.value as "inbound" | "outbound")}
                    className="w-full h-9 px-3 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="inbound">Inbound (Ingress)</option>
                    <option value="outbound">Outbound (Egress)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Protocol</label>
                  <select
                    value={ruleProtocol}
                    onChange={(e) => setRuleProtocol(e.target.value as "tcp" | "udp" | "icmp" | "all")}
                    className="w-full h-9 px-3 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="tcp">TCP</option>
                    <option value="udp">UDP</option>
                    <option value="icmp">ICMP (Ping)</option>
                    <option value="all">All Traffic</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Port Range (e.g. 80, 443, 8000-9000)</label>
                <input
                  type="text"
                  value={rulePorts}
                  onChange={(e) => setRulePorts(e.target.value)}
                  className="w-full h-9 px-3 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Source CIDR</label>
                <input
                  type="text"
                  value={ruleSources}
                  onChange={(e) => setRuleSources(e.target.value)}
                  className="w-full h-9 px-3 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddRuleOpen(false)}
                  className="h-8 px-3.5 rounded-md bg-slate-100 dark:bg-[#1E2230] border border-slate-200 dark:border-[#232736] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#252B3D] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-sm"
                >
                  Add Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
