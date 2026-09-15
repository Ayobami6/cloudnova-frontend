import type {
  AlertResponse,
  BucketResponse,
  ComputePlanResponse,
  DatabaseClusterListItemResponse,
  DatabaseClusterResponse,
  DNSRecordResponse,
  DomainResponse,
  DomainStatus,
  FirewallResponse,
  FirewallRuleSchema,
  FloatingIPResponse,
  InstanceListItemResponse,
  InstanceResponse,
  LoadBalancerResponse,
  S3ObjectResponse,
  VPCResponse,
  VolumeResponse,
} from "./types";
import type {
  ComputePlan,
  DatabaseCluster,
  DatabaseEngine,
  DatabaseStatus,
  DatacenterRegion,
  DNSRecord,
  Domain,
  Firewall,
  FirewallAction,
  FirewallProtocol,
  FirewallRule,
  FloatingIP,
  HardwareTier,
  Instance,
  InstanceStatus,
  LoadBalancer,
  OperationalAlert,
  OSImageId,
  S3Bucket,
  S3Object,
  VPC,
  Volume,
} from "../types/cloud";
import { COMPUTE_PLANS } from "../mock-data/initial-state";

export function mapComputePlan(wire: ComputePlanResponse): ComputePlan {
  return {
    id: wire.id,
    name: wire.name,
    tier: wire.tier as HardwareTier,
    vcpu: wire.vcpu,
    ramGb: wire.ram_gb,
    diskGb: wire.disk_gb,
    transferTb: wire.transfer_tb,
    wholesaleMonthly: Number(wire.wholesale_monthly),
    retailMonthly: Number(wire.retail_monthly),
    hourlyRetail: Number(wire.hourly_retail),
  };
}

export function mapInstance(
  wire: InstanceResponse | InstanceListItemResponse,
  plans: ComputePlan[] = COMPUTE_PLANS
): Instance {
  const planId = "plan" in wire && wire.plan ? wire.plan.id : "plan_id" in wire ? wire.plan_id : "basic-1";
  const matchedPlan =
    "plan" in wire && wire.plan
      ? mapComputePlan(wire.plan)
      : plans.find((p) => p.id === planId) || plans[0] || COMPUTE_PLANS[0];

  const statusMap: Record<string, InstanceStatus> = {
    active: "active",
    running: "active",
    off: "off",
    stopped: "off",
    rebooting: "rebooting",
    provisioning: "provisioning",
    building: "provisioning",
    new: "provisioning",
  };

  const status = statusMap[wire.status.toLowerCase()] || "active";

  return {
    id: wire.id,
    name: wire.name,
    region: wire.region as DatacenterRegion,
    image: wire.image as OSImageId,
    planId: matchedPlan.id,
    plan: matchedPlan,
    status,
    ipv4: wire.ipv4 || "—",
    privateIpv4: "private_ipv4" in wire ? wire.private_ipv4 : "10.0.0.1",
    currentCpu: "current_cpu" in wire ? wire.current_cpu : Math.floor(Math.random() * 25) + 5,
    currentRamPercent: "current_ram_percent" in wire ? wire.current_ram_percent : Math.floor(Math.random() * 40) + 10,
    uptimeSeconds: "uptime_seconds" in wire ? wire.uptime_seconds : 86400,
    tags: "tags" in wire && Array.isArray(wire.tags) ? wire.tags : [],
    clientId: "client_id" in wire && wire.client_id ? wire.client_id : undefined,
    createdAt: wire.created_at,
  };
}

