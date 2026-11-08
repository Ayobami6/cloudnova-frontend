import {
  RegionInfo,
  OSImage,
  ComputePlan,
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
  MarginConfig,
  Transaction,
  Invoice,
  OperationalAlert,
} from "../types/cloud";

export const REGIONS: RegionInfo[] = [
  { id: "nyc1", name: "New York 1", flag: "🇺🇸", country: "US East", city: "New York", pingMs: 18 },
  { id: "sfo3", name: "San Francisco 3", flag: "🇺🇸", country: "US West", city: "San Francisco", pingMs: 34 },
  { id: "fra1", name: "Frankfurt 1", flag: "🇩🇪", country: "EU Central", city: "Frankfurt", pingMs: 82 },
  { id: "lon1", name: "London 1", flag: "🇬🇧", country: "EU West", city: "London", pingMs: 76 },
  { id: "ams3", name: "Amsterdam 3", flag: "🇳🇱", country: "EU North", city: "Amsterdam", pingMs: 80 },
  { id: "sgp1", name: "Singapore 1", flag: "🇸🇬", country: "AP South", city: "Singapore", pingMs: 185 },
  { id: "tyo1", name: "Tokyo 1", flag: "🇯🇵", country: "AP East", city: "Tokyo", pingMs: 142 },
  { id: "blr1", name: "Bangalore 1", flag: "🇮🇳", country: "AP South", city: "Bangalore", pingMs: 195 },
];

export const OS_IMAGES: OSImage[] = [
  { id: "ubuntu-24-04", name: "Ubuntu 24.04 LTS", version: "Noble Numbat", family: "ubuntu", kernel: "Linux 6.8" },
  { id: "ubuntu-22-04", name: "Ubuntu 22.04 LTS", version: "Jammy Jellyfish", family: "ubuntu", kernel: "Linux 5.15" },
  { id: "debian-12", name: "Debian 12", version: "Bookworm", family: "debian", kernel: "Linux 6.1" },
  { id: "alpine-320", name: "Alpine Linux 3.20", version: "Edge Minimal", family: "alpine", kernel: "Linux 6.6" },
  { id: "fedora-40", name: "Fedora Cloud 40", version: "Server Base", family: "fedora", kernel: "Linux 6.8" },
  { id: "arch-linux", name: "Arch Linux", version: "Rolling Release", family: "arch", kernel: "Linux 6.9" },
  { id: "rocky-9", name: "Rocky Linux 9", version: "Enterprise Blue", family: "rhel", kernel: "Linux 5.14" },
];

