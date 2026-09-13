import { z } from "zod";

export const CreateDropletSchema = z.object({
  name: z
    .string()
    .min(3, "Hostname must be at least 3 characters")
    .max(63, "Hostname cannot exceed 63 characters")
    .regex(/^[a-z0-9-]+$/, "Hostname can only contain lowercase letters, numbers, and hyphens"),
  region: z.enum(["nyc1", "sfo3", "fra1", "lon1", "ams3", "sgp1", "tyo1", "blr1"]),
  image: z.enum([
    "ubuntu-24-04",
    "ubuntu-22-04",
    "debian-12",
    "alpine-320",
    "fedora-40",
    "arch-linux",
    "rocky-9",
  ]),
  planId: z.string().min(1, "Plan selection is required"),
  tags: z.string().optional(),
  enableBackups: z.boolean().default(false),
  enableMonitoring: z.boolean().default(true),
  sshKeyName: z.string().default("id_ed25519_default"),
  clientId: z.string().optional(),
});

export type CreateDropletInput = z.infer<typeof CreateDropletSchema>;

export const CreateDatabaseSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9-]+$/, "Database cluster name must be lowercase alphanumeric and hyphens"),
  engine: z.enum(["postgresql", "mysql", "redis", "mongodb"]),
  region: z.enum(["nyc1", "sfo3", "fra1", "lon1", "ams3", "sgp1", "tyo1", "blr1"]),
  planId: z.enum(["db-std-1", "db-std-2", "db-mem-4", "db-hi-8"]),
  haEnabled: z.boolean().default(false),
  clientId: z.string().optional(),
});

export type CreateDatabaseInput = z.infer<typeof CreateDatabaseSchema>;

export const CreateVolumeSchema = z.object({
  name: z.string().min(3).max(64),
  region: z.enum(["nyc1", "sfo3", "fra1", "lon1", "ams3", "sgp1", "tyo1", "blr1"]),
  sizeGb: z.number().int().min(10).max(16384),
  filesystem: z.enum(["ext4", "xfs"]).default("ext4"),
  attachToInstanceId: z.string().nullable().optional(),
  clientId: z.string().optional(),
});

export type CreateVolumeInput = z.infer<typeof CreateVolumeSchema>;

export const CreateBucketSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(63)
    .regex(/^[a-z0-9-]+$/, "Bucket name must be lowercase alphanumeric and hyphens"),
  region: z.enum(["nyc1", "sfo3", "fra1", "lon1", "ams3", "sgp1", "tyo1", "blr1"]),
  acl: z.enum(["public-read", "private"]).default("public-read"),
  storageClass: z.enum(["STANDARD", "INFREQUENT"]).default("STANDARD"),
  cdnActive: z.boolean().default(true),
  clientId: z.string().optional(),
});

export type CreateBucketInput = z.infer<typeof CreateBucketSchema>;

export const CreateFirewallRuleSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["inbound", "outbound"]),
  protocol: z.enum(["tcp", "udp", "icmp", "all"]),
  ports: z.string().min(1),
  sources: z.array(z.string()).min(1),
  action: z.enum(["accept", "drop"]).default("accept"),
  label: z.string().default(""),
});

export type CreateFirewallRuleInput = z.infer<typeof CreateFirewallRuleSchema>;

export const CreateFirewallSchema = z.object({
  name: z.string().min(3).max(64),
  region: z.enum(["nyc1", "sfo3", "fra1", "lon1", "ams3", "sgp1", "tyo1", "blr1"]).default("nyc1"),
  rules: z.array(CreateFirewallRuleSchema).default([]),
  attachedInstanceIds: z.array(z.string().uuid()).default([]),
});

export type CreateFirewallInput = z.infer<typeof CreateFirewallSchema>;

export const CreateVPCSchema = z.object({
  name: z.string().min(3).max(64),
  region: z.enum(["nyc1", "sfo3", "fra1", "lon1", "ams3", "sgp1", "tyo1", "blr1"]).default("nyc1"),
  cidr: z
    .string()
    .regex(/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/, "Must be valid CIDR format (e.g. 10.0.0.0/16)")
    .default("10.0.0.0/16"),
  isDefault: z.boolean().default(false),
});

export type CreateVPCInput = z.infer<typeof CreateVPCSchema>;