export function mapDatabaseCluster(
  wire: DatabaseClusterResponse | DatabaseClusterListItemResponse
): DatabaseCluster {
  const statusMap: Record<string, DatabaseStatus> = {
    online: "online",
    active: "online",
    maintenance: "maintenance",
    backup: "backup",
    rebuilding: "rebuilding",
    creating: "provisioning",
    provisioning: "provisioning",
  };

  const status = statusMap[wire.status.toLowerCase()] || "online";

  const isFull = "admin_user" in wire;
  const fullWire = isFull ? (wire as DatabaseClusterResponse) : null;

  const host = wire.host || `${wire.name}.internal.cloudnova.net`;
  const port = wire.port || (wire.engine === "redis" ? 6379 : wire.engine === "mysql" ? 3306 : 5432);
  const defaultDb = fullWire?.default_db || (wire.engine === "postgresql" ? "postgres" : "main_db");
  const adminUser = fullWire?.admin_user || (wire.engine === "redis" ? "default" : "cloudnova_admin");
  const adminPassword = fullWire?.admin_password_reveal || "••••••••••••";
  const scheme =
    wire.engine === "redis"
      ? "redis"
      : wire.engine === "mysql"
      ? "mysql"
      : wire.engine === "mongodb"
      ? "mongodb"
      : "postgresql";

  let connectionUri = fullWire?.connection_uri;
  if (!connectionUri || connectionUri.includes("@:")) {
    connectionUri =
      wire.engine === "redis"
        ? `redis://${host}:${port}/0`
        : `${scheme}://${adminUser}:${adminPassword}@${host}:${port}/${defaultDb}?sslmode=require`;
  }

  return {
    id: wire.id,
    name: wire.name,
    engine: wire.engine as DatabaseEngine,
    version: wire.version || "16",
    region: wire.region as DatacenterRegion,
    status,
    nodesCount: wire.nodes_count || 1,
    haEnabled: wire.ha_enabled ?? false,
    diskAllocatedGb: wire.disk_allocated_gb || 20,
    diskUsedGb: fullWire ? fullWire.disk_used_gb : Math.floor(wire.disk_allocated_gb * 0.4),
    ramGb: wire.ram_gb || 4,
    vcpu: wire.vcpu || 2,
    port,
    host,
    defaultDb,
    adminUser,
    adminPasswordReveal: adminPassword,
    connectionUri,
    wholesaleMonthly: fullWire ? Number(fullWire.wholesale_monthly) : 15,
    retailMonthly: fullWire ? Number(fullWire.retail_monthly) : 25,
    users: fullWire?.users
      ? fullWire.users.map((u) => ({
          username: u.username,
          role: (u.role as "admin" | "read_write" | "read_only") || "read_write",
          createdAt: new Date().toISOString(),
        }))
      : [{ username: adminUser, role: "admin", createdAt: wire.created_at }],
    schemas: fullWire?.schemas || [defaultDb],
    pools: fullWire?.pools
      ? fullWire.pools.map((p) => ({
          id: p.id,
          name: p.name,
          database: p.database,
          user: p.user,
          mode: (p.mode as "transaction" | "session" | "statement") || "transaction",
          size: p.size,
          connectionUri: p.connection_uri,
        }))
      : [],
    backups: fullWire?.backups
      ? fullWire.backups.map((b) => ({
          id: b.id,
          createdAt: new Date().toISOString(),
          sizeMb: b.size_mb,
          status: (b.status as "completed" | "in_progress") || "completed",
        }))
      : [],
    replicas: fullWire?.replicas
      ? fullWire.replicas.map((r) => ({
          id: r.id,
          name: r.name,
          region: r.region as DatacenterRegion,
          status: (r.status as "online" | "syncing") || "online",
          lagMs: r.lag_ms,
        }))
      : [],
    trustedSources: fullWire?.trusted_sources || ["0.0.0.0/0"],
    createdAt: wire.created_at,
  };
}

export function mapVolume(wire: VolumeResponse): Volume {
  const statusMap: Record<string, Volume["status"]> = {
    available: "available",
    in_use: "in_use",
    provisioning: "provisioning",
    creating: "provisioning",
    offline: "offline",
  };
  const status = statusMap[wire.status?.toLowerCase()] || "available";

  return {
    id: wire.id,
    name: wire.name,
    region: wire.region as DatacenterRegion,
    sizeGb: wire.size_gb,
    iops: wire.iops || wire.size_gb * 3,
    status,
    attachedToInstanceId: wire.attached_to_instance_id,
    filesystem: (wire.filesystem as "ext4" | "xfs") || "ext4",
    wholesaleMonthly: Number(wire.wholesale_monthly) || wire.size_gb * 0.08,
    retailMonthly: Number(wire.retail_monthly) || wire.size_gb * 0.1,
    createdAt: wire.created_at,
  };
}

export function mapS3Object(wire: S3ObjectResponse): S3Object {
  return {
    key: wire.key,
    sizeBytes: wire.size_bytes,
    lastModified: wire.last_modified,
    contentType: wire.content_type,
  };
}

