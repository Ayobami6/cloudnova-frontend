/**
 * TypeScript mirrors of cloudnova-api's Pydantic v2 wire schemas across all 8 domains:
 * 1. Authentication & Multi-Tenancy
 * 2. Double-Entry Billing & Ledger
 * 3. Compute (Instances & Plans)
 * 4. Databases (Managed Clusters)
 * 5. Storage (Block Volumes & S3 Spaces)
 * 6. Network (Firewalls, VPCs, Load Balancers, Floating IPs)
 * 7. Domains (Route 53 DNS & Registrations)
 * 8. Operational Alerts & Notifications
 *
 * Field names strictly match the API wire format (snake_case) to maintain a 1:1 contract.
 */

// ==============================================================================
// 0. Shared Value Objects & Enums
// ==============================================================================

export type DatacenterRegion =
  | "nyc1"
  | "sfo3"
  | "fra1"
  | "lon1"
  | "ams3"
  | "sgp1"
  | "tyo1"
  | "blr1";

export type OSImageId =
  | "ubuntu-24-04"
  | "ubuntu-22-04"
  | "debian-12"
  | "alpine-320"
  | "fedora-40"
  | "arch-linux"
  | "rocky-9";

export type HardwareTier =
  | "basic"
  | "general"
  | "cpu-optimized"
  | "memory-optimized"
  | "gpu-ai";

export type DatabaseEngine = "postgresql" | "mysql" | "redis" | "mongodb";
export type DatabaseUserRole = "admin" | "read_write" | "read_only";
export type DatabaseStatus = "online" | "maintenance" | "backup" | "rebuilding";

export type VolumeFilesystem = "ext4" | "xfs";
export type BucketACL = "public-read" | "private";
export type StorageClass = "STANDARD" | "INFREQUENT";

export type FirewallProtocol = "tcp" | "udp" | "icmp" | "all";
export type FirewallAction = "accept" | "drop";
export type RuleDirection = "inbound" | "outbound";

export type LBProtocol = "HTTP" | "HTTPS" | "TCP";
export type LBAlgorithm = "round_robin" | "least_connections";

export type DNSRecordType = "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS" | "SRV" | "CAA";
export type DomainStatus = "active" | "expiring" | "transferring";

export type AlertSeverity = "info" | "warning" | "success" | "critical";

// ==============================================================================
// 1. Authentication & Multi-Tenancy Schemas
// ==============================================================================

export type AccountRole = "OWNER" | "ADMIN" | "DEVELOPER" | "BILLING_VIEWER";

export interface RegisterUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface VerifyEmailOtpRequest {
  email: string;
  otp_code: string;
}

export type OtpPurpose = "registration" | "password_reset";

export interface ResendOtpRequest {
  email: string;
  purpose?: OtpPurpose;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp_code: string;
  new_password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface TokenPairResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_email_verified: boolean;
}

export interface AccountResponse {
  id: string;
  name: string;
  slug: string;
  account_number: string;
  owner_id: string;
}

export interface AuthSuccessResponse {
  user: UserResponse;
  account: AccountResponse | null;
  tokens: TokenPairResponse;
}

export interface MeResponse {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    is_email_verified: boolean;
  };
  active_account: {
    id: string;
    name: string;
    slug: string;
    account_number: string;
    role: AccountRole;
  } | null;
}

export interface CreateAccountRequest {
  name: string;
}

export interface SwitchAccountRequest {
  account_id: string;
}

export interface SwitchAccountResponse {
  access_token: string;
  token_type: string;
  active_account: {
    id: string;
    name: string;
    slug: string;
    account_number: string;
  };
}

export interface InviteMemberRequest {
  email: string;
  role?: AccountRole;
}

export interface AcceptInvitationRequest {
  token: string;
}

export interface MemberResponse {
  id: string;
  user_id: string;
  account_id: string;
  role: AccountRole;
  joined_at: string;
}

export interface AccountInvitationResponse {
  id: string;
  account_id: string;
  email: string;
  role: AccountRole;
  expires_at: string;
  is_accepted: boolean;
}

// ==============================================================================
// 2. Billing & Ledger Schemas
// ==============================================================================

export interface BalanceResponse {
  account_id: string;
  account_number: string;
  currency: string;
  balance: string;
}

export interface DepositRequest {
  amount: string;
  currency?: string;
  payment_method?: string;
  reference: string;
}

