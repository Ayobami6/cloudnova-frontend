"use client";

import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import {
  Instance,
  DatabaseCluster,
  Volume,
  S3Bucket,
  Firewall,
  VPC,
  LoadBalancer,
  FloatingIP,
  Domain,
  ClientTenant,
  OperationalAlert,
  DatacenterRegion,
  DNSRecord,
  FirewallRule,
  S3Object,
} from "../types/cloud";
import {
  INITIAL_INSTANCES,
  INITIAL_DATABASES,
  INITIAL_VOLUMES,
  INITIAL_BUCKETS,
  INITIAL_FIREWALLS,
  INITIAL_VPCS,
  INITIAL_LOAD_BALANCERS,
  INITIAL_FLOATING_IPS,
  INITIAL_DOMAINS,
  INITIAL_CLIENTS,
  INITIAL_ALERTS,
  COMPUTE_PLANS,
} from "../mock-data/initial-state";
import { CreateDropletInput } from "../schemas/cloud";

interface CloudContextType {
  // State
  instances: Instance[];
  databases: DatabaseCluster[];
  volumes: Volume[];
  buckets: S3Bucket[];
  firewalls: Firewall[];
  vpcs: VPC[];
  loadBalancers: LoadBalancer[];
  floatingIps: FloatingIP[];
  domains: Domain[];
  clients: ClientTenant[];
  alerts: OperationalAlert[];
  selectedRegion: DatacenterRegion | "all";
  searchQuery: string;

  // Modals & Overlays
  terminalInstance: Instance | null;
  setTerminalInstance: (inst: Instance | null) => void;
  setSelectedRegion: (region: DatacenterRegion | "all") => void;
  setSearchQuery: (q: string) => void;

  // Financial Computations
  monthlyWholesale: number;
  monthlyRetail: number;
  monthlyProfit: number;
  hourlyBurnRate: number;

  // Instance Actions
  createInstance: (input: CreateDropletInput) => Instance;
  powerAction: (id: string, action: "on" | "off" | "reboot") => void;
  destroyInstance: (id: string) => void;

  // Database Actions
  createDatabase: (data: Partial<DatabaseCluster>) => void;
  destroyDatabase: (id: string) => void;
  toggleDatabaseHA: (id: string) => void;

  // Volume Actions
  createVolume: (vol: Omit<Volume, "id" | "createdAt">) => void;
  attachVolume: (volumeId: string, instanceId: string) => void;
  detachVolume: (volumeId: string) => void;
  resizeVolume: (volumeId: string, newSizeGb: number) => void;
  destroyVolume: (volumeId: string) => void;

  // S3 Actions
  createBucket: (bucket: Omit<S3Bucket, "id" | "createdAt" | "objects" | "totalSizeBytes" | "objectCount">) => void;
  uploadObject: (bucketId: string, object: S3Object) => void;
  deleteObject: (bucketId: string, key: string) => void;
  destroyBucket: (bucketId: string) => void;

  // Firewall Actions
  createFirewall: (name: string, rules: FirewallRule[]) => void;
  deleteFirewall: (id: string) => void;
  addFirewallRule: (firewallId: string, rule: FirewallRule) => void;
  deleteFirewallRule: (firewallId: string, ruleId: string) => void;

  // Domain Actions
  registerDomain: (domainName: string, tld: string, wholesale: number, retail: number) => void;
  addDNSRecord: (domainId: string, record: Omit<DNSRecord, "id">) => void;
  deleteDNSRecord: (domainId: string, recordId: string) => void;
  linkDomainToResource: (domainId: string, resourceId: string) => void;

  // Client & Reseller Actions
  createClient: (client: Omit<ClientTenant, "id" | "createdAt" | "activeResourcesCount" | "monthlySpend">) => void;
  updateClient: (id: string, updates: Partial<ClientTenant>) => void;

  // Alert Actions
  markAlertRead: (id: string) => void;
  clearAllAlerts: () => void;
}

const CloudContext = createContext<CloudContextType | null>(null);

