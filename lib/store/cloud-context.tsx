"use client";

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";
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
  ComputePlan,
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
import { useAuth } from "./auth-context";
import * as computeApi from "../api/compute";
import * as databasesApi from "../api/databases";
import * as storageApi from "../api/storage";
import * as networkApi from "../api/network";
import * as domainsApi from "../api/domains";
import * as alertsApi from "../api/alerts";
import {
  mapAlert,
  mapBucket,
  mapComputePlan,
  mapDatabaseCluster,
  mapDomain,
  mapFirewall,
  mapFloatingIP,
  mapInstance,
  mapLoadBalancer,
  mapVPC,
  mapVolume,
} from "../api/mappers";

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
  plans: ComputePlan[];
  isLoading: boolean;
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
  createInstance: (input: CreateDropletInput) => Promise<Instance>;
  powerAction: (id: string, action: "on" | "off" | "reboot") => Promise<void>;
  destroyInstance: (id: string) => Promise<void>;

  // Database Actions
  createDatabase: (data: Partial<DatabaseCluster>) => Promise<void>;
  destroyDatabase: (id: string) => Promise<void>;
  toggleDatabaseHA: (id: string) => Promise<void>;

  // Volume Actions
  createVolume: (vol: Omit<Volume, "id" | "createdAt">) => Promise<void>;
  attachVolume: (volumeId: string, instanceId: string) => Promise<void>;
  detachVolume: (volumeId: string) => Promise<void>;
  resizeVolume: (volumeId: string, newSizeGb: number) => Promise<void>;
  destroyVolume: (volumeId: string) => Promise<void>;

  // S3 Actions
  createBucket: (bucket: Omit<S3Bucket, "id" | "createdAt" | "objects" | "totalSizeBytes" | "objectCount">) => Promise<void>;
  uploadObject: (bucketId: string, object: S3Object) => void;
  deleteObject: (bucketId: string, key: string) => void;
  destroyBucket: (bucketId: string) => Promise<void>;

  // Firewall Actions
  createFirewall: (name: string, rules: FirewallRule[]) => Promise<void>;
  deleteFirewall: (id: string) => Promise<void>;
  addFirewallRule: (firewallId: string, rule: FirewallRule) => Promise<void>;
  deleteFirewallRule: (firewallId: string, ruleId: string) => Promise<void>;

  // Domain Actions
  registerDomain: (domainName: string, tld: string, wholesale: number, retail: number) => Promise<void>;
  addDNSRecord: (domainId: string, record: Omit<DNSRecord, "id">) => Promise<void>;
  deleteDNSRecord: (domainId: string, recordId: string) => Promise<void>;
  linkDomainToResource: (domainId: string, resourceId: string) => Promise<void>;

  // Client & Reseller Actions
  createClient: (client: Omit<ClientTenant, "id" | "createdAt" | "activeResourcesCount" | "monthlySpend">) => void;
  updateClient: (id: string, updates: Partial<ClientTenant>) => void;

  // Alert Actions
  markAlertRead: (id: string) => Promise<void>;
  clearAllAlerts: () => Promise<void>;

  // Refresh
  refreshAll: () => Promise<void>;
}

const CloudContext = createContext<CloudContextType | null>(null);

const PLAN_MAP_TO_BACKEND: Record<string, string> = {
  "plan-micro": "basic-1x1",
  "plan-basic": "basic-1x2",
  "plan-std-4g": "general-2x4",
  "plan-std-8g": "general-4x8",
  "plan-cpu-16g": "cpu-opt-4x4",
  "plan-mem-32g": "mem-opt-4x32",
  "plan-gpu-a5000": "gpu-8x32",
};