export interface DepositResponse {
  reference: string;
  amount: string;
  currency: string;
  wallet_balance: string;
  status: string;
}

export interface SwitchCurrencyRequest {
  currency: string;
}

export interface SwitchCurrencyResponse {
  account_id: string;
  currency: string;
  message: string;
}

export interface CreateVirtualAccountRequest {
  phone?: string;
}

export interface InitializeCheckoutRequest {
  amount: string;
  currency?: string;
  reference?: string;
}

export interface CheckoutSessionResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface WebhookAckResponse {
  status: string;
}

export interface VirtualAccountResponse {
  id: string;
  provider: string;
  currency: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  account_reference: string;
  crypto_address: string;
  lightning_address: string;
  is_active: boolean;
}

export interface ResourceUsageItemResponse {
  resource_id: string;
  resource_type: string;
  resource_name: string;
  status: string;
  hourly_rate: string;
  currency: string;
  hours_run_this_month: string;
  accrued_cost: string;
}

export interface UsageSummaryResponse {
  billing_period: string;
  currency: string;
  wallet_balance: string;
  accrued_usage_amount: string;
  projected_month_end_amount: string;
  hourly_burn_rate: string;
  daily_burn_rate: string;
  estimated_runway_hours: number;
  resources: ResourceUsageItemResponse[];
}

export interface ProvisioningCheckRequest {
  hourly_rate: string;
  currency?: string;
}

export interface ProvisioningCheckResponse {
  can_provision: boolean;
  wallet_balance: string;
  projected_monthly_cost: string;
  currency: string;
  message: string;
}

export interface TransactionResponse {
  id: string;
  date: string;
  type: string;
  description: string;
  amount: string;
  currency: string;
  status: string;
  resource_category: string;
}

export interface InvoiceLineItemResponse {
  id: string;
  resource_id: string;
  resource_type: string;
  resource_name: string;
  running_hours: string;
  hourly_rate: string;
  total_amount: string;
  currency: string;
}

export interface InvoiceResponse {
  id: string;
  period: string;
  due_date: string;
  total_wholesale: string;
  total_retail: string;
  net_profit: string;
  currency: string;
  status: string;
  pdf_url: string;
  paid_at: string | null;
  line_items: InvoiceLineItemResponse[];
}

export interface MarginConfigResponse {
  global_markup_percent: string;
  compute_markup_percent: string;
  database_markup_percent: string;
  storage_markup_percent: string;
  domains_markup_percent: string;
  currency: string;
}

export interface UpdateMarginConfigRequest {
  global_markup_percent: number;
  compute_markup_percent: number;
  database_markup_percent: number;
  storage_markup_percent: number;
  domains_markup_percent: number;
  currency?: string;
}

// ==============================================================================
// 3. Compute Schemas
// ==============================================================================

export interface ComputePlanResponse {
  id: string;
  name: string;
  tier: string;
  vcpu: number;
  ram_gb: number;
  disk_gb: number;
  transfer_tb: number;
  wholesale_monthly: string | number;
  retail_monthly: string | number;
  hourly_retail: string | number;
  currency: string;
}

export interface CreateInstanceRequest {
  name: string;
  region: DatacenterRegion | string;
  image: OSImageId | string;
  plan_id: string;
  tags?: string[];
  idempotency_key?: string | null;
}

export interface InstanceResponse {
  id: string;
  name: string;
  region: DatacenterRegion | string;
  image: OSImageId | string;
  plan: ComputePlanResponse;
  status: string;
  ipv4: string;
  private_ipv4: string;
  current_cpu: number;
  current_ram_percent: number;
  uptime_seconds: number;
  tags: string[];
  client_id: string | null;
  provider_instance_id: string;
  created_at: string;
  updated_at: string;
}

export interface InstanceListItemResponse {
  id: string;
  name: string;
  region: DatacenterRegion | string;
  image: OSImageId | string;
  plan_id: string;
  plan_name: string;
  status: string;
  ipv4: string;
  hourly_retail: string | number;
  currency: string;
  created_at: string;
}

export interface PowerActionRequest {
  action: "power_on" | "power_off" | "reboot";
}

export interface InstanceActionResponse {
  id: string;
  status: string;
  message: string;
}

export interface TerminalSessionResponse {
  session_id: string;
  stream_url: string;
  token_value: string;
}

// ==============================================================================
// 4. Databases Schemas
// ==============================================================================