export const CreateLoadBalancerSchema = z.object({
  name: z.string().min(3).max(64),
  region: z.enum(["nyc1", "sfo3", "fra1", "lon1", "ams3", "sgp1", "tyo1", "blr1"]).default("nyc1"),
  protocol: z.enum(["HTTP", "TCP"]).default("HTTP"),
  port: z.number().int().min(1).max(65535).default(80),
  algorithm: z.enum(["round_robin", "least_connections"]).default("round_robin"),
  targetInstanceIds: z.array(z.string().uuid()).default([]),
  healthCheckPath: z.string().min(1).default("/health"),
  sslEnabled: z.boolean().default(false),
});

export type CreateLoadBalancerInput = z.infer<typeof CreateLoadBalancerSchema>;

export const ReserveFloatingIPSchema = z.object({
  region: z.enum(["nyc1", "sfo3", "fra1", "lon1", "ams3", "sgp1", "tyo1", "blr1"]).default("nyc1"),
});

export type ReserveFloatingIPInput = z.infer<typeof ReserveFloatingIPSchema>;

export const AssignFloatingIPSchema = z.object({
  instanceId: z.string().uuid("Must be valid instance UUID"),
});

export type AssignFloatingIPInput = z.infer<typeof AssignFloatingIPSchema>;

export const RegistrantContactSchema = z.object({
  firstName: z.string().min(1).default("CloudNova"),
  lastName: z.string().min(1).default("Customer"),
  email: z.string().email().default("admin@cloudnova.io"),
  phone: z.string().min(1).default("+1.5555555555"),
  addressLine1: z.string().min(1).default("123 Cloud Way"),
  city: z.string().min(1).default("San Francisco"),
  state: z.string().min(1).default("CA"),
  countryCode: z.string().length(2).default("US"),
  postalCode: z.string().min(1).default("94105"),
});

export type RegistrantContactInput = z.infer<typeof RegistrantContactSchema>;

export const RegisterDomainSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(253)
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/, "Must be a valid domain name"),
  whoisPrivacy: z.boolean().default(true),
  autoRenew: z.boolean().default(true),
  dnssec: z.boolean().default(false),
  contact: RegistrantContactSchema.optional(),
});

export type RegisterDomainInput = z.infer<typeof RegisterDomainSchema>;

export const AddDNSRecordSchema = z.object({
  type: z.enum(["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV", "CAA"]),
  name: z.string().min(1, "Name is required"),
  value: z.string().min(1, "Value is required"),
  ttl: z.number().int().min(60).max(86400).default(300),
  priority: z.number().int().min(0).max(65535).optional(),
});

export type AddDNSRecordInput = z.infer<typeof AddDNSRecordSchema>;

export const LinkDomainSchema = z.object({
  resourceId: z.string().uuid("Must be a valid compute droplet or load balancer UUID"),
});

export type LinkDomainInput = z.infer<typeof LinkDomainSchema>;

export const UpdateDomainSettingsSchema = z.object({
  autoRenew: z.boolean().optional(),
  whoisPrivacy: z.boolean().optional(),
  dnssec: z.boolean().optional(),
});

export type UpdateDomainSettingsInput = z.infer<typeof UpdateDomainSettingsSchema>;

export const CreateAlertSchema = z.object({
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  severity: z.enum(["info", "warning", "success", "critical"]).default("info"),
});

export type CreateAlertInput = z.infer<typeof CreateAlertSchema>;

export const CreateDatabaseUserSchema = z.object({
  username: z
    .string()
    .min(2)
    .max(63)
    .regex(/^[a-zA-Z][a-zA-Z0-9_]{1,62}$/, "Username must start with letter and contain only alphanumeric and _"),
  role: z.enum(["admin", "read_write", "read_only"]).default("read_write"),
});

export type CreateDatabaseUserInput = z.infer<typeof CreateDatabaseUserSchema>;

export const ResizeVolumeSchema = z.object({
  sizeGb: z.number().int().min(10).max(16384),
});

export type ResizeVolumeInput = z.infer<typeof ResizeVolumeSchema>;

export const AttachVolumeSchema = z.object({
  instanceId: z.string().uuid("Must be a valid instance UUID"),
});

export type AttachVolumeInput = z.infer<typeof AttachVolumeSchema>;

export const PowerActionSchema = z.object({
  action: z.enum(["power_on", "power_off", "reboot"]),
});

export type PowerActionInput = z.infer<typeof PowerActionSchema>;

export const DepositFundsSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  method: z.enum(["card", "wire", "crypto"]),
});

export type DepositFundsInput = z.infer<typeof DepositFundsSchema>;

