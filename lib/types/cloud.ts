/**
 * Core Domain Types for CloudNova Cloud Platform
 * Enforces strict typings across Compute, Storage, Databases, Network, Domains, and Billing.
 */

export type DatacenterRegion =
  | "nyc1"
  | "sfo3"
  | "fra1"
  | "lon1"
  | "ams3"
  | "sgp1"
  | "tyo1"
  | "blr1";

export interface RegionInfo {
  id: DatacenterRegion;
  name: string;
  flag: string;
  country: string;
  city: string;
  pingMs: number;
}

export type OSImageId =
  | "ubuntu-24-04"
  | "ubuntu-22-04"
  | "debian-12"
  | "alpine-320"
  | "fedora-40"
  | "arch-linux"
  | "rocky-9";

export interface OSImage {
  id: OSImageId;
  name: string;
  version: string;
  family: string;
  kernel: string;
}

export type HardwareTier =
  | "basic"
  | "general"
  | "cpu-optimized"
  | "memory-optimized"
  | "gpu-ai";

export interface ComputePlan {
  id: string;
  name: string;
  tier: HardwareTier;
  vcpu: number;
  ramGb: number;
  diskGb: number;
  transferTb: number;
  wholesaleMonthly: number;
  retailMonthly: number;
  hourlyRetail: number;
}

export type InstanceStatus = "active" | "off" | "rebooting" | "provisioning";

export interface Instance {
  id: string;
  name: string;
  region: DatacenterRegion;
  image: OSImageId;
  planId: string;
  plan: ComputePlan;
  status: InstanceStatus;
  ipv4: string;
  privateIpv4: string;
  currentCpu: number;
  currentRamPercent: number;
  uptimeSeconds: number;
  tags: string[];
  clientId?: string;
  createdAt: string;
}

export type DatabaseEngine = "postgresql" | "mysql" | "redis" | "mongodb";
export type DatabaseStatus = "online" | "maintenance" | "backup" | "rebuilding";

export interface DatabaseUser {
  username: string;
  role: "admin" | "read_write" | "read_only";
  createdAt: string;
}

export interface ConnectionPool {
  id: string;
  name: string;
  database: string;
  user: string;
  mode: "transaction" | "session" | "statement";
  size: number;
  connectionUri: string;
}

export interface DatabaseBackup {
  id: string;
  createdAt: string;
  sizeMb: number;
  status: "completed" | "in_progress";
}

export interface ReadReplica {
  id: string;
  name: string;
  region: DatacenterRegion;
  status: "online" | "syncing";
  lagMs: number;
}

export interface DatabaseCluster {
  id: string;
  name: string;
  engine: DatabaseEngine;
  version: string;
  region: DatacenterRegion;
  status: DatabaseStatus;
  nodesCount: number;
  haEnabled: boolean;
  diskAllocatedGb: number;
  diskUsedGb: number;
  ramGb: number;
  vcpu: number;
  port: number;
  host: string;
  defaultDb: string;
  adminUser: string;
  adminPasswordReveal: string;
  connectionUri: string;
  wholesaleMonthly: number;
  retailMonthly: number;
  users: DatabaseUser[];
  schemas: string[];
  pools: ConnectionPool[];
  backups: DatabaseBackup[];
  replicas: ReadReplica[];
  trustedSources: string[];
  createdAt: string;
}

export interface Volume {
  id: string;
  name: string;
  region: DatacenterRegion;
  sizeGb: number;
  iops: number;
  attachedToInstanceId: string | null;
  filesystem: "ext4" | "xfs";
  wholesaleMonthly: number;
  retailMonthly: number;
  createdAt: string;
}

export interface S3Object {
  key: string;
  sizeBytes: number;
  lastModified: string;
  contentType: string;
}

export interface S3Bucket {
  id: string;
  name: string;
  region: DatacenterRegion;
  acl: "public-read" | "private";
  storageClass: "STANDARD" | "INFREQUENT";
  cdnActive: boolean;
  totalSizeBytes: number;
  objectCount: number;
  wholesaleMonthly: number;
  retailMonthly: number;
  endpoint: string;
  objects: S3Object[];
  createdAt: string;
}

export type FirewallProtocol = "tcp" | "udp" | "icmp" | "all";
export type FirewallAction = "accept" | "drop";

export interface FirewallRule {
  id: string;
  type: "inbound" | "outbound";
  protocol: FirewallProtocol;
  ports: string;
  sources: string[];
  action: FirewallAction;
  label: string;
}

export interface Firewall {
  id: string;
  name: string;
  rules: FirewallRule[];
  attachedInstanceIds: string[];
  createdAt: string;
}

export interface VPC {
  id: string;
  name: string;
  region: DatacenterRegion;
  cidr: string;
  isDefault: boolean;
  connectedInstancesCount: number;
  createdAt: string;
}

export interface LoadBalancer {
  id: string;
  name: string;
  region: DatacenterRegion;
  ip: string;
  protocol: "HTTP" | "HTTPS" | "TCP";
  port: number;
  algorithm: "round_robin" | "least_connections";
  targetInstanceIds: string[];
  healthCheckPath: string;
  sslEnabled: boolean;
  createdAt: string;
}

export interface FloatingIP {
  id: string;
  ip: string;
  region: DatacenterRegion;
  assignedInstanceId: string | null;
  createdAt: string;
}

export interface DNSRecord {
  id: string;
  type: "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS" | "SRV";
  name: string;
  value: string;
  ttl: number;
  priority?: number;
}

export interface Domain {
  id: string;
  name: string;
  tld: string;
  status: "active" | "expiring" | "transferring";
  whoisPrivacy: boolean;
  autoRenew: boolean;
  dnssec: boolean;
  sslActive: boolean;
  expiresAt: string;
  wholesaleAnnual: number;
  retailAnnual: number;
  linkedResourceId?: string;
  records: DNSRecord[];
}

export interface ClientTenant {
  id: string;
  name: string;
  email: string;
  company: string;
  balance: number;
  creditLimit: number;
  status: "active" | "suspended";
  customMarkupPercent?: number;
  activeResourcesCount: number;
  monthlySpend: number;
  createdAt: string;
}

export interface MarginConfig {
  globalMarkupPercent: number;
  computeMarkupPercent: number;
  domainsMarkupPercent: number;
  volumesMarkupPercent: number;
  s3MarkupPercent: number;
  currency: string;
}

export type TransactionType = "deposit" | "usage_charge" | "domain_purchase" | "refund";

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  description: string;
  amount: number;
  status: "completed" | "pending";
  resourceCategory: "compute" | "storage" | "domains" | "wallet" | "network";
}

export interface Invoice {
  id: string;
  period: string;
  dueDate: string;
  totalWholesale: number;
  totalRetail: number;
  netProfit: number;
  status: "paid" | "unpaid";
  pdfUrl: string;
}

export interface OperationalAlert {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "success" | "critical";
  timestamp: string;
  read: boolean;
}
