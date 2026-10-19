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
import { ApiError } from "../api/errors";
import { isUUID } from "../api/http";
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
import { useToast } from "@/components/ui/toast";

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
  createVolume: (vol: Omit<Volume, "id" | "createdAt" | "status"> & { status?: import("../types/cloud").VolumeStatus }) => Promise<void>;
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
  registerDomain: (
    domainName: string,
    tld: string,
    wholesale: number,
    retail: number
  ) => Promise<{ success: boolean; domain?: Domain; error?: string }>;
  checkDomainAvailability: (
    domainName: string
  ) => Promise<{ name: string; tld: string; available: boolean; wholesalePrice: number; retailPrice: number }>;
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
  const { showToast } = useToast();

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
        setInstances(
          instRes.value
            .filter((i) => i.status.toLowerCase() !== "terminated")
            .map((i) => mapInstance(i, loadedPlans))
        );
      }

      if (dbRes.status === "fulfilled" && Array.isArray(dbRes.value)) {
        const activeDbList = dbRes.value.filter(
          (c) => c.status.toLowerCase() !== "terminated"
        );
        const mappedDbs = activeDbList.map(mapDatabaseCluster);
        setDatabases(mappedDbs);

        if (isAuthenticated && activeDbList.length > 0) {
          const validUuids = activeDbList.filter((c) => isUUID(c.id));
          if (validUuids.length > 0) {
            Promise.allSettled(
              validUuids.map((c) => databasesApi.getDatabaseCluster(c.id))
            ).then((details) => {
              setDatabases((prev) =>
                prev.map((db) => {
                  const detailRes = details.find(
                    (d) => d.status === "fulfilled" && d.value.id === db.id
                  );
                  if (detailRes && detailRes.status === "fulfilled") {
                    return mapDatabaseCluster(detailRes.value);
                  }
                  return db;
                })
              );
            });
          }
        }
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

  // Track provisioning resources and notify on completion
  const prevProvisioningRef = React.useRef<{
    instances: Set<string>;
    databases: Set<string>;
    volumes: Set<string>;
  }>({
    instances: new Set(),
    databases: new Set(),
    volumes: new Set(),
  });

  const hasProvisioningResources = useMemo(() => {
    return (
      instances.some((i) => i.status === "provisioning" || i.status === "rebooting") ||
      databases.some((d) => d.status === "provisioning" || d.status === "rebuilding") ||
      volumes.some((v) => v.status === "provisioning" || v.status === "creating")
    );
  }, [instances, databases, volumes]);

  useEffect(() => {
    const prev = prevProvisioningRef.current;

    instances.forEach((inst) => {
      if (prev.instances.has(inst.id) && inst.status === "active") {
        prev.instances.delete(inst.id);
        showToast({
          type: "success",
          title: "Droplet Active",
          message: `Compute instance "${inst.name}" is online and operational (${inst.ipv4}).`,
        });
      } else if (inst.status === "provisioning") {
        prev.instances.add(inst.id);
      }
    });

    databases.forEach((db) => {
      if (prev.databases.has(db.id) && db.status === "online") {
        prev.databases.delete(db.id);
        showToast({
          type: "success",
          title: "Database Cluster Online",
          message: `Managed ${db.engine.toUpperCase()} cluster "${db.name}" is ready and accepting connections.`,
        });
      } else if (db.status === "provisioning" || db.status === "rebuilding") {
        prev.databases.add(db.id);
      }
    });

    volumes.forEach((vol) => {
      if (prev.volumes.has(vol.id) && (vol.status === "available" || vol.status === "in_use")) {
        prev.volumes.delete(vol.id);
        showToast({
          type: "success",
          title: "Block Volume Ready",
          message: `NVMe volume "${vol.name}" is available for instance attachment.`,
        });
      } else if (vol.status === "provisioning" || vol.status === "creating") {
        prev.volumes.add(vol.id);
      }
    });
  }, [instances, databases, volumes, showToast]);

  // Adaptive polling every 4s while any resource is provisioning
  useEffect(() => {
    if (!isAuthenticated || !hasProvisioningResources) return;
    const interval = setInterval(() => {
      refreshAll();
    }, 4000);
    return () => clearInterval(interval);
  }, [isAuthenticated, hasProvisioningResources, refreshAll]);

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

      showToast({
        type: "provisioning",
        title: "Provisioning Droplet",
        message: `Allocating NVMe compute instance "${input.name}" in region ${input.region.toUpperCase()}...`,
      });

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
        } catch (err: unknown) {
          showToast({
            type: "error",
            title: "Provisioning Failed",
            message: err instanceof Error ? err.message : "Failed to initiate instance provisioning.",
          });
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
        status: "provisioning",
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
    [isAuthenticated, plans, showToast]
  );

  const powerAction = useCallback(
    async (id: string, action: "on" | "off" | "reboot") => {
      const original = instances.find((i) => i.id === id);
      setInstances((prev) =>
        prev.map((inst) => {
          if (inst.id !== id) return inst;
          if (action === "off") return { ...inst, status: "off", currentCpu: 0, currentRamPercent: 0 };
          if (action === "on") return { ...inst, status: "active", currentCpu: 12, currentRamPercent: 35 };
          if (action === "reboot") return { ...inst, status: "rebooting" };
          return inst;
        })
      );

      if (isAuthenticated && isUUID(id)) {
        try {
          const apiAction = action === "on" ? "power_on" : action === "off" ? "power_off" : "reboot";
          await computeApi.powerAction(id, apiAction);
        } catch (err: unknown) {
          if (original) {
            setInstances((prev) => prev.map((inst) => (inst.id === id ? original : inst)));
          }
          if (err instanceof ApiError) {
            showToast({
              type: "error",
              title: "Power Action Failed",
              message: err.detail || "Unable to change instance power state.",
            });
          }
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
    [isAuthenticated, instances, showToast]
  );

  const destroyInstance = useCallback(
    async (id: string) => {
      const original = instances.find((i) => i.id === id);
      setInstances((prev) => prev.filter((i) => i.id !== id));
      if (isAuthenticated && isUUID(id)) {
        try {
          await computeApi.destroyInstance(id);
        } catch (err: unknown) {
          if (original) {
            setInstances((prev) => [...prev, original]);
          }
          if (err instanceof ApiError) {
            showToast({
              type: "error",
              title: "Failed to Destroy Instance",
              message: err.detail || "Unable to terminate instance.",
            });
          }
        }
      }
    },
    [isAuthenticated, instances, showToast]
  );

  // Database Actions
  const createDatabase = useCallback(
    async (data: Partial<DatabaseCluster>) => {
      showToast({
        type: "provisioning",
        title: "Provisioning Database Cluster",
        message: `Deploying managed ${(data.engine || "PostgreSQL").toUpperCase()} cluster "${data.name || "cluster"}"...`,
      });

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
        } catch (err: unknown) {
          showToast({
            type: "error",
            title: "Database Deployment Failed",
            message: err instanceof Error ? err.message : "Failed to deploy database cluster.",
          });
        }
      }

      const fallbackDb: DatabaseCluster = {
        id: `db-${Date.now().toString().slice(-6)}`,
        name: data.name || "new-database-cluster",
        engine: data.engine || "postgresql",
        version: data.engine === "redis" ? "7.2" : data.engine === "mysql" ? "8.4" : "16.3",
        region: data.region || "nyc1",
        status: "provisioning",
        nodesCount: data.haEnabled ? 2 : 1,
        haEnabled: !!data.haEnabled,
        diskAllocatedGb: 100,
        diskUsedGb: 2.4,
        ramGb: 8,
        vcpu: 2,
        port: data.engine === "redis" ? 6379 : data.engine === "mysql" ? 3306 : 5432,
        host: `${data.name || "db"}.internal.cloudnova.net`,
        defaultDb: "postgres",
        adminUser: "cloudnova_admin",
        adminPasswordReveal: "Secr3tP@ssw0rd!2026",
        connectionUri: `postgresql://cloudnova_admin:Secr3tP@ssw0rd!2026@${data.name || "db"}.internal.cloudnova.net:5432/postgres?sslmode=require`,
        wholesaleMonthly: 45.0,
        retailMonthly: 67.5,
        users: [{ username: "cloudnova_admin", role: "admin", createdAt: "Just now" }],
        schemas: ["postgres"],
        pools: [],
        backups: [{ id: `bak-${Date.now()}`, createdAt: "Initial snapshot", sizeMb: 50, status: "completed" }],
        replicas: [],
        trustedSources: ["0.0.0.0/0"],
        createdAt: new Date().toISOString().split("T")[0],
      };
      setDatabases((prev) => [fallbackDb, ...prev]);
    },
    [isAuthenticated, showToast]
  );

  const destroyDatabase = useCallback(
    async (id: string) => {
      const original = databases.find((d) => d.id === id);
      setDatabases((prev) => prev.filter((d) => d.id !== id));
      if (isAuthenticated && isUUID(id)) {
        try {
          await databasesApi.destroyDatabaseCluster(id);
        } catch (err: unknown) {
          if (original) {
            setDatabases((prev) => [...prev, original]);
          }
          if (err instanceof ApiError) {
            showToast({
              type: "error",
              title: "Failed to Destroy Database",
              message: err.detail || "Unable to destroy database cluster.",
            });
          }
        }
      }
    },
    [databases, isAuthenticated, showToast]
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
      if (isAuthenticated && isUUID(id)) {
        try {
          await databasesApi.toggleDatabaseHA(id, nextHA);
        } catch (err: unknown) {
          if (target) {
            setDatabases((prev) =>
              prev.map((d) => (d.id === id ? target : d))
            );
          }
          if (err instanceof ApiError) {
            showToast({
              type: "error",
              title: "HA Update Failed",
              message: err.detail || "Unable to update database high availability.",
            });
          }
        }
      }
    },
    [databases, isAuthenticated, showToast]
  );

  // Volume Actions
  const createVolume = useCallback(
    async (vol: Omit<Volume, "id" | "createdAt" | "status"> & { status?: import("../types/cloud").VolumeStatus }) => {
      showToast({
        type: "provisioning",
        title: "Creating Block Volume",
        message: `Provisioning ${vol.sizeGb}GB NVMe volume "${vol.name}" in ${vol.region}...`,
      });

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
        } catch (err: unknown) {
          showToast({
            type: "error",
            title: "Volume Creation Failed",
            message: err instanceof Error ? err.message : "Failed to provision block volume.",
          });
        }
      }

      const fallbackVol: Volume = {
        ...vol,
        id: `vol-${Date.now().toString().slice(-6)}`,
        status: vol.status || "provisioning",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setVolumes((prev) => [fallbackVol, ...prev]);
    },
    [isAuthenticated, showToast]
  );

  const attachVolume = useCallback(
    async (volumeId: string, instanceId: string) => {
      setVolumes((prev) =>
        prev.map((v) => (v.id === volumeId ? { ...v, attachedToInstanceId: instanceId } : v))
      );
      if (isAuthenticated && isUUID(volumeId) && isUUID(instanceId)) {
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
      if (isAuthenticated && isUUID(volumeId)) {
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
      if (isAuthenticated && isUUID(volumeId)) {
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
      if (isAuthenticated && isUUID(volumeId)) {
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
      showToast({
        type: "provisioning",
        title: "Creating S3 Space",
        message: `Provisioning S3 bucket "${bucket.name}" in ${bucket.region}...`,
      });

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
        } catch (err: unknown) {
          showToast({
            type: "error",
            title: "S3 Space Creation Failed",
            message: err instanceof Error ? err.message : "Failed to create S3 bucket.",
          });
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
    [isAuthenticated, showToast]
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
      if (isAuthenticated && isUUID(bucketId)) {
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
      if (isAuthenticated && isUUID(id)) {
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
      if (isAuthenticated && isUUID(firewallId)) {
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
      if (isAuthenticated && isUUID(firewallId) && isUUID(ruleId)) {
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
  const checkDomainAvailability = useCallback(
    async (domainName: string) => {
      const cleanName = domainName.trim().toLowerCase();
      if (isAuthenticated) {
        try {
          const res = await domainsApi.checkDomainAvailability(cleanName);
          return {
            name: res.name,
            tld: res.tld,
            available: res.available,
            wholesalePrice: res.wholesale_price,
            retailPrice: res.retail_price,
          };
        } catch (err: unknown) {
          if (err instanceof ApiError) {
            throw err;
          }
        }
      }

      // Deterministic fallback mock check
      const parts = cleanName.split(".");
      const tld = parts.length > 1 ? parts[parts.length - 1] : "com";
      const existing = domains.some((d) => d.name.toLowerCase() === cleanName);
      return {
        name: cleanName,
        tld,
        available: !existing,
        wholesalePrice: 10.0,
        retailPrice: 15.0,
      };
    },
    [isAuthenticated, domains]
  );

  const registerDomain = useCallback(
    async (
      domainName: string,
      tld: string,
      wholesale: number,
      retail: number
    ): Promise<{ success: boolean; domain?: Domain; error?: string }> => {
      const normalizedTld = tld.startsWith(".") ? tld : `.${tld}`;
      const fullDomain = domainName.toLowerCase().endsWith(normalizedTld.toLowerCase())
        ? domainName.toLowerCase()
        : `${domainName.toLowerCase()}${normalizedTld}`;

      if (isAuthenticated) {
        try {
          const wire = await domainsApi.registerDomain({ name: fullDomain });
          const newDom = mapDomain(wire);
          setDomains((prev) => [newDom, ...prev.filter((d) => d.name !== newDom.name)]);
          return { success: true, domain: newDom };
        } catch (err: unknown) {
          const msg =
            err instanceof ApiError
              ? err.firstFieldError || err.detail || "Failed to register domain."
              : "Failed to register domain.";
          return { success: false, error: msg };
        }
      }

      const fallbackDomain: Domain = {
        id: `dom-${Date.now().toString().slice(-6)}`,
        name: fullDomain,
        tld: normalizedTld,
        status: "active",
        whoisPrivacy: true,
        autoRenew: true,
        dnssec: true,
        sslActive: true,
        expiresAt: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
        wholesaleAnnual: wholesale,
        retailAnnual: retail,
        records: [
          { id: `rec-${Date.now()}-1`, type: "NS", name: "@", value: "ns1.cloudnova-dns.net", ttl: 86400 },
          { id: `rec-${Date.now()}-2`, type: "NS", name: "@", value: "ns2.cloudnova-dns.net", ttl: 86400 },
        ],
      };
      setDomains((prev) => [fallbackDomain, ...prev]);
      return { success: true, domain: fallbackDomain };
    },
    [isAuthenticated]
  );

  const addDNSRecord = useCallback(
    async (domainId: string, record: Omit<DNSRecord, "id">) => {
      const newRecord: DNSRecord = { ...record, id: `rec-${Date.now()}` };
      setDomains((prev) =>
        prev.map((d) => (d.id === domainId ? { ...d, records: [...d.records, newRecord] } : d))
      );
      if (isAuthenticated && isUUID(domainId)) {
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
      if (isAuthenticated && isUUID(domainId) && isUUID(recordId)) {
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
      if (isAuthenticated && isUUID(domainId) && isUUID(resourceId)) {
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
      if (isAuthenticated && isUUID(id)) {
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
    checkDomainAvailability,
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
