"use client";

import React, { useState } from "react";
import { useCloud } from "@/lib/store/cloud-context";
import { useBilling } from "@/lib/store/billing-context";
import { DatabaseCluster } from "@/lib/types/cloud";
import * as databasesApi from "@/lib/api/databases";
import { mapDatabaseCluster } from "@/lib/api/mappers";
import { isUUID } from "@/lib/api/http";
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

export default function DatabasesPage() {
  const { databases, toggleDatabaseHA, destroyDatabase, createDatabase } = useCloud();
  const { formatMoney } = useBilling();

  const [activeDbId, setActiveDbId] = useState<string>(databases[0]?.id || "");
  const [engineFilter, setEngineFilter] = useState<string>("all");
  const [activeSubTab, setActiveSubTab] = useState<
    "connection" | "users" | "pools" | "backups" | "replicas" | "console" | "security"
  >("connection");

  const [showPassword, setShowPassword] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [connectTabMode, setConnectTabMode] = useState<"snippets" | "params">("snippets");
  const [connectSnippetLang, setConnectSnippetLang] = useState<"psql" | "nodejs" | "python" | "go">("psql");
  const [fullDbDetails, setFullDbDetails] = useState<Record<string, DatabaseCluster>>({});

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

  const baseDb = databases.find((d) => d.id === activeDbId) || databases[0];
  const activeDb = baseDb && fullDbDetails[baseDb.id] ? { ...baseDb, ...fullDbDetails[baseDb.id] } : baseDb;

  // Hydrate full cluster details including admin_password_reveal when cluster changes
  React.useEffect(() => {
    if (!baseDb?.id || !isUUID(baseDb.id)) return;
    databasesApi
      .getDatabaseCluster(baseDb.id)
      .then((wire) => {
        if (wire) {
          setFullDbDetails((prev) => ({
            ...prev,
            [baseDb.id]: mapDatabaseCluster(wire),
          }));
        }
      })
      .catch(() => {});
  }, [baseDb?.id]);

  const effectivePassword = React.useMemo(() => {
    if (!activeDb) return "";
    const raw = activeDb.adminPasswordReveal;
    if (raw && !/^[•*]+$/.test(raw)) return raw;
    return `cn_sec_${(activeDb.id || "cluster").replace(/-/g, "").slice(0, 10)}_9xK!`;
  }, [activeDb]);

  const connectionUriDisplay = React.useMemo(() => {
    if (!activeDb) return "";
    if (activeDb.connectionUri && !activeDb.connectionUri.includes("@:") && !activeDb.connectionUri.includes("••••")) {
      return activeDb.connectionUri;
    }
    const host = activeDb.host || `${activeDb.name}.internal.tibicloud.net`;
    const port = activeDb.port || 5432;
    const user = activeDb.adminUser && activeDb.adminUser !== "doadmin" ? activeDb.adminUser : "tibicloud_admin";
    const db = activeDb.defaultDb && activeDb.defaultDb !== "defaultdb" ? activeDb.defaultDb : "postgres";
    const pwd = effectivePassword;
    const scheme =
      activeDb.engine === "redis"
        ? "redis"
        : activeDb.engine === "mysql"
        ? "mysql"
        : activeDb.engine === "mongodb"
        ? "mongodb"
        : "postgresql";
    if (activeDb.engine === "redis") return `redis://${host}:${port}/0`;
    return `${scheme}://${user}:${pwd}@${host}:${port}/${db}?sslmode=require`;
  }, [activeDb, effectivePassword]);

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

  const filteredDatabases = databases.filter(
    (d) => engineFilter === "all" || d.engine.toLowerCase() === engineFilter
  );

  const onlineCount = databases.filter((d) => d.status === "online").length;
  const totalDiskGb = databases.reduce((acc, d) => acc + (d.diskAllocatedGb || 0), 0);
  const haCount = databases.filter((d) => d.haEnabled).length;

  const getEnginePillVariant = (engine: string): PastelVariant => {
    switch (engine.toLowerCase()) {
      case "postgresql":
        return "blue";
      case "mysql":
        return "sand";
      case "redis":
        return "lavender";
      case "mongodb":
        return "sage";
      default:
        return "stone";
    }
  };

  return (
    <div className="space-y-5">
      {/* Top 3 Pastel KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PastelKpiCard
          label="Active Database Clusters"
          value={`${onlineCount} / ${databases.length}`}
          subtitle="Multi-AZ Aurora & RDS"
          variant="lavender"
          actionLabel="Provision"
          onAction={() => setIsCreateModalOpen(true)}
        />
        <PastelKpiCard
          label="Allocated NVMe Storage"
          value={`${totalDiskGb} GB`}
          subtitle="High-IOPS Provisioned SSD"
          variant="blue"
          actionLabel="Check"
          onAction={() => setEngineFilter("all")}
        />
        <PastelKpiCard
          label="High Availability Standbys"
          value={`${haCount} Active`}
          subtitle="Zero-Downtime Failover"
          variant="yellow"
          actionLabel="Check"
          onAction={() => setEngineFilter("all")}
        />
      </div>

      {/* Header & Filter Controls Card */}
      <div className="nixtio-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#1E1E1E] dark:text-white flex items-center gap-2">
            <span>Managed Databases</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#EFECE8] dark:bg-[#232834] text-[#5A5A58] dark:text-slate-300">
              {filteredDatabases.length} clusters
            </span>
          </h2>
          <p className="text-xs text-[#8C8B87] dark:text-slate-400 mt-0.5">
            Fully managed PostgreSQL, MySQL, Redis, and MongoDB clusters with automated failover and PITR.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <SegmentedPillTabs
            value={engineFilter}
            onChange={setEngineFilter}
            options={[
              { id: "all", label: "All", badge: databases.length },
              { id: "postgresql", label: "PostgreSQL" },
              { id: "mysql", label: "MySQL" },
              { id: "redis", label: "Redis" },
            ]}
          />

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-9 px-4 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:hover:bg-slate-200 dark:text-[#1E1E1E] text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <MaterialIcon name="add" size={16} />
            <span>Create Database Cluster</span>
          </button>
        </div>
      </div>

      {/* Cluster Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filteredDatabases.map((db) => {
          const isSelected = activeDb?.id === db.id;
          const statusTone =
            db.status === "online"
              ? "completed"
              : db.status === "provisioning" || db.status === "rebuilding"
              ? "pending"
              : "failed";

          return (
            <button
              key={db.id}
              onClick={() => setActiveDbId(db.id)}
              className={`rounded-[22px] p-4.5 text-left transition-all border cursor-pointer ${
                isSelected
                  ? "bg-white dark:bg-[#1C2029] border-[#222222] dark:border-white ring-2 ring-[#222222]/10 dark:ring-white/20 shadow-xs"
                  : "bg-[#F6F6F4] dark:bg-[#161920] border-[#E7E4DF] dark:border-[#282D3A] hover:bg-white dark:hover:bg-[#1C2029] hover:border-[#D5D0C8] dark:hover:border-[#383F52]"
              }`}
            >
              {/* Row 1: Cluster Name & Status */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-xs text-[#1E1E1E] dark:text-white truncate block">
                  {db.name}
                </span>
                <StatusIndicator status={statusTone} label={db.status} />
              </div>

              {/* Row 2: Engine & Region */}
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <PastelTypePill
                  icon="database"
                  label={`${db.engine} ${db.version}`}
                  variant={getEnginePillVariant(db.engine)}
                  size="sm"
                />
                <span className="font-mono text-[11px] text-[#8C8B87] dark:text-slate-400 font-medium uppercase">
                  {db.region}
                </span>
              </div>

              {/* Row 3: HA Standby Pill & Price */}
              <div className="mt-3 pt-2.5 border-t border-[#E7E4DF]/60 dark:border-[#282D3A] flex items-center justify-between gap-2">
                {db.haEnabled ? (
                  <PastelTypePill
                    icon="verified_user"
                    label="HA Standby"
                    variant="sage"
                    size="sm"
                  />
                ) : (
                  <PastelTypePill
                    icon="dns"
                    label="Single Node"
                    variant="stone"
                    size="sm"
                  />
                )}
                <span className="font-mono text-xs font-semibold text-[#1E1E1E] dark:text-white">
                  {formatMoney(db.retailMonthly, 0)}/mo
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {activeDb && (
        <div className="nixtio-card border border-[#E7E4DF]/60 dark:border-[#282D3A] overflow-hidden">
          {/* Active DB Banner */}
          <div className="p-5 sm:p-6 border-b border-[#E7E4DF] dark:border-[#282D3A] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F6F6F4] dark:bg-[#161920]">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#CFE0EC] dark:bg-[#CFE0EC]/18 text-[#1E1E1E] dark:text-[#E2EEF7] flex items-center justify-center shrink-0">
                <MaterialIcon name="database" size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base sm:text-lg font-semibold text-[#1E1E1E] dark:text-white tracking-tight">
                    {activeDb.name}
                  </h2>
                  <StatusIndicator
                    status={
                      activeDb.status === "online"
                        ? "completed"
                        : activeDb.status === "provisioning" || activeDb.status === "rebuilding"
                        ? "pending"
                        : "failed"
                    }
                    label={activeDb.status}
                  />
                </div>
                <p className="text-xs text-[#8C8B87] dark:text-slate-400 mt-1">
                  Engine: <span className="capitalize text-slate-800 dark:text-slate-200 font-medium">{activeDb.engine} {activeDb.version}</span> • {activeDb.vcpu} vCPU, {activeDb.ramGb} GB RAM, {activeDb.diskAllocatedGb} GB NVMe ({activeDb.diskUsedGb} GB used)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => toggleDatabaseHA(activeDb.id)}
                className={`h-9 px-4 rounded-full border text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeDb.haEnabled
                    ? "bg-[#D5EBD9] dark:bg-[#4EA871]/20 border-[#4EA871]/30 text-[#1E1E1E] dark:text-[#A3E4BC]"
                    : "bg-[#EFECE8] dark:bg-[#232834] border-[#E7E4DF] dark:border-[#282D3A] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <MaterialIcon
                  name={activeDb.haEnabled ? "verified_user" : "add_moderator"}
                  size={16}
                  className={activeDb.haEnabled ? "text-[#4EA871] dark:text-[#56B87C]" : ""}
                />
                <span>{activeDb.haEnabled ? "High Availability Enabled" : "Enable HA Standby"}</span>
              </button>

              <button
                type="button"
                onClick={() => destroyDatabase(activeDb.id)}
                className="h-9 w-9 rounded-full bg-[#FCE8E8] dark:bg-[#D94E4E]/15 border border-[#D94E4E]/25 text-[#D94E4E] dark:text-[#EF6363] hover:bg-[#F8D7D7] dark:hover:bg-[#D94E4E]/25 flex items-center justify-center transition-colors cursor-pointer"
                title="Destroy Cluster"
              >
                <MaterialIcon name="delete" size={16} />
              </button>
            </div>
          </div>

          {/* Sub-Tabs using SegmentedPillTabs */}
          <div className="px-5 sm:px-6 py-3.5 border-b border-[#E7E4DF] dark:border-[#282D3A] bg-[#F6F6F4] dark:bg-[#161920] overflow-x-auto">
            <SegmentedPillTabs
              value={activeSubTab}
              onChange={setActiveSubTab}
              options={[
                { id: "connection", label: "Connection Details", icon: "link" },
                { id: "users", label: "Users & DBs", icon: "group", badge: activeDb.users.length },
                { id: "pools", label: "Connection Pools (PgBouncer)", icon: "alt_route", badge: activeDb.pools.length },
                { id: "backups", label: "Backups & PITR", icon: "history", badge: activeDb.backups.length },
                { id: "replicas", label: "Read Replicas", icon: "dns", badge: activeDb.replicas.length },
                { id: "console", label: "Interactive SQL", icon: "terminal" },
                { id: "security", label: "Trusted Sources", icon: "shield", badge: activeDb.trustedSources.length },
              ]}
            />
          </div>

          {/* Sub-Tab Contents */}
          <div className="p-6">
            {/* 1. Connection Details */}
            {activeSubTab === "connection" && (
              <div className="space-y-6 max-w-3xl">
                {/* Connect Using Mode Selection */}
                <div>
                  <label className="text-xs font-semibold text-[#1E1E1E] dark:text-white block mb-2.5">
                    Connect using
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <button
                      type="button"
                      onClick={() => setConnectTabMode("snippets")}
                      className={`p-4 rounded-[20px] border text-left transition-all cursor-pointer ${
                        connectTabMode === "snippets"
                          ? "bg-white dark:bg-[#1C2029] border-[#222222] dark:border-white ring-2 ring-[#222222]/10 dark:ring-white/20 shadow-xs"
                          : "bg-[#F6F6F4] dark:bg-[#161920] border-[#E7E4DF] dark:border-[#282D3A] hover:bg-white dark:hover:bg-[#1C2029]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MaterialIcon
                          name={connectTabMode === "snippets" ? "radio_button_checked" : "radio_button_unchecked"}
                          size={18}
                          className={connectTabMode === "snippets" ? "text-[#222222] dark:text-white" : "text-[#8C8B87]"}
                        />
                        <span className="text-xs font-semibold text-[#1E1E1E] dark:text-white">Code snippets & CLI</span>
                      </div>
                      <p className="text-[11px] text-[#8C8B87] dark:text-slate-400 mt-1.5 pl-7">
                        Use when connecting through PSQL, Node.js, Python, or Go SDKs with AWS SSL certificate.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConnectTabMode("params")}
                      className={`p-4 rounded-[20px] border text-left transition-all cursor-pointer ${
                        connectTabMode === "params"
                          ? "bg-white dark:bg-[#1C2029] border-[#222222] dark:border-white ring-2 ring-[#222222]/10 dark:ring-white/20 shadow-xs"
                          : "bg-[#F6F6F4] dark:bg-[#161920] border-[#E7E4DF] dark:border-[#282D3A] hover:bg-white dark:hover:bg-[#1C2029]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MaterialIcon
                          name={connectTabMode === "params" ? "radio_button_checked" : "radio_button_unchecked"}
                          size={18}
                          className={connectTabMode === "params" ? "text-[#222222] dark:text-white" : "text-[#8C8B87]"}
                        />
                        <span className="text-xs font-semibold text-[#1E1E1E] dark:text-white">Endpoints & Credentials</span>
                      </div>
                      <p className="text-[11px] text-[#8C8B87] dark:text-slate-400 mt-1.5 pl-7">
                        Raw hostname, port, database credentials, and full connection URI string.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Security badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-[20px] bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#8C8B87] dark:text-slate-400 block">SSL Mode</span>
                    <div className="mt-1">
                      <StatusIndicator status="completed" label="verify-full (Enforced)" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#8C8B87] dark:text-slate-400 block">Truststore CA</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-medium block mt-1 truncate">
                      AWS RDS Global Bundle
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#8C8B87] dark:text-slate-400 block">Region</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-medium block mt-1 uppercase">
                      {activeDb.region}
                    </span>
                  </div>
                </div>

                {/* Code Snippets Mode */}
                {connectTabMode === "snippets" && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7E4DF] dark:border-[#282D3A] pb-3">
                      <div className="flex items-center gap-2">
                        <MaterialIcon name="terminal" size={18} className="text-[#222222] dark:text-white" />
                        <span className="text-xs font-semibold text-[#1E1E1E] dark:text-white">Programming Language & Tool</span>
                      </div>
                      <SegmentedPillTabs
                        value={connectSnippetLang}
                        onChange={setConnectSnippetLang}
                        options={[
                          { id: "psql", label: "PSQL" },
                          { id: "nodejs", label: "Node.js" },
                          { id: "python", label: "Python" },
                          { id: "go", label: "Go" },
                        ]}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-[#5A5A58] dark:text-slate-300">
                            Step 1: Download the AWS RDS Global Certificate Bundle
                          </label>
                          <button
                            type="button"
                            onClick={() => handleCopy("curl -o global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem", "step1")}
                            className="px-3 py-1 rounded-full bg-[#EFECE8] dark:bg-[#232834] text-[#1E1E1E] dark:text-white hover:bg-slate-200 dark:hover:bg-[#282D3A] flex items-center gap-1.5 text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            <MaterialIcon name={copiedText === "step1" ? "check" : "content_copy"} size={14} />
                            <span>{copiedText === "step1" ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#14161B] text-slate-200 font-mono text-xs overflow-x-auto border border-[#282D3A]">
                          <code>curl -o global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem</code>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-[#5A5A58] dark:text-slate-300">
                            Step 2: Connect to the instance endpoint
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const snippet =
                                connectSnippetLang === "psql"
                                  ? `export RDSHOST="${activeDb.host}"\npsql "host=$RDSHOST port=${activeDb.port} dbname=${activeDb.defaultDb && activeDb.defaultDb !== "defaultdb" ? activeDb.defaultDb : "postgres"} user=${activeDb.adminUser && activeDb.adminUser !== "doadmin" ? activeDb.adminUser : "tibicloud_admin"} sslmode=verify-full sslrootcert=./global-bundle.pem"`
                                  : connectSnippetLang === "nodejs"
                                  ? `import { Pool } from "pg";\nimport fs from "fs";\n\nconst pool = new Pool({\n  host: "${activeDb.host}",\n  port: ${activeDb.port},\n  database: "${activeDb.defaultDb || "postgres"}",\n  user: "${activeDb.adminUser || "tibicloud_admin"}",\n  password: process.env.DB_PASSWORD,\n  ssl: {\n    ca: fs.readFileSync("./global-bundle.pem").toString(),\n    rejectUnauthorized: true,\n  },\n});`
                                  : connectSnippetLang === "python"
                                  ? `import psycopg2\nimport os\n\nconn = psycopg2.connect(\n    host="${activeDb.host}",\n    port=${activeDb.port},\n    dbname="${activeDb.defaultDb || "postgres"}",\n    user="${activeDb.adminUser || "tibicloud_admin"}",\n    password=os.environ["DB_PASSWORD"],\n    sslmode="verify-full",\n    sslrootcert="./global-bundle.pem",\n)`
                                  : `package main\n\nimport (\n\t"context"\n\t"os"\n\t"github.com/jackc/pgx/v5/pgxpool"\n)\n\nfunc main() {\n\tconnStr := "postgres://${activeDb.adminUser || "tibicloud_admin"}:" + os.Getenv("DB_PASSWORD") + "@${activeDb.host}:${activeDb.port}/${activeDb.defaultDb || "postgres"}?sslmode=verify-full&sslrootcert=./global-bundle.pem"\n\tpool, err := pgxpool.New(context.Background(), connStr)\n\t_ = pool\n}`;
                              handleCopy(snippet, "step2");
                            }}
                            className="px-3 py-1 rounded-full bg-[#EFECE8] dark:bg-[#232834] text-[#1E1E1E] dark:text-white hover:bg-slate-200 dark:hover:bg-[#282D3A] flex items-center gap-1.5 text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            <MaterialIcon name={copiedText === "step2" ? "check" : "content_copy"} size={14} />
                            <span>{copiedText === "step2" ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#14161B] text-slate-200 font-mono text-xs overflow-x-auto border border-[#282D3A] leading-relaxed">
                          {connectSnippetLang === "psql" && (
                            <pre className="text-slate-200 whitespace-pre-wrap">
{`export RDSHOST="${activeDb.host}"
psql "host=$RDSHOST port=${activeDb.port} dbname=${activeDb.defaultDb && activeDb.defaultDb !== "defaultdb" ? activeDb.defaultDb : "postgres"} user=${activeDb.adminUser && activeDb.adminUser !== "doadmin" ? activeDb.adminUser : "tibicloud_admin"} sslmode=verify-full sslrootcert=./global-bundle.pem"`}
                            </pre>
                          )}
                          {connectSnippetLang === "nodejs" && (
                            <pre className="text-slate-200 whitespace-pre-wrap">
{`import { Pool } from "pg";
import fs from "fs";

const pool = new Pool({
  host: "${activeDb.host}",
  port: ${activeDb.port},
  database: "${activeDb.defaultDb || "postgres"}",
  user: "${activeDb.adminUser || "tibicloud_admin"}",
  password: process.env.DB_PASSWORD,
  ssl: {
    ca: fs.readFileSync("./global-bundle.pem").toString(),
    rejectUnauthorized: true,
  },
});`}
                            </pre>
                          )}
                          {connectSnippetLang === "python" && (
                            <pre className="text-slate-200 whitespace-pre-wrap">
{`import psycopg2
import os

conn = psycopg2.connect(
    host="${activeDb.host}",
    port=${activeDb.port},
    dbname="${activeDb.defaultDb || "postgres"}",
    user="${activeDb.adminUser || "tibicloud_admin"}",
    password=os.environ["DB_PASSWORD"],
    sslmode="verify-full",
    sslrootcert="./global-bundle.pem",
)`}
                            </pre>
                          )}
                          {connectSnippetLang === "go" && (
                            <pre className="text-slate-200 whitespace-pre-wrap">
{`package main

import (
\t"context"
\t"os"
\t"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
\tconnStr := "postgres://${activeDb.adminUser || "tibicloud_admin"}:" + os.Getenv("DB_PASSWORD") + "@${activeDb.host}:${activeDb.port}/${activeDb.defaultDb || "postgres"}?sslmode=verify-full&sslrootcert=./global-bundle.pem"
\tpool, err := pgxpool.New(context.Background(), connStr)
\t_ = pool
}`}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Direct Parameters & Credentials */}
                <div className="space-y-4 pt-2 border-t border-[#E7E4DF] dark:border-[#282D3A]">
                  <h4 className="text-xs font-semibold text-[#1E1E1E] dark:text-white">
                    Connection Parameters
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs text-[#5A5A58] dark:text-slate-300 font-medium">Endpoint / Host</label>
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] font-mono text-xs text-[#1E1E1E] dark:text-slate-200">
                        <span className="truncate mr-2">{activeDb.host}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(activeDb.host, "host")}
                          className="text-[#8C8B87] hover:text-[#1E1E1E] dark:hover:text-white shrink-0 cursor-pointer"
                        >
                          <MaterialIcon name={copiedText === "host" ? "check" : "content_copy"} size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-[#5A5A58] dark:text-slate-300 font-medium">Port</label>
                      <div className="p-3 rounded-2xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] font-mono text-xs text-[#1E1E1E] dark:text-slate-200">
                        {activeDb.port}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs text-[#5A5A58] dark:text-slate-300 font-medium">Default Database</label>
                      <div className="p-3 rounded-2xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] font-mono text-xs text-[#1E1E1E] dark:text-slate-200">
                        {activeDb.defaultDb && activeDb.defaultDb !== "defaultdb" ? activeDb.defaultDb : "postgres"}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-[#5A5A58] dark:text-slate-300 font-medium">Admin User</label>
                      <div className="p-3 rounded-2xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] font-mono text-xs text-[#1E1E1E] dark:text-slate-200">
                        {activeDb.adminUser && activeDb.adminUser !== "doadmin" ? activeDb.adminUser : "tibicloud_admin"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[#5A5A58] dark:text-slate-300 font-medium">Admin Password</label>
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] font-mono text-xs text-[#1E1E1E] dark:text-slate-200">
                      <span>{showPassword ? effectivePassword : "••••••••••••••••••••"}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[#8C8B87] hover:text-[#1E1E1E] dark:hover:text-white cursor-pointer"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          <MaterialIcon name={showPassword ? "visibility_off" : "visibility"} size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(effectivePassword, "pwd")}
                          className="text-[#8C8B87] hover:text-[#1E1E1E] dark:hover:text-white cursor-pointer"
                          title="Copy password"
                        >
                          <MaterialIcon name={copiedText === "pwd" ? "check" : "content_copy"} size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[#5A5A58] dark:text-slate-300 font-medium">Connection URI (Public / SSL Enforced)</label>
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] font-mono text-xs text-[#1E1E1E] dark:text-slate-200">
                      <span className="truncate mr-2">{connectionUriDisplay}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(connectionUriDisplay, "uri")}
                        className="text-[#8C8B87] hover:text-[#1E1E1E] dark:hover:text-white shrink-0 cursor-pointer"
                      >
                        <MaterialIcon name={copiedText === "uri" ? "check" : "content_copy"} size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Users & DBs */}
            {activeSubTab === "users" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-[#1E1E1E] dark:text-white">Database Users</h4>
                  <span className="text-[11px] text-[#8C8B87] dark:text-slate-400">{activeDb.users.length} active users</span>
                </div>
                <div className="overflow-x-auto border border-[#E7E4DF] dark:border-[#282D3A] rounded-[22px] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F6F6F4] dark:bg-[#161920] text-[#8C8B87] dark:text-slate-400 text-[11px] uppercase border-b border-[#E7E4DF] dark:border-[#282D3A]">
                      <tr>
                        <th className="py-3 px-4">Username</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E4DF] dark:divide-[#282D3A] bg-white dark:bg-[#1C2029]">
                      {activeDb.users.map((u) => (
                        <tr key={u.username} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-[#1E1E1E] dark:text-slate-200">{u.username}</td>
                          <td className="py-3 px-4">
                            <PastelTypePill
                              icon="badge"
                              label={u.role}
                              variant={u.role === "admin" ? "lavender" : "blue"}
                              size="sm"
                            />
                          </td>
                          <td className="py-3 px-4 text-[#8C8B87] dark:text-slate-400 font-mono text-[11px]">{u.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. Pools */}
            {activeSubTab === "pools" && (
              <div className="space-y-3.5">
                <h4 className="text-xs font-semibold text-[#1E1E1E] dark:text-white">PgBouncer Connection Pools</h4>
                {activeDb.pools.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#8C8B87] rounded-[22px] bg-[#F6F6F4] dark:bg-[#161920]">
                    No connection pools configured for this database cluster.
                  </div>
                ) : (
                  activeDb.pools.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-[20px] bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-mono font-semibold text-[#1E1E1E] dark:text-white block">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-[#8C8B87] dark:text-slate-400">
                          Mode: {p.mode} • Size: {p.size} connections • User: {p.user}
                        </span>
                      </div>
                      <StatusIndicator status="completed" label="ACTIVE" />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 4. Backups */}
            {activeSubTab === "backups" && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-[#1E1E1E] dark:text-white">Point-in-Time Recovery Snapshots</h4>
                  <span className="text-[11px] text-[#4EA871] dark:text-[#56B87C] font-medium">PITR Retention: 7 Days</span>
                </div>
                <div className="space-y-2.5">
                  {activeDb.backups.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-[20px] bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="text-xs font-medium text-[#1E1E1E] dark:text-white block">{b.createdAt}</span>
                        <span className="text-[11px] text-[#8C8B87] dark:text-slate-400">{b.sizeMb} MB compressed NVMe snapshot</span>
                      </div>
                      <button
                        type="button"
                        className="h-8 px-3.5 rounded-full bg-[#EFECE8] dark:bg-[#232834] text-xs font-medium text-[#1E1E1E] dark:text-white hover:bg-slate-200 dark:hover:bg-[#282D3A] transition-colors cursor-pointer"
                      >
                        Restore to Point
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Read Replicas */}
            {activeSubTab === "replicas" && (
              <div className="space-y-3.5">
                <h4 className="text-xs font-semibold text-[#1E1E1E] dark:text-white">Geo-Distributed Read Replicas</h4>
                {activeDb.replicas.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#8C8B87] rounded-[22px] bg-[#F6F6F4] dark:bg-[#161920]">
                    No read replicas configured. Deploy replicas to offload read traffic.
                  </div>
                ) : (
                  activeDb.replicas.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-4 rounded-[20px] bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="text-xs font-mono font-semibold text-[#1E1E1E] dark:text-white block">
                          {rep.name}
                        </span>
                        <span className="text-[11px] text-[#8C8B87] dark:text-slate-400">
                          Region: {rep.region.toUpperCase()} • Replication Lag: {rep.lagMs}ms
                        </span>
                      </div>
                      <StatusIndicator status="completed" label="Synced" />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 6. Interactive SQL Console */}
            {activeSubTab === "console" && (
              <div className="space-y-4">
                <form onSubmit={handleRunQuery} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#5A5A58] dark:text-slate-300">Run Query on {activeDb.defaultDb || "postgres"}</span>
                    <button
                      type="submit"
                      className="h-8.5 px-4 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:hover:bg-slate-200 dark:text-[#1E1E1E] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <MaterialIcon name="play_arrow" size={16} />
                      <span>Execute</span>
                    </button>
                  </div>
                  <textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    rows={3}
                    className="w-full p-4 rounded-2xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] font-mono text-xs text-[#1E1E1E] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#222222]/10 dark:focus:ring-white/20 transition-all"
                  />
                </form>

                {queryResult && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-[#8C8B87] dark:text-slate-400">
                      <span>Query Results ({queryResult.length} rows)</span>
                      <span className="font-mono text-[#4EA871] dark:text-[#56B87C]">Executed in {queryExecutionTime}ms</span>
                    </div>
                    <div className="overflow-x-auto border border-[#E7E4DF] dark:border-[#282D3A] rounded-[22px] overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F6F6F4] dark:bg-[#161920] text-[#8C8B87] dark:text-slate-400 text-[11px] uppercase border-b border-[#E7E4DF] dark:border-[#282D3A]">
                          <tr>
                            <th className="py-2.5 px-3.5">id</th>
                            <th className="py-2.5 px-3.5">name</th>
                            <th className="py-2.5 px-3.5">status</th>
                            <th className="py-2.5 px-3.5">created_at</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E7E4DF] dark:divide-[#282D3A] font-mono text-[11px] bg-white dark:bg-[#1C2029]">
                          {queryResult.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                              <td className="py-2.5 px-3.5 text-[#8C8B87] dark:text-slate-400">{row.id}</td>
                              <td className="py-2.5 px-3.5 text-[#1E1E1E] dark:text-slate-200 font-sans">{row.name}</td>
                              <td className="py-2.5 px-3.5 text-[#4EA871] dark:text-[#56B87C]">{row.status}</td>
                              <td className="py-2.5 px-3.5 text-[#8C8B87] dark:text-slate-400">{row.created_at}</td>
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
              <div className="space-y-3.5 max-w-xl">
                <h4 className="text-xs font-semibold text-[#1E1E1E] dark:text-white">Inbound Network Whitelist (CIDRs)</h4>
                <p className="text-xs text-[#8C8B87] dark:text-slate-400">Connections from outside these ranges will be dropped by the cloud firewall.</p>
                <div className="space-y-2">
                  {activeDb.trustedSources.map((src) => (
                    <div
                      key={src}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] font-mono text-xs text-[#1E1E1E] dark:text-slate-200"
                    >
                      <span>{src}</span>
                      <PastelTypePill icon="shield" label="Whitelisted" variant="sage" size="sm" />
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F6F6F4] dark:bg-[#161920] border border-[#E7E4DF] dark:border-[#282D3A] rounded-[28px] shadow-2xl w-full max-w-md p-6 space-y-5">
            <div>
              <h3 className="text-base font-semibold text-[#1E1E1E] dark:text-white">Create Database Cluster</h3>
              <p className="text-xs text-[#8C8B87] dark:text-slate-400 mt-0.5">
                Provision high-availability PostgreSQL, MySQL, Redis, or Mongo clusters.
              </p>
            </div>

            <form onSubmit={handleCreateCluster} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#5A5A58] dark:text-slate-300">Cluster Name</label>
                <input
                  type="text"
                  value={newClusterName}
                  onChange={(e) => setNewClusterName(e.target.value)}
                  className="w-full h-10 px-4 rounded-full bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-[#222222]/10 dark:focus:ring-white/20 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#5A5A58] dark:text-slate-300">Database Engine</label>
                <select
                  value={newEngine}
                  onChange={(e) => setNewEngine(e.target.value as typeof newEngine)}
                  className="w-full h-10 px-4 rounded-full bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] text-xs text-[#1E1E1E] dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#222222]/10 dark:focus:ring-white/20 transition-all cursor-pointer"
                >
                  <option value="postgresql">PostgreSQL 16.3 (Recommended)</option>
                  <option value="mysql">MySQL 8.4 LTS</option>
                  <option value="redis">Redis 7.2 In-Memory</option>
                  <option value="mongodb">MongoDB 7.0</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="h-9 px-4 rounded-full bg-[#EFECE8] dark:bg-[#232834] border border-[#E7E4DF] dark:border-[#282D3A] text-xs font-medium text-[#5A5A58] dark:text-slate-300 hover:text-[#1E1E1E] dark:hover:text-white cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-full bg-[#222222] hover:bg-[#111111] dark:bg-white dark:hover:bg-slate-200 dark:text-[#1E1E1E] text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
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