export const CloudProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [instances, setInstances] = useState<Instance[]>(INITIAL_INSTANCES);
  const [databases, setDatabases] = useState<DatabaseCluster[]>(INITIAL_DATABASES);
  const [volumes, setVolumes] = useState<Volume[]>(INITIAL_VOLUMES);
  const [buckets, setBuckets] = useState<S3Bucket[]>(INITIAL_BUCKETS);
  const [firewalls, setFirewalls] = useState<Firewall[]>(INITIAL_FIREWALLS);
  const [vpcs] = useState<VPC[]>(INITIAL_VPCS);
  const [loadBalancers] = useState<LoadBalancer[]>(INITIAL_LOAD_BALANCERS);
  const [floatingIps] = useState<FloatingIP[]>(INITIAL_FLOATING_IPS);
  const [domains, setDomains] = useState<Domain[]>(INITIAL_DOMAINS);
  const [clients, setClients] = useState<ClientTenant[]>(INITIAL_CLIENTS);
  const [alerts, setAlerts] = useState<OperationalAlert[]>(INITIAL_ALERTS);

  // Filter & Navigation State
  const [selectedRegion, setSelectedRegion] = useState<DatacenterRegion | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [terminalInstance, setTerminalInstance] = useState<Instance | null>(null);

  // Financial Aggregations
  const monthlyWholesale = useMemo(() => {
    const instCost = instances.reduce((acc, i) => acc + i.plan.wholesaleMonthly, 0);
    const dbCost = databases.reduce((acc, d) => acc + d.wholesaleMonthly, 0);
    const volCost = volumes.reduce((acc, v) => acc + v.wholesaleMonthly, 0);
    const s3Cost = buckets.reduce((acc, b) => acc + b.wholesaleMonthly, 0);
    const domCost = domains.reduce((acc, d) => acc + d.wholesaleAnnual / 12, 0);
    return Number((instCost + dbCost + volCost + s3Cost + domCost).toFixed(2));
  }, [instances, databases, volumes, buckets, domains]);

  const monthlyRetail = useMemo(() => {
    const instRetail = instances.reduce((acc, i) => acc + i.plan.retailMonthly, 0);
    const dbRetail = databases.reduce((acc, d) => acc + d.retailMonthly, 0);
    const volRetail = volumes.reduce((acc, v) => acc + v.retailMonthly, 0);
    const s3Retail = buckets.reduce((acc, b) => acc + b.retailMonthly, 0);
    const domRetail = domains.reduce((acc, d) => acc + d.retailAnnual / 12, 0);
    return Number((instRetail + dbRetail + volRetail + s3Retail + domRetail).toFixed(2));
  }, [instances, databases, volumes, buckets, domains]);

  const monthlyProfit = useMemo(() => {
    return Number((monthlyRetail - monthlyWholesale).toFixed(2));
  }, [monthlyRetail, monthlyWholesale]);

  const hourlyBurnRate = useMemo(() => {
    const activeVms = instances.filter((i) => i.status === "active");
    const vmHourly = activeVms.reduce((acc, i) => acc + i.plan.hourlyRetail, 0);
    const dbHourly = (databases.reduce((acc, d) => acc + d.retailMonthly, 0) / 720);
    return Number((vmHourly + dbHourly).toFixed(3));
  }, [instances, databases]);

  // Instance Actions
  const createInstance = useCallback(
    (input: CreateDropletInput): Instance => {
      const plan = COMPUTE_PLANS.find((p) => p.id === input.planId) || COMPUTE_PLANS[1];
      const octet3 = Math.floor(Math.random() * 200) + 10;
      const octet4 = Math.floor(Math.random() * 250) + 2;
      const newInst: Instance = {
        id: `inst-${Date.now().toString().slice(-6)}`,
        name: input.name,
        region: input.region,
        image: input.image,
        planId: plan.id,
        plan,
        status: "active",
        ipv4: `142.93.${octet3}.${octet4}`,
        privateIpv4: `10.108.0.${octet4}`,
        currentCpu: Math.floor(Math.random() * 15) + 5,
        currentRamPercent: Math.floor(Math.random() * 25) + 20,
        uptimeSeconds: 60,
        tags: input.tags ? input.tags.split(",").map((t) => t.trim()).filter(Boolean) : ["custom"],
        clientId: input.clientId,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setInstances((prev) => [newInst, ...prev]);
      return newInst;
    },
    []
  );

  const powerAction = useCallback((id: string, action: "on" | "off" | "reboot") => {
    setInstances((prev) =>
      prev.map((inst) => {
        if (inst.id !== id) return inst;
        if (action === "off") {
          return { ...inst, status: "off", currentCpu: 0, currentRamPercent: 0 };
        }
        if (action === "on") {
          return { ...inst, status: "active", currentCpu: 12, currentRamPercent: 35 };
        }
        if (action === "reboot") {
          return { ...inst, status: "rebooting" };
        }
        return inst;
      })
    );
    if (action === "reboot") {
      setTimeout(() => {
        setInstances((prev) =>
          prev.map((inst) => (inst.id === id ? { ...inst, status: "active", uptimeSeconds: 10 } : inst))
        );
      }, 3000);
    }
  }, []);

  const destroyInstance = useCallback((id: string) => {
    setInstances((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // Database Actions
  const createDatabase = useCallback((data: Partial<DatabaseCluster>) => {
    const newDb: DatabaseCluster = {
      id: `db-${Date.now().toString().slice(-6)}`,
      name: data.name || "new-database-cluster",
      engine: data.engine || "postgresql",
      version: data.engine === "redis" ? "7.2" : data.engine === "mysql" ? "8.4" : "16.3",
      region: data.region || "nyc1",
      status: "online",
      nodesCount: data.haEnabled ? 2 : 1,
      haEnabled: !!data.haEnabled,
      diskAllocatedGb: 100,
      diskUsedGb: 2.4,
      ramGb: 8,
      vcpu: 2,
      port: data.engine === "redis" ? 6379 : data.engine === "mysql" ? 3306 : 5432,
      host: `${data.name || "db"}.internal.cloudnova.net`,
      defaultDb: "main_db",
      adminUser: "nova_admin",
      adminPasswordReveal: "Secr3tP@ssw0rd!2026",
      connectionUri: `postgresql://nova_admin:Secr3tP@ssw0rd!2026@${data.name || "db"}.internal.cloudnova.net:5432/main_db`,
      wholesaleMonthly: 45.0,
      retailMonthly: 67.5,
      users: [{ username: "nova_admin", role: "admin", createdAt: "Just now" }],
      schemas: ["main_db"],
      pools: [],
      backups: [{ id: `bak-${Date.now()}`, createdAt: "Initial snapshot", sizeMb: 50, status: "completed" }],
      replicas: [],
      trustedSources: ["0.0.0.0/0"],
      createdAt: new Date().toISOString().split("T")[0],
    };
    setDatabases((prev) => [newDb, ...prev]);
  }, []);

  const destroyDatabase = useCallback((id: string) => {
    setDatabases((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const toggleDatabaseHA = useCallback((id: string) => {
    setDatabases((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, haEnabled: !d.haEnabled, nodesCount: d.haEnabled ? 1 : 2 } : d
      )
    );
  }, []);

  // Volume Actions
  const createVolume = useCallback((vol: Omit<Volume, "id" | "createdAt">) => {
    const newVol: Volume = {
      ...vol,
      id: `vol-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setVolumes((prev) => [newVol, ...prev]);
  }, []);

  const attachVolume = useCallback((volumeId: string, instanceId: string) => {
    setVolumes((prev) =>
      prev.map((v) => (v.id === volumeId ? { ...v, attachedToInstanceId: instanceId } : v))
    );
  }, []);

  const detachVolume = useCallback((volumeId: string) => {
    setVolumes((prev) =>
      prev.map((v) => (v.id === volumeId ? { ...v, attachedToInstanceId: null } : v))
    );
  }, []);

  const resizeVolume = useCallback((volumeId: string, newSizeGb: number) => {
    setVolumes((prev) =>
      prev.map((v) => {
        if (v.id !== volumeId) return v;
        const wholesale = Number((newSizeGb * 0.08).toFixed(2));
        const retail = Number((newSizeGb * 0.12).toFixed(2));
        return {
          ...v,
          sizeGb: newSizeGb,
          iops: Math.min(15000, newSizeGb * 15),
          wholesaleMonthly: wholesale,
          retailMonthly: retail,
        };
      })
    );
  }, []);

  const destroyVolume = useCallback((volumeId: string) => {
    setVolumes((prev) => prev.filter((v) => v.id !== volumeId));
  }, []);

  // S3 Actions
  const createBucket = useCallback(
    (bucket: Omit<S3Bucket, "id" | "createdAt" | "objects" | "totalSizeBytes" | "objectCount">) => {
      const newBucket: S3Bucket = {
        ...bucket,
        id: `bucket-${Date.now().toString().slice(-6)}`,
        objects: [],
        totalSizeBytes: 0,
        objectCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setBuckets((prev) => [newBucket, ...prev]);
    },
    []
  );

  const uploadObject = useCallback((bucketId: string, object: S3Object) => {
    setBuckets((prev) =>
      prev.map((b) => {
        if (b.id !== bucketId) return b;
        return {
          ...b,
          objects: [object, ...b.objects],
          totalSizeBytes: b.totalSizeBytes + object.sizeBytes,
          objectCount: b.objectCount + 1,
        };
      })
    );
  }, []);

  const deleteObject = useCallback((bucketId: string, key: string) => {
    setBuckets((prev) =>
      prev.map((b) => {
        if (b.id !== bucketId) return b;
        const target = b.objects.find((o) => o.key === key);
        return {
          ...b,
          objects: b.objects.filter((o) => o.key !== key),
          totalSizeBytes: Math.max(0, b.totalSizeBytes - (target?.sizeBytes || 0)),
          objectCount: Math.max(0, b.objectCount - 1),
        };
      })
    );
  }, []);

  const destroyBucket = useCallback((bucketId: string) => {
    setBuckets((prev) => prev.filter((b) => b.id !== bucketId));
  }, []);

  // Firewall Actions
  const createFirewall = useCallback((name: string, rules: FirewallRule[]) => {
    const newFw: Firewall = {
      id: `fw-${Date.now().toString().slice(-6)}`,
      name,
      rules,
      attachedInstanceIds: [],
      createdAt: new Date().toISOString().split("T")[0],
    };
    setFirewalls((prev) => [newFw, ...prev]);
  }, []);

  const deleteFirewall = useCallback((id: string) => {
    setFirewalls((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const addFirewallRule = useCallback((firewallId: string, rule: FirewallRule) => {
    setFirewalls((prev) =>
      prev.map((f) => (f.id === firewallId ? { ...f, rules: [...f.rules, rule] } : f))
    );
  }, []);

  const deleteFirewallRule = useCallback((firewallId: string, ruleId: string) => {
    setFirewalls((prev) =>
      prev.map((f) =>
        f.id === firewallId ? { ...f, rules: f.rules.filter((r) => r.id !== ruleId) } : f
      )
    );
  }, []);

  // Domain Actions
  const registerDomain = useCallback(
    (domainName: string, tld: string, wholesale: number, retail: number) => {
      const newDomain: Domain = {
        id: `dom-${Date.now().toString().slice(-6)}`,
        name: domainName.endsWith(tld) ? domainName : `${domainName}${tld}`,
        tld,
        status: "active",
        whoisPrivacy: true,
        autoRenew: true,
        dnssec: true,
        sslActive: true,
        expiresAt: "2027-09-06",
        wholesaleAnnual: wholesale,
        retailAnnual: retail,
        records: [
          { id: `rec-${Date.now()}-1`, type: "NS", name: "@", value: "ns1.cloudnova-dns.net", ttl: 86400 },
          { id: `rec-${Date.now()}-2`, type: "NS", name: "@", value: "ns2.cloudnova-dns.net", ttl: 86400 },
        ],
      };
      setDomains((prev) => [newDomain, ...prev]);
    },
    []
  );

  const addDNSRecord = useCallback((domainId: string, record: Omit<DNSRecord, "id">) => {
    const newRecord: DNSRecord = { ...record, id: `rec-${Date.now()}` };
    setDomains((prev) =>
      prev.map((d) => (d.id === domainId ? { ...d, records: [...d.records, newRecord] } : d))
    );
  }, []);

  const deleteDNSRecord = useCallback((domainId: string, recordId: string) => {
    setDomains((prev) =>
      prev.map((d) =>
        d.id === domainId ? { ...d, records: d.records.filter((r) => r.id !== recordId) } : d
      )
    );
  }, []);

  const linkDomainToResource = useCallback((domainId: string, resourceId: string) => {
    setDomains((prev) =>
      prev.map((d) => (d.id === domainId ? { ...d, linkedResourceId: resourceId } : d))
    );
  }, []);

  const createClient = useCallback(
    (client: Omit<ClientTenant, "id" | "createdAt" | "activeResourcesCount" | "monthlySpend">) => {
      const newClient: ClientTenant = {
        ...client,
        id: `client-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString().split("T")[0],
        activeResourcesCount: 0,
        monthlySpend: 0,
      };
      setClients((prev) => [newClient, ...prev]);
    },
    []
  );

  const updateClient = useCallback((id: string, updates: Partial<ClientTenant>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  // Alert Actions
  const markAlertRead = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  const value: CloudContextType = {
    instances,
    databases,
    volumes,
    buckets,
    firewalls,
    vpcs,
    loadBalancers,
    floatingIps,
    domains,
    clients,
    alerts,
    selectedRegion,
    searchQuery,
    terminalInstance,
    setTerminalInstance,
    setSelectedRegion,
    setSearchQuery,
    monthlyWholesale,
    monthlyRetail,
    monthlyProfit,
    hourlyBurnRate,
    createInstance,
    powerAction,
    destroyInstance,
    createDatabase,
    destroyDatabase,
    toggleDatabaseHA,
    createVolume,
    attachVolume,
    detachVolume,
    resizeVolume,
    destroyVolume,
    createBucket,
    uploadObject,
    deleteObject,
    destroyBucket,
    createFirewall,
    deleteFirewall,
    addFirewallRule,
    deleteFirewallRule,
    registerDomain,
    addDNSRecord,
    deleteDNSRecord,
    linkDomainToResource,
    createClient,
    updateClient,
    markAlertRead,
    clearAllAlerts,
  };

  return <CloudContext.Provider value={value}>{children}</CloudContext.Provider>;
};

export const useCloud = (): CloudContextType => {
  const context = useContext(CloudContext);
  if (!context) {
    throw new Error("useCloud must be used within a CloudProvider");
  }
  return context;
};
