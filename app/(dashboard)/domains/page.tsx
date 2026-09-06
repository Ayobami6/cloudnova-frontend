"use client";

import React, { useState } from "react";
import {
  Globe,
  Plus,
  Server,
  HardDrive,
  ShieldCheck,
  Lock,
  Trash2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useCloud } from "@/lib/store/cloud-context";
import { DNSRecord } from "@/lib/types/cloud";

export default function DomainsPage() {
  const {
    domains,
    instances,
    buckets,
    registerDomain,
    addDNSRecord,
    deleteDNSRecord,
    linkDomainToResource,
  } = useCloud();

  const [selectedDomainId, setSelectedDomainId] = useState<string>(domains[0]?.id || "");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [searchDomain, setSearchDomain] = useState("mycompany");

  // DNS Record Form State
  const [recType, setRecType] = useState<"A" | "AAAA" | "CNAME" | "MX" | "TXT">("A");
  const [recName, setRecName] = useState("@");
  const [recValue, setRecValue] = useState("142.93.18.102");
  const [recTtl, setRecTtl] = useState(300);

  const activeDomain = domains.find((d) => d.id === selectedDomainId) || domains[0];

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDomain) return;
    addDNSRecord(activeDomain.id, {
      type: recType,
      name: recName,
      value: recValue,
      ttl: recTtl,
    });
    setRecName("@");
    setRecValue("");
  };

  const handle1ClickLink = (resourceId: string) => {
    if (!activeDomain) return;
    const inst = instances.find((i) => i.id === resourceId);
    if (inst) {
      addDNSRecord(activeDomain.id, {
        type: "A",
        name: "@",
        value: inst.ipv4,
        ttl: 300,
      });
      linkDomainToResource(activeDomain.id, inst.id);
      return;
    }
    const b = buckets.find((bucket) => bucket.id === resourceId);
    if (b) {
      addDNSRecord(activeDomain.id, {
        type: "CNAME",
        name: "@",
        value: `${b.name}.s3.${b.region}.cloudnova.io`,
        ttl: 300,
      });
      linkDomainToResource(activeDomain.id, b.id);
    }
  };

  const tldPrices = [
    { tld: ".com", wholesale: 10.0, retail: 15.0 },
    { tld: ".io", wholesale: 32.0, retail: 48.0 },
    { tld: ".cloud", wholesale: 14.0, retail: 22.0 },
    { tld: ".dev", wholesale: 12.0, retail: 18.0 },
    { tld: ".tech", wholesale: 8.0, retail: 16.0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Domains & Anycast DNS
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#161922] px-2 py-0.5 rounded border border-slate-200 dark:border-[#232736]">
              {domains.length} zones
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global Anycast DNS routing, automated DNSSEC, free Let&apos;s Encrypt SSL, and 1-click cloud resource binding.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="h-9 px-3.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Domain</span>
        </button>
      </div>

      {/* Domain Portfolio Table */}
      <div className="rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-[#11131A] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium text-[11px] border-b border-slate-200 dark:border-[#232736]">
            <tr>
              <th className="py-2.5 px-4">Domain Name</th>
              <th className="py-2.5 px-4">Security & SSL</th>
              <th className="py-2.5 px-4">Auto-Renew & Expiry</th>
              <th className="py-2.5 px-4">Linked Cloud Resource</th>
              <th className="py-2.5 px-4">Annual Retail (Profit)</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-[#232736]">
            {domains.map((dom) => (
              <tr key={dom.id} className="hover:bg-slate-50/75 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4">
                  <span className="font-semibold text-slate-900 dark:text-slate-200 block">{dom.name}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Anycast Active
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <Lock className="w-3 h-3" /> SSL 90d
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                      <ShieldCheck className="w-3 h-3" /> WHOIS Private
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                  <span>{dom.expiresAt}</span>
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Auto-renew enabled</span>
                </td>
                <td className="py-3 px-4">
                  {dom.linkedResourceId ? (
                    <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-mono text-[11px]">
                      <Server className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      {dom.linkedResourceId}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Unlinked (Custom DNS)</span>
                  )}
                </td>
                <td className="py-3 px-4 font-mono">
                  <span className="text-slate-900 dark:text-slate-200 font-semibold block">${dom.retailAnnual}/yr</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    +${(dom.retailAnnual - dom.wholesaleAnnual).toFixed(2)} margin
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => setSelectedDomainId(dom.id)}
                    className={`h-7 px-3 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      activeDomain?.id === dom.id
                        ? "bg-blue-600 text-white font-semibold shadow-sm"
                        : "bg-slate-100 dark:bg-[#1E2230] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#252B3D] border border-slate-200 dark:border-[#232736]"
                    }`}
                  >
                    Manage DNS
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Active DNS Zone Editor */}
      {activeDomain && (
        <div className="rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] overflow-hidden p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-[#232736]">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                DNS Zone Editor: <span className="text-blue-600 dark:text-blue-400 font-mono">{activeDomain.name}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Anycast Nameservers: ns1.cloudnova-dns.net, ns2.cloudnova-dns.net
              </p>
            </div>

            {/* 1-Click Resource Pointer */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">1-Click Resource Pointer:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) handle1ClickLink(e.target.value);
                }}
                className="h-8 px-2.5 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs text-slate-800 dark:text-slate-200"
                defaultValue=""
              >
                <option value="" disabled>Point to Droplet or S3...</option>
                {instances.map((i) => (
                  <option key={i.id} value={i.id}>Droplet: {i.name} ({i.ipv4})</option>
                ))}
                {buckets.map((b) => (
                  <option key={b.id} value={b.id}>S3 Space: {b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Record Form */}
          <form onSubmit={handleAddRecord} className="p-3 bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] rounded-md grid grid-cols-5 gap-3 items-end">
            <div>
              <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1 font-medium">Type</label>
              <select
                value={recType}
                onChange={(e) => setRecType(e.target.value as "A" | "AAAA" | "CNAME" | "MX" | "TXT")}
                className="w-full h-8 px-2 rounded bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="A">A (IPv4)</option>
                <option value="AAAA">AAAA (IPv6)</option>
                <option value="CNAME">CNAME (Alias)</option>
                <option value="MX">MX (Mail)</option>
                <option value="TXT">TXT (Verification)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1 font-medium">Hostname (@ / subdomain)</label>
              <input
                type="text"
                value={recName}
                onChange={(e) => setRecName(e.target.value)}
                className="w-full h-8 px-2 rounded bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] text-xs font-mono text-slate-800 dark:text-slate-200"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1 font-medium">Target Value / IP</label>
              <input
                type="text"
                value={recValue}
                onChange={(e) => setRecValue(e.target.value)}
                className="w-full h-8 px-2 rounded bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] text-xs font-mono text-slate-800 dark:text-slate-200"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1 font-medium">TTL (Seconds)</label>
              <input
                type="number"
                value={recTtl}
                onChange={(e) => setRecTtl(Number(e.target.value))}
                className="w-full h-8 px-2 rounded bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] text-xs font-mono text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full h-8 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Add Record
              </button>
            </div>
          </form>

          {/* Records Table */}
          <table className="w-full text-left text-xs border border-slate-200 dark:border-[#232736] rounded-md overflow-hidden">
            <thead className="bg-slate-50 dark:bg-[#11131A] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium text-[11px] border-b border-slate-200 dark:border-[#232736]">
              <tr>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Value</th>
                <th className="py-2.5 px-3">TTL</th>
                <th className="py-2.5 px-3 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#232736] font-mono text-xs">
              {activeDomain.records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/75 dark:hover:bg-white/[0.02]">
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-600/10 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-600/20">
                      {r.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 dark:text-slate-200">{r.name}</td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 truncate max-w-xs">{r.value}</td>
                  <td className="py-2.5 px-3 text-slate-500">{r.ttl}s</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => deleteDNSRecord(activeDomain.id, r.id)}
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
      )}

      {/* Register Domain Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] rounded-lg shadow-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Register Top-Level Domain</h3>
            <div className="space-y-2">
              <label className="text-xs text-slate-600 dark:text-slate-400 font-medium">Search Domain Name</label>
              <input
                type="text"
                value={searchDomain}
                onChange={(e) => setSearchDomain(e.target.value)}
                placeholder="e.g. yourstartup"
                className="w-full h-9 px-3 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Available TLDs:</span>
              <div className="space-y-1.5">
                {tldPrices.map((t) => (
                  <div
                    key={t.tld}
                    className="p-3 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-200">
                        {searchDomain.toLowerCase()}{t.tld}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Wholesale: ${t.wholesale}/yr • Default Retail: ${t.retail}/yr
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        registerDomain(searchDomain, t.tld, t.wholesale, t.retail);
                        setIsRegisterOpen(false);
                      }}
                      className="h-8 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      Register (${t.retail}/yr)
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="h-8 px-4 rounded-md bg-slate-100 dark:bg-[#1E2230] border border-slate-200 dark:border-[#232736] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#252B3D] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