export interface DatabasePlanResponse {
  id: string;
  name: string;
  tier: string;
  vcpu: number;
  ram_gb: number;
  disk_gb: number;
  wholesale_monthly: string | number;
  retail_monthly: string | number;
  hourly_retail: string | number;
  currency: string;
}

export interface DatabaseUserResponse {
  username: string;
  role: DatabaseUserRole | string;
  password?: string | null;
}

export interface ConnectionPoolResponse {
  id: string;
  name: string;
  database: string;
  user: string;
  mode: string;
  size: number;
  connection_uri: string;
}

export interface DatabaseBackupResponse {
  id: string;
  size_mb: number;
  status: string;
}

export interface ReadReplicaResponse {
  id: string;
  name: string;
  region: DatacenterRegion | string;
  status: string;
  lag_ms: number;
}

export interface CreateDatabaseClusterRequest {
  name: string;
  engine: DatabaseEngine | string;
  version?: string | null;
  region: DatacenterRegion | string;
  plan_id: string;
  ha_enabled?: boolean;
  idempotency_key?: string | null;
}

export interface DatabaseClusterResponse {
  id: string;
  name: string;
  engine: DatabaseEngine | string;
  version: string;
  region: DatacenterRegion | string;
  status: string;
  nodes_count: number;
  ha_enabled: boolean;
  disk_allocated_gb: number;
  disk_used_gb: number;
  ram_gb: number;
  vcpu: number;
  port: number;
  host: string;
  default_db: string;
  admin_user: string;
  admin_password_reveal: string;
  connection_uri: string;
  wholesale_monthly: string | number;
  retail_monthly: string | number;
  hourly_retail: string | number;
  currency: string;
  plan_id: string;
  client_id: string | null;
  users: DatabaseUserResponse[];
  schemas: string[];
  pools: ConnectionPoolResponse[];
  backups: DatabaseBackupResponse[];
  replicas: ReadReplicaResponse[];
  trusted_sources: string[];
  created_at: string;
  updated_at: string;
}

export interface DatabaseClusterListItemResponse {
  id: string;
  name: string;
  engine: DatabaseEngine | string;
  version: string;
  region: DatacenterRegion | string;
  status: string;
  nodes_count: number;
  ha_enabled: boolean;
  disk_allocated_gb: number;
  ram_gb: number;
  vcpu: number;
  host: string;
  port: number;
  hourly_retail: string | number;
  currency: string;
  created_at: string;
}

export interface ToggleHARequest {
  ha_enabled: boolean;
}

export interface CreateDatabaseUserRequest {
  username: string;
  role?: DatabaseUserRole | string;
}

export interface DatabaseActionResponse {
  id: string;
  status: string;
  message: string;
}

// ==============================================================================
// 5. Storage Schemas (Block Volumes & S3 Spaces)
// ==============================================================================

export interface VolumeResponse {
  id: string;
  name: string;
  region: DatacenterRegion | string;
  size_gb: number;
  iops: number;
  attached_to_instance_id: string | null;
  filesystem: VolumeFilesystem | string;
  status: string;
  wholesale_monthly: string | number;
  retail_monthly: string | number;
  created_at: string;
}

export interface CreateVolumeRequest {
  name: string;
  region: DatacenterRegion;
  size_gb?: number;
  filesystem?: VolumeFilesystem;
  attach_to_instance_id?: string | null;
  idempotency_key?: string | null;
}

export interface AttachVolumeRequest {
  instance_id: string;
}

export interface ResizeVolumeRequest {
  size_gb: number;
}

export interface S3ObjectResponse {
  key: string;
  size_bytes: number;
  content_type: string;
  last_modified: string;
}

export interface BucketResponse {
  id: string;
  name: string;
  region: DatacenterRegion | string;
  acl: BucketACL | string;
  storage_class: StorageClass | string;
  cdn_active: boolean;
  total_size_bytes: number;
  object_count: number;
  wholesale_monthly: string | number;
  retail_monthly: string | number;
  endpoint: string;
  objects: S3ObjectResponse[];
  created_at: string;
}

export interface CreateBucketRequest {
  name: string;
  region: DatacenterRegion;
  acl?: BucketACL;
  storage_class?: StorageClass;
  cdn_active?: boolean;
  idempotency_key?: string | null;
}

export interface PresignBucketRequest {
  key: string;
  method?: "GET" | "PUT" | "DELETE" | string;
  expiry_seconds?: number;
}

export interface PresignedUrlResponse {
  url: string;
  expires_in: number;
}