export const COMPUTE_PLANS: ComputePlan[] = [
  // --- Basic Tier (Burstable t3) ---
  { id: "basic-1x1", name: "Basic 1 vCPU / 1 GB", tier: "basic", vcpu: 1, ramGb: 1, diskGb: 25, transferTb: 1, wholesaleMonthly: 4.0, retailMonthly: 5.0, hourlyRetail: 0.0069 },
  { id: "basic-1x2", name: "Basic 1 vCPU / 2 GB", tier: "basic", vcpu: 1, ramGb: 2, diskGb: 50, transferTb: 2, wholesaleMonthly: 8.0, retailMonthly: 10.0, hourlyRetail: 0.0139 },
  { id: "basic-2x2", name: "Basic 2 vCPU / 2 GB", tier: "basic", vcpu: 2, ramGb: 2, diskGb: 60, transferTb: 3, wholesaleMonthly: 12.0, retailMonthly: 15.0, hourlyRetail: 0.0208 },
  { id: "basic-2x4", name: "Basic 2 vCPU / 4 GB", tier: "basic", vcpu: 2, ramGb: 4, diskGb: 80, transferTb: 4, wholesaleMonthly: 18.0, retailMonthly: 22.5, hourlyRetail: 0.0313 },
  // --- General Purpose Tier (Balanced m5 / t3) ---
  { id: "general-2x4", name: "General Purpose 2 vCPU / 4 GB", tier: "general", vcpu: 2, ramGb: 4, diskGb: 80, transferTb: 4, wholesaleMonthly: 16.0, retailMonthly: 20.0, hourlyRetail: 0.0278 },
  { id: "general-4x8", name: "General Purpose 4 vCPU / 8 GB", tier: "general", vcpu: 4, ramGb: 8, diskGb: 160, transferTb: 5, wholesaleMonthly: 32.0, retailMonthly: 40.0, hourlyRetail: 0.0556 },
  { id: "general-4x16", name: "General Purpose 4 vCPU / 16 GB", tier: "general", vcpu: 4, ramGb: 16, diskGb: 240, transferTb: 6, wholesaleMonthly: 56.0, retailMonthly: 70.0, hourlyRetail: 0.0972 },
  { id: "general-8x32", name: "General Purpose 8 vCPU / 32 GB", tier: "general", vcpu: 8, ramGb: 32, diskGb: 480, transferTb: 8, wholesaleMonthly: 112.0, retailMonthly: 140.0, hourlyRetail: 0.1944 },
  { id: "general-16x64", name: "General Purpose 16 vCPU / 64 GB", tier: "general", vcpu: 16, ramGb: 64, diskGb: 960, transferTb: 10, wholesaleMonthly: 224.0, retailMonthly: 280.0, hourlyRetail: 0.3889 },
  // --- CPU-Optimized Tier (Compute c5) ---
  { id: "cpu-opt-2x4", name: "CPU-Optimized 2 vCPU / 4 GB", tier: "cpu-optimized", vcpu: 2, ramGb: 4, diskGb: 80, transferTb: 4, wholesaleMonthly: 24.0, retailMonthly: 30.0, hourlyRetail: 0.0417 },
  { id: "cpu-opt-4x4", name: "CPU-Optimized 4 vCPU / 4 GB", tier: "cpu-optimized", vcpu: 4, ramGb: 4, diskGb: 100, transferTb: 5, wholesaleMonthly: 48.0, retailMonthly: 60.0, hourlyRetail: 0.0833 },
  { id: "cpu-opt-4x8", name: "CPU-Optimized 4 vCPU / 8 GB", tier: "cpu-optimized", vcpu: 4, ramGb: 8, diskGb: 160, transferTb: 5, wholesaleMonthly: 52.0, retailMonthly: 65.0, hourlyRetail: 0.0903 },
  { id: "cpu-opt-8x16", name: "CPU-Optimized 8 vCPU / 16 GB", tier: "cpu-optimized", vcpu: 8, ramGb: 16, diskGb: 320, transferTb: 6, wholesaleMonthly: 104.0, retailMonthly: 130.0, hourlyRetail: 0.1806 },
  { id: "cpu-opt-16x32", name: "CPU-Optimized 16 vCPU / 32 GB", tier: "cpu-optimized", vcpu: 16, ramGb: 32, diskGb: 640, transferTb: 8, wholesaleMonthly: 208.0, retailMonthly: 260.0, hourlyRetail: 0.3611 },
  // --- Memory-Optimized Tier (High RAM r5) ---
  { id: "mem-opt-2x16", name: "Memory-Optimized 2 vCPU / 16 GB", tier: "memory-optimized", vcpu: 2, ramGb: 16, diskGb: 100, transferTb: 4, wholesaleMonthly: 36.0, retailMonthly: 45.0, hourlyRetail: 0.0625 },
  { id: "mem-opt-4x32", name: "Memory-Optimized 4 vCPU / 32 GB", tier: "memory-optimized", vcpu: 4, ramGb: 32, diskGb: 200, transferTb: 6, wholesaleMonthly: 64.0, retailMonthly: 80.0, hourlyRetail: 0.1111 },
  { id: "mem-opt-8x64", name: "Memory-Optimized 8 vCPU / 64 GB", tier: "memory-optimized", vcpu: 8, ramGb: 64, diskGb: 400, transferTb: 8, wholesaleMonthly: 128.0, retailMonthly: 160.0, hourlyRetail: 0.2222 },
  { id: "mem-opt-16x128", name: "Memory-Optimized 16 vCPU / 128 GB", tier: "memory-optimized", vcpu: 16, ramGb: 128, diskGb: 800, transferTb: 10, wholesaleMonthly: 256.0, retailMonthly: 320.0, hourlyRetail: 0.4444 },
  // --- GPU AI Accelerated Tier (g4dn / g5) ---
  { id: "gpu-4x16", name: "GPU AI 4 vCPU / 16 GB", tier: "gpu-ai", vcpu: 4, ramGb: 16, diskGb: 250, transferTb: 6, wholesaleMonthly: 180.0, retailMonthly: 225.0, hourlyRetail: 0.3125 },
  { id: "gpu-8x32", name: "GPU AI 8 vCPU / 32 GB", tier: "gpu-ai", vcpu: 8, ramGb: 32, diskGb: 400, transferTb: 10, wholesaleMonthly: 320.0, retailMonthly: 400.0, hourlyRetail: 0.5556 },
  { id: "gpu-16x64", name: "GPU AI 16 vCPU / 64 GB", tier: "gpu-ai", vcpu: 16, ramGb: 64, diskGb: 800, transferTb: 12, wholesaleMonthly: 580.0, retailMonthly: 725.0, hourlyRetail: 1.0069 },
];

export const INITIAL_INSTANCES: Instance[] = [];

export const INITIAL_DATABASES: DatabaseCluster[] = [];

export const INITIAL_VOLUMES: Volume[] = [];

export const INITIAL_BUCKETS: S3Bucket[] = [];

export const INITIAL_FIREWALLS: Firewall[] = [];

export const INITIAL_VPCS: VPC[] = [];

export const INITIAL_LOAD_BALANCERS: LoadBalancer[] = [];

export const INITIAL_FLOATING_IPS: FloatingIP[] = [];

export const INITIAL_DOMAINS: Domain[] = [];

export const INITIAL_CLIENTS: ClientTenant[] = [];

export const INITIAL_MARGIN_CONFIG: MarginConfig = {
  globalMarkupPercent: 35,
  computeMarkupPercent: 40,
  domainsMarkupPercent: 45,
  volumesMarkupPercent: 50,
  s3MarkupPercent: 60,
  currency: "USD",
};

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_ALERTS: OperationalAlert[] = [];
