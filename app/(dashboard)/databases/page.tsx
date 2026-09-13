"use client";

import React, { useState } from "react";
import {
  Database,
  Plus,
  Server,
  Shield,
  Layers,
  Terminal,
  Eye,
  EyeOff,
  Copy,
  Check,
  RotateCw,
  Trash2,
  Play,
  CheckCircle2,
} from "lucide-react";
import { useCloud } from "@/lib/store/cloud-context";
import { DatabaseCluster } from "@/lib/types/cloud";

export default function DatabasesPage() {
  const { databases, toggleDatabaseHA, destroyDatabase, createDatabase } = useCloud();

  const [activeDbId, setActiveDbId] = useState<string>(databases[0]?.id || "");
  const [activeSubTab, setActiveSubTab] = useState<
    "connection" | "users" | "pools" | "backups" | "replicas" | "console" | "security"
  >("connection");

  const [showPassword, setShowPassword] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // SQL Console Mock State
  const [sqlQuery, setSqlQuery] = useState("SELECT id, name, status, created_at FROM users LIMIT 5;");
  const [queryResult, setQueryResult] = useState<
    { id: number; name: string; status: string; created_at: string }[] | null
  >(null);
  const [queryExecutionTime, setQueryExecutionTime] = useState<number | null>(null);

  // New Cluster Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClusterName, setNewClusterName] = useState("app-db-cluster");
  const [newEngine, setNewEngine] = useState<"postgresql" | "mysql" | "redis" | "mongodb">("postgresql");

  const activeDb = databases.find((d) => d.id === activeDbId) || databases[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 1500);
  };

  const handleRunQuery = (e: React.FormEvent) => {
    e.preventDefault();
    const startTime = performance.now();
    setTimeout(() => {
      setQueryResult([
        { id: 101, name: "Alice Jenkins", status: "active", created_at: "2026-08-10" },
        { id: 102, name: "Marcus Vance", status: "active", created_at: "2026-08-12" },
        { id: 103, name: "Elena Rostova", status: "suspended", created_at: "2026-08-15" },
        { id: 104, name: "Siddharth Rao", status: "active", created_at: "2026-08-20" },
      ]);
      setQueryExecutionTime(Number((performance.now() - startTime).toFixed(1)));
    }, 150);
  };

  const handleCreateCluster = (e: React.FormEvent) => {
    e.preventDefault();
    createDatabase({
      name: newClusterName,
      engine: newEngine,
      region: "nyc1",
      haEnabled: true,
    });
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Managed Databases
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#161922] px-2 py-0.5 rounded border border-slate-200 dark:border-[#232736]">
              {databases.length} clusters
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fully managed PostgreSQL, MySQL, Redis, and MongoDB clusters with automated failover and PITR.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="h-9 px-3.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Database Cluster</span>
        </button>
      </div>

      {/* Cluster Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {databases.map((db) => (
          <button
            key={db.id}
            onClick={() => setActiveDbId(db.id)}
            className={`p-4 rounded-lg text-left transition-colors border ${
              activeDb?.id === db.id
                ? "bg-white dark:bg-[#161922] border-blue-500 shadow-xs"
                : "bg-slate-50 dark:bg-[#11131A] border-slate-200 dark:border-[#232736] hover:bg-white dark:hover:bg-[#161922] hover:border-slate-300 dark:hover:border-[#33394D]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-900 dark:text-slate-200 block truncate">{db.name}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <span className="capitalize">{db.engine} {db.version}</span>
              <span>{db.region.toUpperCase()}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
              <span>{db.haEnabled ? "HA Standby Active" : "Single Node"}</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">+${(db.retailMonthly - db.wholesaleMonthly).toFixed(0)}/mo</span>
            </div>
          </button>
        ))}
      </div>

      {activeDb && (
        <div className="rounded-lg bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] overflow-hidden">
          {/* Active DB Banner */}
          <div className="p-5 border-b border-slate-200 dark:border-[#232736] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-[#11131A]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-600/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{activeDb.name}</h2>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    ONLINE
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Engine: <span className="capitalize text-slate-700 dark:text-slate-200 font-medium">{activeDb.engine} {activeDb.version}</span> • {activeDb.vcpu} vCPU, {activeDb.ramGb} GB RAM, {activeDb.diskAllocatedGb} GB NVMe ({activeDb.diskUsedGb} GB used)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleDatabaseHA(activeDb.id)}
                className={`h-8 px-3 rounded-md border text-xs font-medium transition-colors ${
                  activeDb.haEnabled
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-slate-100 dark:bg-[#1E2230] border-slate-200 dark:border-[#232736] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {activeDb.haEnabled ? "✓ High Availability Enabled" : "Enable HA Standby"}
              </button>
              <button
                onClick={() => destroyDatabase(activeDb.id)}
                className="h-8 w-8 rounded-md bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-colors"
                title="Destroy Cluster"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-Tabs */}
          <div className="flex items-center px-4 border-b border-slate-200 dark:border-[#232736] bg-slate-50 dark:bg-[#11131A] overflow-x-auto gap-2 text-xs font-medium">
            {[
              { id: "connection", label: "Connection Details" },
              { id: "users", label: "Users & DBs" },
              { id: "pools", label: "Connection Pools (PgBouncer)" },
              { id: "backups", label: "Backups & PITR" },
              { id: "replicas", label: "Read Replicas" },
              { id: "console", label: "Interactive SQL" },
              { id: "security", label: "Trusted Sources" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
                className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeSubTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400 font-semibold"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub-Tab Contents */}
          <div className="p-6">
            {/* 1. Connection Details */}
            {activeSubTab === "connection" && (
              <div className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600 dark:text-slate-400 font-medium">Host</label>
                    <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] font-mono text-xs text-slate-800 dark:text-slate-200">
                      <span>{activeDb.host}</span>
                      <button onClick={() => handleCopy(activeDb.host, "host")} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        {copiedText === "host" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600 dark:text-slate-400 font-medium">Port</label>
                    <div className="p-2.5 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] font-mono text-xs text-slate-800 dark:text-slate-200">
                      {activeDb.port}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600 dark:text-slate-400 font-medium">Default Database</label>
                    <div className="p-2.5 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] font-mono text-xs text-slate-800 dark:text-slate-200">
                      {activeDb.defaultDb}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600 dark:text-slate-400 font-medium">Admin User</label>
                    <div className="p-2.5 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] font-mono text-xs text-slate-800 dark:text-slate-200">
                      {activeDb.adminUser}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-medium">Admin Password</label>
                  <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] font-mono text-xs text-slate-800 dark:text-slate-200">
                    <span>{showPassword ? activeDb.adminPasswordReveal : "••••••••••••••••••••"}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => handleCopy(activeDb.adminPasswordReveal, "pwd")} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        {copiedText === "pwd" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-600 dark:text-slate-400 font-medium">Connection URI (Public / SSL Required)</label>
                  <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] font-mono text-xs text-slate-800 dark:text-slate-200">
                    <span className="truncate mr-2">{activeDb.connectionUri}</span>
                    <button onClick={() => handleCopy(activeDb.connectionUri, "uri")} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 shrink-0">
                      {copiedText === "uri" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Users & DBs */}
            {activeSubTab === "users" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200">Database Users</h4>
                  <span className="text-[11px] text-slate-500">{activeDb.users.length} active users</span>
                </div>
                <table className="w-full text-left text-xs border border-slate-200 dark:border-[#232736] rounded-md overflow-hidden">
                  <thead className="bg-slate-50 dark:bg-[#11131A] text-slate-500 dark:text-slate-400 text-[11px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Username</th>
                      <th className="py-2 px-3">Role</th>
                      <th className="py-2 px-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-[#232736]">
                    {activeDb.users.map((u) => (
                      <tr key={u.username} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-800 dark:text-slate-200">{u.username}</td>
                        <td className="py-2.5 px-3 capitalize text-slate-500 dark:text-slate-400">{u.role}</td>
                        <td className="py-2.5 px-3 text-slate-500">{u.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. Pools */}
            {activeSubTab === "pools" && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200">PgBouncer Connection Pools</h4>
                {activeDb.pools.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">No connection pools configured for this database cluster.</p>
                ) : (
                  activeDb.pools.map((p) => (
                    <div key={p.id} className="p-3 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 block">{p.name}</span>
                        <span className="text-[11px] text-slate-500">Mode: {p.mode} • Size: {p.size} connections • User: {p.user}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        ACTIVE
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 4. Backups */}
            {activeSubTab === "backups" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200">Point-in-Time Recovery Snapshots</h4>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">PITR Retention: 7 Days</span>
                </div>
                <div className="space-y-2">
                  {activeDb.backups.map((b) => (
                    <div key={b.id} className="p-3 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 block">{b.createdAt}</span>
                        <span className="text-[11px] text-slate-500">{b.sizeMb} MB compressed NVMe snapshot</span>
                      </div>
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer">
                        Restore to Point
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Read Replicas */}
            {activeSubTab === "replicas" && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200">Geo-Distributed Read Replicas</h4>
                {activeDb.replicas.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">No read replicas configured. Deploy replicas to offload read traffic.</p>
                ) : (
                  activeDb.replicas.map((rep) => (
                    <div key={rep.id} className="p-3 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 block">{rep.name}</span>
                        <span className="text-[11px] text-slate-500">Region: {rep.region.toUpperCase()} • Replication Lag: {rep.lagMs}ms</span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 6. Interactive SQL Console */}
            {activeSubTab === "console" && (
              <div className="space-y-4">
                <form onSubmit={handleRunQuery} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Run Query on {activeDb.defaultDb}</span>
                    <button
                      type="submit"
                      className="h-8 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Execute</span>
                    </button>
                  </div>
                  <textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-md bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </form>

                {queryResult && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Query Results ({queryResult.length} rows)</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">Executed in {queryExecutionTime}ms</span>
                    </div>
                    <div className="overflow-x-auto border border-slate-200 dark:border-[#232736] rounded-md">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-[#11131A] text-slate-500 dark:text-slate-400 text-[11px] uppercase border-b border-slate-200 dark:border-[#232736]">
                          <tr>
                            <th className="py-2 px-3">id</th>
                            <th className="py-2 px-3">name</th>
                            <th className="py-2 px-3">status</th>
                            <th className="py-2 px-3">created_at</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-[#232736] font-mono text-[11px]">
                          {queryResult.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                              <td className="py-2 px-3 text-slate-500 dark:text-slate-400">{row.id}</td>
                              <td className="py-2 px-3 text-slate-800 dark:text-slate-200 font-sans">{row.name}</td>
                              <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400">{row.status}</td>
                              <td className="py-2 px-3 text-slate-500">{row.created_at}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. Security & Trusted Sources */}
            {activeSubTab === "security" && (
              <div className="space-y-3 max-w-xl">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-200">Inbound Network Whitelist (CIDRs)</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Connections from outside these ranges will be dropped by the cloud firewall.</p>
                <div className="space-y-1.5">
                  {activeDb.trustedSources.map((src) => (
                    <div key={src} className="flex items-center justify-between p-2.5 rounded bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] font-mono text-xs text-slate-800 dark:text-slate-200">
                      <span>{src}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-medium">Whitelisted</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Database Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161922] border border-slate-200 dark:border-[#232736] rounded-lg shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Create Managed Database Cluster</h3>
            <form onSubmit={handleCreateCluster} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Cluster Name</label>
                <input
                  type="text"
                  value={newClusterName}
                  onChange={(e) => setNewClusterName(e.target.value)}
                  className="w-full h-9 px-3 rounded-md bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Database Engine</label>
                <select
                  value={newEngine}
                  onChange={(e) => setNewEngine(e.target.value as typeof newEngine)}
                  className="w-full h-9 px-3 rounded-md bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-[#232736] text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="postgresql">PostgreSQL 16.3 (Recommended)</option>
                  <option value="mysql">MySQL 8.4 LTS</option>
                  <option value="redis">Redis 7.2 In-Memory</option>
                  <option value="mongodb">MongoDB 7.0</option>
                </select>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="h-9 px-3.5 rounded-md bg-slate-100 dark:bg-[#1E2230] border border-slate-200 dark:border-[#232736] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#252B3D] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-sm"
                >
                  Provision Cluster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