// ==============================================================================
// 6. Network Schemas (Firewalls, VPCs, Load Balancers, Floating IPs)
// ==============================================================================

export interface FirewallRuleSchema {
  id: string;
  type: RuleDirection | string;
  protocol: FirewallProtocol | string;
  ports: string;
  sources: string[];
  action: FirewallAction | string;
  label: string;
}

export interface CreateFirewallRuleRequest {
  id?: string | null;
  type?: RuleDirection | string;
  protocol?: FirewallProtocol | string;
  ports?: string;
  sources?: string[];
  action?: FirewallAction | string;
  label?: string;
}

export interface CreateFirewallRequest {
  name: string;
  region?: DatacenterRegion | string;
  rules?: CreateFirewallRuleRequest[];
  attached_instance_ids?: string[];
  idempotency_key?: string | null;
}

export interface FirewallResponse {
  id: string;
  name: string;
  region: DatacenterRegion | string;
  rules: FirewallRuleSchema[];
  attached_instance_ids: string[];
  created_at: string;
}

export interface CreateVPCRequest {
  name: string;
  region?: DatacenterRegion | string;
  cidr?: string;
  is_default?: boolean;
  idempotency_key?: string | null;
}

export interface VPCResponse {
  id: string;
  name: string;
  region: DatacenterRegion | string;
  cidr: string;
  is_default: boolean;
  connected_instances_count: number;
  created_at: string;
}

export interface CreateLoadBalancerRequest {
  name: string;
  region?: DatacenterRegion | string;
  protocol?: LBProtocol | string;
  port?: number;
  algorithm?: LBAlgorithm | string;
  target_instance_ids?: string[];
  health_check_path?: string;
  ssl_enabled?: boolean;
  idempotency_key?: string | null;
}

export interface LoadBalancerResponse {
  id: string;
  name: string;
  region: DatacenterRegion | string;
  ip: string | null;
  protocol: string;
  port: number;
  algorithm: string;
  target_instance_ids: string[];
  health_check_path: string;
  ssl_enabled: boolean;
  created_at: string;
}

export interface ReserveFloatingIPRequest {
  region?: DatacenterRegion | string;
  idempotency_key?: string | null;
}

export interface AssignFloatingIPRequest {
  instance_id: string;
  provider_instance_id?: string | null;
}

export interface FloatingIPResponse {
  id: string;
  ip: string;
  region: DatacenterRegion | string;
  assigned_instance_id: string | null;
  created_at: string;
}

// ==============================================================================
// 7. Domains Schemas (Route 53 DNS & Registrations)
// ==============================================================================

export interface DNSRecordResponse {
  id: string;
  type: DNSRecordType | string;
  name: string;
  value: string;
  ttl: number;
  priority: number | null;
}

export interface DomainResponse {
  id: string;
  name: string;
  tld: string;
  status: DomainStatus | string;
  whois_privacy: boolean;
  auto_renew: boolean;
  dnssec: boolean;
  ssl_active: boolean;
  expires_at: string | null;
  wholesale_annual: number;
  retail_annual: number;
  linked_resource_id: string | null;
  records: DNSRecordResponse[];
}

export interface RegistrantContactSchema {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address_line_1?: string;
  city?: string;
  state?: string;
  country_code?: string;
  postal_code?: string;
}

export interface RegisterDomainRequest {
  name: string;
  whois_privacy?: boolean;
  auto_renew?: boolean;
  dnssec?: boolean;
  idempotency_key?: string | null;
  contact?: RegistrantContactSchema | null;
}

export interface AddDNSRecordRequest {
  type: DNSRecordType | string;
  name: string;
  value: string;
  ttl?: number;
  priority?: number | null;
}

export interface LinkDomainRequest {
  resource_id: string;
}

export interface UpdateDomainSettingsRequest {
  auto_renew?: boolean | null;
  whois_privacy?: boolean | null;
  dnssec?: boolean | null;
}

export interface DomainAvailabilityResponse {
  name: string;
  tld: string;
  available: boolean;
  retail_price: number;
  wholesale_price: number;
  currency: string;
}

// ==============================================================================
// 8. Operational Alerts Schemas
// ==============================================================================

export interface AlertResponse {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  created_at: string;
  read: boolean;
  read_at?: string | null;
}

export interface CreateAlertRequest {
  title: string;
  message: string;
  severity?: AlertSeverity;
}

export interface ClearAllAlertsResponse {
  updated_count: number;
  success: boolean;
}