export const CloudProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [instances, setInstances] = useState<Instance[]>(INITIAL_INSTANCES);
  const [databases, setDatabases] = useState<DatabaseCluster[]>(INITIAL_DATABASES);
  const [volumes, setVolumes] = useState<Volume[]>(INITIAL_VOLUMES);
  const [buckets, setBuckets] = useState<S3Bucket[]>(INITIAL_BUCKETS);
  const [firewalls, setFirewalls] = useState<Firewall[]>(INITIAL_FIREWALLS);
  const [vpcs, setVpcs] = useState<VPC[]>(INITIAL_VPCS);
  const [loadBalancers, setLoadBalancers] = useState<LoadBalancer[]>(INITIAL_LOAD_BALANCERS);
  const [floatingIps, setFloatingIps] = useState<FloatingIP[]>(INITIAL_FLOATING_IPS);
  const [domains, setDomains] = useState<Domain[]>(INITIAL_DOMAINS);
  const [clients, setClients] = useState<ClientTenant[]>(INITIAL_CLIENTS);
  const [alerts, setAlerts] = useState<OperationalAlert[]>(INITIAL_ALERTS);
  const [plans, setPlans] = useState<ComputePlan[]>(COMPUTE_PLANS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filter & Navigation State
  const [selectedRegion, setSelectedRegion] = useState<DatacenterRegion | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [terminalInstance, setTerminalInstance] = useState<Instance | null>(null);

  // Load all resources from backend API
  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [
        planRes,
        instRes,
        dbRes,
        volRes,
        bktRes,
        fwRes,
        vpcRes,
        lbRes,
        fipRes,
        domRes,
        altRes,
      ] = await Promise.allSettled([
        computeApi.listComputePlans(),
        computeApi.listInstances(),
        databasesApi.listDatabaseClusters(),
        storageApi.listVolumes(),
        storageApi.listBuckets(),
        networkApi.listFirewalls(),
        networkApi.listVPCs(),
        networkApi.listLoadBalancers(),
        networkApi.listFloatingIPs(),
        domainsApi.listDomains(),
        alertsApi.listAlerts(),
      ]);

      let loadedPlans = COMPUTE_PLANS;
      if (planRes.status === "fulfilled" && Array.isArray(planRes.value) && planRes.value.length > 0) {
        loadedPlans = planRes.value.map(mapComputePlan);
        setPlans(loadedPlans);
      }

      if (instRes.status === "fulfilled" && Array.isArray(instRes.value)) {
        setInstances(instRes.value.map((i) => mapInstance(i, loadedPlans)));
      }

      if (dbRes.status === "fulfilled" && Array.isArray(dbRes.value)) {
        setDatabases(dbRes.value.map(mapDatabaseCluster));
      }

      if (volRes.status === "fulfilled" && Array.isArray(volRes.value)) {
        setVolumes(volRes.value.map(mapVolume));
      }

      if (bktRes.status === "fulfilled" && Array.isArray(bktRes.value)) {
        setBuckets(bktRes.value.map(mapBucket));
      }

      if (fwRes.status === "fulfilled" && Array.isArray(fwRes.value)) {
        setFirewalls(fwRes.value.map(mapFirewall));
      }

      if (vpcRes.status === "fulfilled" && Array.isArray(vpcRes.value)) {
        setVpcs(vpcRes.value.map(mapVPC));
      }

      if (lbRes.status === "fulfilled" && Array.isArray(lbRes.value)) {
        setLoadBalancers(lbRes.value.map(mapLoadBalancer));
      }

      if (fipRes.status === "fulfilled" && Array.isArray(fipRes.value)) {
        setFloatingIps(fipRes.value.map(mapFloatingIP));
      }

      if (domRes.status === "fulfilled" && Array.isArray(domRes.value)) {
        setDomains(domRes.value.map(mapDomain));
      }

      if (altRes.status === "fulfilled" && Array.isArray(altRes.value)) {
        setAlerts(altRes.value.map(mapAlert));
      }
    } catch {
      // Fall back gracefully to existing mock/cached state
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user?.accountId) {
      refreshAll();
    }
  }, [isAuthenticated, user?.accountId, refreshAll]);

  // Financial Aggregations
  const monthlyWholesale = useMemo(() => {
    const instCost = instances.reduce((acc, i) => acc + (i.plan?.wholesaleMonthly || 0), 0);
    const dbCost = databases.reduce((acc, d) => acc + (d.wholesaleMonthly || 0), 0);
    const volCost = volumes.reduce((acc, v) => acc + (v.wholesaleMonthly || 0), 0);
    const s3Cost = buckets.reduce((acc, b) => acc + (b.wholesaleMonthly || 0), 0);
    const domCost = domains.reduce((acc, d) => acc + (d.wholesaleAnnual || 0) / 12, 0);
    return Number((instCost + dbCost + volCost + s3Cost + domCost).toFixed(2));
  }, [instances, databases, volumes, buckets, domains]);

  const monthlyRetail = useMemo(() => {
    const instRetail = instances.reduce((acc, i) => acc + (i.plan?.retailMonthly || 0), 0);
    const dbRetail = databases.reduce((acc, d) => acc + (d.retailMonthly || 0), 0);
    const volRetail = volumes.reduce((acc, v) => acc + (v.retailMonthly || 0), 0);
    const s3Retail = buckets.reduce((acc, b) => acc + (b.retailMonthly || 0), 0);
    const domRetail = domains.reduce((acc, d) => acc + (d.retailAnnual || 0) / 12, 0);
    return Number((instRetail + dbRetail + volRetail + s3Retail + domRetail).toFixed(2));
  }, [instances, databases, volumes, buckets, domains]);

  const monthlyProfit = useMemo(() => {
    return Number((monthlyRetail - monthlyWholesale).toFixed(2));
  }, [monthlyRetail, monthlyWholesale]);

  const hourlyBurnRate = useMemo(() => {
    const activeVms = instances.filter((i) => i.status === "active");
    const vmHourly = activeVms.reduce((acc, i) => acc + (i.plan?.hourlyRetail || 0), 0);
    const dbHourly = databases.reduce((acc, d) => acc + (d.retailMonthly || 0), 0) / 720;
    return Number((vmHourly + dbHourly).toFixed(3));
  }, [instances, databases]);

  // Instance Actions
  const createInstance = useCallback(
    async (input: CreateDropletInput): Promise<Instance> => {
      const backendPlanId = PLAN_MAP_TO_BACKEND[input.planId] || input.planId;
      const tagList = input.tags
        ? input.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : ["production"];

      if (isAuthenticated) {
        try {
          const wire = await computeApi.createInstance({
            name: input.name,
            region: input.region,
            image: input.image,
            plan_id: backendPlanId,
            tags: tagList,
          });
          const newInst = mapInstance(wire, plans);
          setInstances((prev) => [newInst, ...prev]);
          return newInst;
        } catch {
          // fallback to optimistic local addition
        }
      }

      const plan = plans.find((p) => p.id === input.planId || p.id === backendPlanId) || plans[0];
      const octet3 = Math.floor(Math.random() * 200) + 10;
      const octet4 = Math.floor(Math.random() * 250) + 2;
      const fallbackInst: Instance = {
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
        tags: tagList,
        clientId: input.clientId,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setInstances((prev) => [fallbackInst, ...prev]);
      return fallbackInst;
    },
    [isAuthenticated, plans]
  );

  const powerAction = useCallback(
    async (id: string, action: "on" | "off" | "reboot") => {
      setInstances((prev) =>
        prev.map((inst) => {
          if (inst.id !== id) return inst;
          if (action === "off") return { ...inst, status: "off", currentCpu: 0, currentRamPercent: 0 };
          if (action === "on") return { ...inst, status: "active", currentCpu: 12, currentRamPercent: 35 };
          if (action === "reboot") return { ...inst, status: "rebooting" };
          return inst;
        })
      );

      if (isAuthenticated) {
        try {
          const apiAction = action === "on" ? "power_on" : action === "off" ? "power_off" : "reboot";
          await computeApi.powerAction(id, apiAction);
        } catch {
          // ignore or fallback
        }
      }

      if (action === "reboot") {
        setTimeout(() => {
          setInstances((prev) =>
            prev.map((inst) => (inst.id === id ? { ...inst, status: "active", uptimeSeconds: 10 } : inst))
          );
        }, 3000);
      }
    },
    [isAuthenticated]
  );

  const destroyInstance = useCallback(
    async (id: string) => {
      setInstances((prev) => prev.filter((i) => i.id !== id));
      if (isAuthenticated) {
        try {
          await computeApi.destroyInstance(id);
        } catch {
          // ignore
        }
      }
    },
    [isAuthenticated]
  );

  // Database Actions
  const createDatabase = useCallback(
    async (data: Partial<DatabaseCluster>) => {
      if (isAuthenticated) {
        try {
          const wire = await databasesApi.createDatabaseCluster({
            name: data.name || "new-database-cluster",
            engine: data.engine || "postgresql",
            region: data.region || "nyc1",
            plan_id: "db-std-1",
            ha_enabled: !!data.haEnabled,
          });
          const newDb = mapDatabaseCluster(wire);
          setDatabases((prev) => [newDb, ...prev]);
          return;
        } catch {
          // fallback
        }
      }

      const fallbackDb: DatabaseCluster = {
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
      setDatabases((prev) => [fallbackDb, ...prev]);
    },
    [isAuthenticated]
  );

  const destroyDatabase = useCallback(
    async (id: string) => {
      setDatabases((prev) => prev.filter((d) => d.id !== id));
      if (isAuthenticated) {
        try {
          await databasesApi.destroyDatabaseCluster(id);
        } catch {
          // ignore
        }
      }
    },
    [isAuthenticated]
  );

  const toggleDatabaseHA = useCallback(
    async (id: string) => {
      const target = databases.find((d) => d.id === id);
      const nextHA = target ? !target.haEnabled : true;
      setDatabases((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, haEnabled: nextHA, nodesCount: nextHA ? 2 : 1 } : d
        )
      );
      if (isAuthenticated) {
        try {
          await databasesApi.toggleDatabaseHA(id, nextHA);
        } catch {
          // ignore
        }
      }
    },
    [databases, isAuthenticated]
  );

  // Volume Actions
  const createVolume = useCallback(
    async (vol: Omit<Volume, "id" | "createdAt">) => {
      if (isAuthenticated) {
        try {
          const wire = await storageApi.createVolume({
            name: vol.name,
            region: vol.region,
            size_gb: vol.sizeGb,
            filesystem: vol.filesystem,
          });
          const newVol = mapVolume(wire);
          setVolumes((prev) => [newVol, ...prev]);
          return;
        } catch {
          // fallback
        }
      }

      const fallbackVol: Volume = {
        ...vol,
        id: `vol-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setVolumes((prev) => [fallbackVol, ...prev]);
    },
    [isAuthenticated]
  );

  const attachVolume = useCallback(
    async (volumeId: string, instanceId: string) => {
      setVolumes((prev) =>
        prev.map((v) => (v.id === volumeId ? { ...v, attachedToInstanceId: instanceId } : v))
      );
      if (isAuthenticated) {
        try {
          await storageApi.attachVolume(volumeId, instanceId);
        } catch {
          // ignore
        }
      }
    },
    [isAuthenticated]
  );

  const detachVolume = useCallback(
    async (volumeId: string) => {
      setVolumes((prev) =>
        prev.map((v) => (v.id === volumeId ? { ...v, attachedToInstanceId: null } : v))
      );
      if (isAuthenticated) {
        try {
          await storageApi.detachVolume(volumeId);
        } catch {
          // ignore
        }
      }
    },
    [isAuthenticated]
  );

  const resizeVolume = useCallback(
    async (volumeId: string, newSizeGb: number) => {
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
      if (isAuthenticated) {
        try {
          await storageApi.resizeVolume(volumeId, newSizeGb);
        } catch {
          // ignore
        }
      }
    },
    [isAuthenticated]
  );

  const destroyVolume = useCallback(
    async (volumeId: string) => {
      setVolumes((prev) => prev.filter((v) => v.id !== volumeId));
      if (isAuthenticated) {
        try {
          await storageApi.destroyVolume(volumeId);
        } catch {
          // ignore
        }
      }
    },
    [isAuthenticated]
  );

  // S3 Actions
  const createBucket = useCallback(
    async (bucket: Omit<S3Bucket, "id" | "createdAt" | "objects" | "totalSizeBytes" | "objectCount">) => {
      if (isAuthenticated) {
        try {
          const wire = await storageApi.createBucket({
            name: bucket.name,
            region: bucket.region,
            acl: bucket.acl,
            storage_class: bucket.storageClass,
            cdn_active: bucket.cdnActive,
          });
          const newBkt = mapBucket(wire);
          setBuckets((prev) => [newBkt, ...prev]);
          return;
        } catch {
          // fallback
        }
      }

      const fallbackBucket: S3Bucket = {
        ...bucket,
        id: `bucket-${Date.now().toString().slice(-6)}`,
        objects: [],
        totalSizeBytes: 0,
        objectCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setBuckets((prev) => [fallbackBucket, ...prev]);
    },
    [isAuthenticated]
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

  const destroyBucket = useCallback(
    async (bucketId: string) => {
      setBuckets((prev) => prev.filter((b) => b.id !== bucketId));
      if (isAuthenticated) {
        try {
          await storageApi.destroyBucket(bucketId);
        } catch {
          // ignore
        }
      }
    },
    [isAuthenticated]
  );

  // Firewall Actions
  const createFirewall = useCallback(
    async (name: string, rules: FirewallRule[]) => {
      if (isAuthenticated) {
        try {
          const wire = await networkApi.createFirewall({
            name,
            rules: rules.map((r) => ({
              type: r.type,
              protocol: r.protocol,
              ports: r.ports,
              sources: r.sources,
              action: r.action,
              label: r.label,
            })),
          });
          const newFw = mapFirewall(wire);
          setFirewalls((prev) => [newFw, ...prev]);
          return;
        } catch {
          // fallback
        }
      }

      const fallbackFw: Firewall = {
        id: `fw-${Date.now().toString().slice(-6)}`,
        name,
        rules,
        attachedInstanceIds: [],
        createdAt: new Date().toISOString().split("T")[0],
      };
      setFirewalls((prev) => [fallbackFw, ...prev]);
    },
    [isAuthenticated]
  );

  const deleteFirewall = useCallback(
    async (id: string) => {
      setFirewalls((prev) => prev.filter((f) => f.id !== id));
      if (isAuthenticated) {
        try {
          await networkApi.destroyFirewall(id);
        } catch {
          // ignore
        }
      }
    },
    [isAuthenticated]
  );

  const addFirewallRule = useCallback(
    async (firewallId: string, rule: FirewallRule) => {
      setFirewalls((prev) =>
        prev.map((f) => (f.id === firewallId ? { ...f, rules: [...f.rules, rule] } : f))
      );
      if (isAuthenticated) {
        try {
          await networkApi.addFirewallRule(firewallId, {
            type: rule.type,
            protocol: rule.protocol,
            ports: rule.ports,
            sources: rule.sources,
            action: rule.action,
            label: rule.label,
          });
        } catch {
          // ignore
        }
      }
    },
    [isAuthenticated]
  );

  const deleteFirewallRule = useCallback(
    async (firewallId: string, ruleId: string) => {
      setFirewalls((prev) =>
        prev.map((f) =>
          f.id === firewallId ? { ...f, rules: f.rules.filter((r) => r.id !== ruleId) } : f
        )
      );
      if (isAuthenticated) {
        try {
          await networkApi.deleteFirewallRule(firewallId, ruleId);
        } catch {
          // ignore
        }
      }
    },
    [isAuthenticated]
  );

  // Domain Actions
  const registerDomain = useCallback(
    async (domainName: string, tld: string, wholesale: number, retail: number) => {
      const fullDomain = domainName.endsWith(tld) ? domainName : `${domainName}${tld}`;
      if (isAuthenticated) {
        try {
          const wire = await domainsApi.registerDomain({ name: fullDomain });
          const newDom = mapDomain(wire);
          setDomains((prev) => [newDom, ...prev]);
          return;
        } catch {
          // fallback
        }
      }

      const fallbackDomain: Domain = {
        id: `dom-${Date.now().toString().slice(-6)}`,
        name: fullDomain,
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
      setDomains((prev) => [fallbackDomain, ...prev]);
    },
    [isAuthenticated]
  );

  const addDNSRecord = useCallback(
    async (domainId: string, record: Omit<DNSRecord, "id">) => {
      const newRecord: DNSRecord = { ...record, id: `rec-${Date.now()}` };
      setDomains((prev) =>
        prev.map((d) => (d.id === domainId ? { ...d, records: [...d.records, newRecord] } : d))
      );
      if (isAuthenticated) {
        try {
          await domainsApi.addDNSRecord(domainId, {
            type: record.type,
            name: record.name,
            value: record.value,
            ttl: record.ttl,
            priority: record.priority,
          });
        } catch {
          // ignore
        }
      }
    },
    [isAuthenticated]
  );

  const deleteDNSRecord = useCallback(
    async (domainId: string, recordId: string) => {
      setDomains((prev) =>
        prev.map((d) =>
          d.id === domainId ? { ...d, records: d.records.filter((r) => r.id !== recordId) } : d
        )
      );
      if (isAuthenticated) {
        try {
          await domainsApi.deleteDNSRecord(domainId, recordId);
        } catch {
          // ignore
        }
      }
    },
    [isAuthenticated]
  );

  const linkDomainToResource = useCallback(
    async (domainId: string, resourceId: string) => {
      setDomains((prev) =>
        prev.map((d) => (d.id === domainId ? { ...d, linkedResourceId: resourceId } : d))
      );
      if (isAuthenticated) {
        try {
          await domainsApi.linkDomain(domainId, { resource_id: resourceId });
        } catch {
          // ignore
        }
      }
    },
    [isAuthenticated]
  );

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
  const markAlertRead = useCallback(
    async (id: string) => {
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
      if (isAuthenticated) {
        try {
          await alertsApi.markAlertRead(id);
        } catch {
          // ignore
        }
      }
    },
    [isAuthenticated]
  );

  const clearAllAlerts = useCallback(async () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    if (isAuthenticated) {
      try {
        await alertsApi.clearAllAlerts();
      } catch {
        // ignore
      }
    }
  }, [isAuthenticated]);

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
    plans,
    isLoading,
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
    refreshAll,
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
