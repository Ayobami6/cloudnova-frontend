import { apiRequest } from "./http";
import type {
  AssignFloatingIPRequest,
  CreateFirewallRequest,
  CreateFirewallRuleRequest,
  CreateLoadBalancerRequest,
  CreateVPCRequest,
  DatacenterRegion,
  FirewallResponse,
  FirewallRuleSchema,
  FloatingIPResponse,
  LoadBalancerResponse,
  ReserveFloatingIPRequest,
  VPCResponse,
} from "./types";

// --- Firewalls ---

export async function listFirewalls(
  region?: DatacenterRegion,
  limit?: number,
  offset?: number
): Promise<FirewallResponse[]> {
  return apiRequest<FirewallResponse[]>("/network/firewalls", {
    query: { region, limit, offset },
  });
}

export async function getFirewall(id: string): Promise<FirewallResponse> {
  return apiRequest<FirewallResponse>(`/network/firewalls/${id}`);
}

export async function createFirewall(payload: CreateFirewallRequest): Promise<FirewallResponse> {
  return apiRequest<FirewallResponse>("/network/firewalls", {
    method: "POST",
    body: payload,
  });
}

export async function addFirewallRule(
  firewallId: string,
  payload: CreateFirewallRuleRequest
): Promise<FirewallRuleSchema> {
  return apiRequest<FirewallRuleSchema>(`/network/firewalls/${firewallId}/rules`, {
    method: "POST",
    body: payload,
  });
}

export async function deleteFirewallRule(
  firewallId: string,
  ruleId: string
): Promise<void> {
  return apiRequest<void>(`/network/firewalls/${firewallId}/rules/${ruleId}`, {
    method: "DELETE",
  });
}

export async function destroyFirewall(id: string): Promise<void> {
  return apiRequest<void>(`/network/firewalls/${id}`, {
    method: "DELETE",
  });
}

// --- VPCs ---

export async function listVPCs(): Promise<VPCResponse[]> {
  return apiRequest<VPCResponse[]>("/network/vpcs");
}

export async function getVPC(id: string): Promise<VPCResponse> {
  return apiRequest<VPCResponse>(`/network/vpcs/${id}`);
}

export async function createVPC(payload: CreateVPCRequest): Promise<VPCResponse> {
  return apiRequest<VPCResponse>("/network/vpcs", {
    method: "POST",
    body: payload,
  });
}

export async function destroyVPC(id: string): Promise<void> {
  return apiRequest<void>(`/network/vpcs/${id}`, {
    method: "DELETE",
  });
}

// --- Load Balancers ---

export async function listLoadBalancers(): Promise<LoadBalancerResponse[]> {
  return apiRequest<LoadBalancerResponse[]>("/network/load-balancers");
}

export async function getLoadBalancer(id: string): Promise<LoadBalancerResponse> {
  return apiRequest<LoadBalancerResponse>(`/network/load-balancers/${id}`);
}

export async function createLoadBalancer(
  payload: CreateLoadBalancerRequest
): Promise<LoadBalancerResponse> {
  return apiRequest<LoadBalancerResponse>("/network/load-balancers", {
    method: "POST",
    body: payload,
  });
}

export async function destroyLoadBalancer(id: string): Promise<void> {
  return apiRequest<void>(`/network/load-balancers/${id}`, {
    method: "DELETE",
  });
}

// --- Floating IPs ---

export async function listFloatingIPs(region?: DatacenterRegion): Promise<FloatingIPResponse[]> {
  return apiRequest<FloatingIPResponse[]>("/network/floating-ips", {
    query: { region },
  });
}

export async function getFloatingIP(id: string): Promise<FloatingIPResponse> {
  return apiRequest<FloatingIPResponse>(`/network/floating-ips/${id}`);
}

export async function reserveFloatingIP(
  payload: ReserveFloatingIPRequest
): Promise<FloatingIPResponse> {
  return apiRequest<FloatingIPResponse>("/network/floating-ips", {
    method: "POST",
    body: payload,
  });
}

export async function assignFloatingIP(
  id: string,
  payload: AssignFloatingIPRequest
): Promise<FloatingIPResponse> {
  return apiRequest<FloatingIPResponse>(`/network/floating-ips/${id}/assign`, {
    method: "POST",
    body: payload,
  });
}

export async function unassignFloatingIP(id: string): Promise<FloatingIPResponse> {
  return apiRequest<FloatingIPResponse>(`/network/floating-ips/${id}/unassign`, {
    method: "POST",
  });
}

export async function releaseFloatingIP(id: string): Promise<void> {
  return apiRequest<void>(`/network/floating-ips/${id}`, {
    method: "DELETE",
  });
}
