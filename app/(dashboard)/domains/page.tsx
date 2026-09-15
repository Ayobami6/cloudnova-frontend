"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  RefreshCw,
  X,
  Sparkles,
} from "lucide-react";
import { useCloud } from "@/lib/store/cloud-context";
import { useToast } from "@/components/ui/toast";
import { DNSRecord } from "@/lib/types/cloud";

interface TldOption {
  tld: string;
  wholesale: number;
  retail: number;
}

const TLD_PRICES: TldOption[] = [
  { tld: ".com", wholesale: 10.0, retail: 15.0 },
  { tld: ".io", wholesale: 32.0, retail: 48.0 },
  { tld: ".cloud", wholesale: 14.0, retail: 22.0 },
  { tld: ".dev", wholesale: 12.0, retail: 18.0 },
  { tld: ".tech", wholesale: 8.0, retail: 16.0 },
];

interface DomainVerificationState {
  status: "idle" | "checking" | "available" | "unavailable" | "error";
  wholesale: number;
  retail: number;
  error?: string;
}

export default function DomainsPage() {
  const {
    domains,
    instances,
    buckets,
    registerDomain,
    checkDomainAvailability,
    addDNSRecord,
    deleteDNSRecord,
    linkDomainToResource,
  } = useCloud();
  const { showToast } = useToast();

  const [selectedDomainId, setSelectedDomainId] = useState<string>(domains[0]?.id || "");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [searchDomain, setSearchDomain] = useState("cloudnova");
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, DomainVerificationState>>({});
  const [isVerifyingAll, setIsVerifyingAll] = useState(false);
  const [isRegistering, setIsRegistering] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

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

  // Build target list of domains to verify
  const getDomainsToVerify = useCallback((query: string) => {
    const clean = query.trim().toLowerCase().replace(/^\.+|\.+$/g, "");
    if (!clean || clean.length < 2) return [];

    const list: Array<{ domainName: string; tld: string; wholesale: number; retail: number }> = [];

    if (clean.includes(".")) {
      const parts = clean.split(".");
      const ext = `.${parts.slice(1).join(".")}`;
      const known = TLD_PRICES.find((t) => t.tld === ext);
      list.push({
        domainName: clean,
        tld: ext,
        wholesale: known ? known.wholesale : 10.0,
        retail: known ? known.retail : 15.0,
      });
    }

    const baseName = clean.includes(".") ? clean.split(".")[0] : clean;
    for (const t of TLD_PRICES) {
      const full = `${baseName}${t.tld}`;
      if (!list.some((item) => item.domainName === full)) {
        list.push({
          domainName: full,
          tld: t.tld,
          wholesale: t.wholesale,
          retail: t.retail,
        });
      }
    }

    return list;
  }, []);

  // Verification executor
  const verifyAvailability = useCallback(
    async (domainQuery: string) => {
      const candidates = getDomainsToVerify(domainQuery);
      if (candidates.length === 0) {
        setAvailabilityMap({});
        return;
      }

      setAvailabilityMap((prev) => {
        const next: Record<string, DomainVerificationState> = { ...prev };
        for (const item of candidates) {
          next[item.domainName] = {
            status: "checking",
            wholesale: prev[item.domainName]?.wholesale ?? item.wholesale,
            retail: prev[item.domainName]?.retail ?? item.retail,
          };
        }
        return next;
      });

      setIsVerifyingAll(true);
      setRegisterError(null);

      await Promise.allSettled(
        candidates.map(async (item) => {
          try {
            const res = await checkDomainAvailability(item.domainName);
            setAvailabilityMap((prev) => ({
              ...prev,
              [item.domainName]: {
                status: res.available ? "available" : "unavailable",
                wholesale: res.wholesalePrice || item.wholesale,
                retail: res.retailPrice || item.retail,
              },
            }));
          } catch {
            setAvailabilityMap((prev) => ({
              ...prev,
              [item.domainName]: {
                status: "error",
                error: "Verification failed",
                wholesale: item.wholesale,
                retail: item.retail,
              },
            }));
          }
        })
      );

      setIsVerifyingAll(false);
    },
    [checkDomainAvailability, getDomainsToVerify]
  );

  // Trigger verification whenever modal opens or input changes (debounced)
  useEffect(() => {
    if (!isRegisterOpen) return;
    const clean = searchDomain.trim().toLowerCase().replace(/^\.+|\.+$/g, "");
    if (!clean || clean.length < 2) {
      setAvailabilityMap({});
      return;
    }

    const timer = setTimeout(() => {
      verifyAvailability(clean);
    }, 350);

    return () => clearTimeout(timer);
  }, [isRegisterOpen, searchDomain, verifyAvailability]);

  // Registration submit handler
  const handleRegister = async (
    fullDomainName: string,
    tld: string,
    wholesale: number,
    retail: number
  ) => {
    setRegisterError(null);
    setIsRegistering(fullDomainName);

    try {
      const result = await registerDomain(fullDomainName, tld, wholesale, retail);
      if (result.success && result.domain) {
        showToast({
          type: "success",
          title: "Domain Registered Successfully",
          message: `${fullDomainName} is now active with Route 53 DNS and WHOIS privacy.`,
        });
        setSelectedDomainId(result.domain.id);
        setIsRegisterOpen(false);
      } else {
        setRegisterError(result.error || "Failed to register domain.");
      }
    } catch {
      setRegisterError("Unexpected error registering domain.");
    } finally {
      setIsRegistering(null);
    }
  };

  const currentCandidates = getDomainsToVerify(searchDomain);

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
          onClick={() => {
            setIsRegisterOpen(true);
            setRegisterError(null);
          }}
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

      {/* Register & Verify Domain Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] rounded-xl shadow-2xl w-full max-w-xl p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Register & Verify Domain</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time Route 53 registrar verification with automated Anycast DNS and WHOIS privacy.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Banner */}
            {registerError && (
              <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold">Registration Unsuccessful</p>
                  <p className="leading-relaxed">{registerError}</p>
                </div>
              </div>
            )}

            {/* Search Domain Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between">
                <span>Domain Name Search</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Type base name or specific FQDN (e.g. cloudnova or startup.io)
                </span>
              </label>
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchDomain}
                    onChange={(e) => setSearchDomain(e.target.value)}
                    placeholder="e.g. yourstartup or yourstartup.com"
                    className="w-full h-10 pl-9 pr-8 rounded-lg bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  />
                  {searchDomain && (
                    <button
                      type="button"
                      onClick={() => setSearchDomain("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => verifyAvailability(searchDomain)}
                  disabled={isVerifyingAll || searchDomain.trim().length < 2}
                  className="h-10 px-3.5 rounded-lg bg-slate-100 dark:bg-[#1E2230] hover:bg-slate-200 dark:hover:bg-[#272D3F] border border-slate-200 dark:border-[#232736] text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingAll ? "animate-spin text-blue-500" : ""}`} />
                  <span>Verify All</span>
                </button>
              </div>
            </div>

            {/* Results / Verification List */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Domain Verification Results</span>
                {isVerifyingAll && (
                  <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Verifying availability...
                  </span>
                )}
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {currentCandidates.length === 0 ? (
                  <div className="p-6 text-center rounded-lg border border-dashed border-slate-200 dark:border-[#232736] text-xs text-slate-400">
                    Type a domain name above to verify availability
                  </div>
                ) : (
                  currentCandidates.map((item) => {
                    const domainKey = item.domainName;
                    const state = availabilityMap[domainKey] || {
                      status: "idle",
                      wholesale: item.wholesale,
                      retail: item.retail,
                    };
                    const isAvailable = state.status === "available";
                    const isUnavailable = state.status === "unavailable";
                    const isChecking = state.status === "checking";
                    const isError = state.status === "error";
                    const currentRetail = state.retail || item.retail;
                    const currentWholesale = state.wholesale || item.wholesale;
                    const isCurrentlyRegistering = isRegistering === domainKey;

                    return (
                      <div
                        key={domainKey}
                        className={`p-3.5 rounded-lg border transition-all flex items-center justify-between gap-4 ${
                          isAvailable
                            ? "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-300 dark:border-emerald-500/30"
                            : isUnavailable
                            ? "bg-slate-50 dark:bg-[#11131A] border-slate-200 dark:border-[#232736] opacity-75"
                            : isChecking
                            ? "bg-blue-50/30 dark:bg-blue-950/10 border-blue-200 dark:border-blue-500/20"
                            : "bg-slate-50 dark:bg-[#11131A] border-slate-200 dark:border-[#232736]"
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                              {domainKey}
                            </span>

                            {/* Status Tag */}
                            {isChecking && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-500/20">
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                Verifying...
                              </span>
                            )}
                            {isAvailable && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                Available
                              </span>
                            )}
                            {isUnavailable && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-500/20">
                                <XCircle className="w-2.5 h-2.5" />
                                Already Registered
                              </span>
                            )}
                            {isError && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/20">
                                <AlertCircle className="w-2.5 h-2.5" />
                                Verification Failed
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span>Wholesale: ${currentWholesale.toFixed(2)}/yr</span>
                            <span>•</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                              Retail: ${currentRetail.toFixed(2)}/yr
                            </span>
                            {isAvailable && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  +${(currentRetail - currentWholesale).toFixed(2)} margin
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="shrink-0">
                          {isAvailable ? (
                            <button
                              type="button"
                              onClick={() => handleRegister(domainKey, item.tld, currentWholesale, currentRetail)}
                              disabled={isCurrentlyRegistering || isRegistering !== null}
                              className="h-8 px-3.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isCurrentlyRegistering ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Registering...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Register (${currentRetail.toFixed(2)}/yr)</span>
                                </>
                              )}
                            </button>
                          ) : isUnavailable ? (
                            <button
                              type="button"
                              disabled
                              className="h-8 px-3 rounded-md bg-slate-100 dark:bg-[#1E2230] text-slate-400 dark:text-slate-500 text-xs font-medium cursor-not-allowed"
                            >
                              Taken
                            </button>
                          ) : isChecking ? (
                            <button
                              type="button"
                              disabled
                              className="h-8 px-3 rounded-md bg-slate-100 dark:bg-[#1E2230] text-slate-400 text-xs font-medium cursor-not-allowed flex items-center gap-1.5"
                            >
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Checking</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => verifyAvailability(domainKey)}
                              className="h-8 px-3 rounded-md bg-slate-100 dark:bg-[#1E2230] hover:bg-slate-200 dark:hover:bg-[#272D3F] text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
                            >
                              Verify
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-200 dark:border-[#232736] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Includes free WHOIS Privacy, SSL, and Route 53 Anycast DNS.</span>
              </div>
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