export function mapBucket(wire: BucketResponse): S3Bucket {
  return {
    id: wire.id,
    name: wire.name,
    region: wire.region as DatacenterRegion,
    acl: (wire.acl as "public-read" | "private") || "private",
    storageClass: (wire.storage_class as "STANDARD" | "INFREQUENT") || "STANDARD",
    cdnActive: wire.cdn_active ?? false,
    totalSizeBytes: wire.total_size_bytes || 0,
    objectCount: wire.object_count || 0,
    wholesaleMonthly: Number(wire.wholesale_monthly) || 5,
    retailMonthly: Number(wire.retail_monthly) || 5,
    endpoint: wire.endpoint || `https://${wire.name}.${wire.region}.cloudnovaspaces.com`,
    objects: Array.isArray(wire.objects) ? wire.objects.map(mapS3Object) : [],
    createdAt: wire.created_at,
  };
}

export function mapFirewallRule(wire: FirewallRuleSchema): FirewallRule {
  return {
    id: wire.id,
    type: (wire.type as "inbound" | "outbound") || "inbound",
    protocol: (wire.protocol as FirewallProtocol) || "tcp",
    ports: wire.ports || "all",
    sources: Array.isArray(wire.sources) ? wire.sources : ["0.0.0.0/0"],
    action: (wire.action as FirewallAction) || "accept",
    label: wire.label || "",
  };
}

export function mapFirewall(wire: FirewallResponse): Firewall {
  return {
    id: wire.id,
    name: wire.name,
    rules: Array.isArray(wire.rules) ? wire.rules.map(mapFirewallRule) : [],
    attachedInstanceIds: Array.isArray(wire.attached_instance_ids) ? wire.attached_instance_ids : [],
    createdAt: wire.created_at,
  };
}

export function mapVPC(wire: VPCResponse): VPC {
  return {
    id: wire.id,
    name: wire.name,
    region: wire.region as DatacenterRegion,
    cidr: wire.cidr,
    isDefault: wire.is_default ?? false,
    connectedInstancesCount: wire.connected_instances_count || 0,
    createdAt: wire.created_at,
  };
}

export function mapLoadBalancer(wire: LoadBalancerResponse): LoadBalancer {
  return {
    id: wire.id,
    name: wire.name,
    region: wire.region as DatacenterRegion,
    ip: wire.ip || "198.51.100.22",
    protocol: (wire.protocol as "HTTP" | "HTTPS" | "TCP") || "HTTP",
    port: wire.port || 80,
    algorithm: (wire.algorithm as "round_robin" | "least_connections") || "round_robin",
    targetInstanceIds: Array.isArray(wire.target_instance_ids) ? wire.target_instance_ids : [],
    healthCheckPath: wire.health_check_path || "/healthz",
    sslEnabled: wire.ssl_enabled ?? false,
    createdAt: wire.created_at,
  };
}

export function mapFloatingIP(wire: FloatingIPResponse): FloatingIP {
  return {
    id: wire.id,
    ip: wire.ip,
    region: wire.region as DatacenterRegion,
    assignedInstanceId: wire.assigned_instance_id,
    createdAt: wire.created_at,
  };
}

export function mapDNSRecord(wire: DNSRecordResponse): DNSRecord {
  return {
    id: wire.id,
    type: (wire.type as DNSRecord["type"]) || "A",
    name: wire.name,
    value: wire.value,
    ttl: wire.ttl,
    priority: wire.priority !== null ? wire.priority : undefined,
  };
}

export function mapDomain(wire: DomainResponse): Domain {
  return {
    id: wire.id,
    name: wire.name,
    tld: wire.tld,
    status: (wire.status as DomainStatus) || "active",
    whoisPrivacy: wire.whois_privacy ?? true,
    autoRenew: wire.auto_renew ?? true,
    dnssec: wire.dnssec ?? false,
    sslActive: wire.ssl_active ?? true,
    expiresAt: wire.expires_at || new Date(Date.now() + 31536000000).toISOString(),
    wholesaleAnnual: Number(wire.wholesale_annual) || 10,
    retailAnnual: Number(wire.retail_annual) || 14,
    linkedResourceId: wire.linked_resource_id || undefined,
    records: Array.isArray(wire.records) ? wire.records.map(mapDNSRecord) : [],
  };
}

export function mapAlert(wire: AlertResponse): OperationalAlert {
  return {
    id: wire.id,
    title: wire.title,
    message: wire.message,
    severity: wire.severity || "info",
    timestamp: wire.timestamp || wire.created_at,
    read: wire.read ?? false,
  };
}
