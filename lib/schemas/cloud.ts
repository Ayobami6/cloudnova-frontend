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
  type: z.enum(["inbound", "outbound"]),
  protocol: z.enum(["tcp", "udp", "icmp", "all"]),
  ports: z.string().min(1),
  sources: z.array(z.string()).min(1),
  action: z.enum(["accept", "drop"]),
  label: z.string().min(1),
});

export type CreateFirewallRuleInput = z.infer<typeof CreateFirewallRuleSchema>;

export const AddDNSRecordSchema = z.object({
  type: z.enum(["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV"]),
  name: z.string().min(1),
  value: z.string().min(1),
  ttl: z.number().int().min(60).max(86400).default(300),
  priority: z.number().int().optional(),
});

export type AddDNSRecordInput = z.infer<typeof AddDNSRecordSchema>;

export const DepositFundsSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  method: z.enum(["card", "wire", "crypto"]),
});

export type DepositFundsInput = z.infer<typeof DepositFundsSchema>;
