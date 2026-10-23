import { apiRequest } from "./http";
import type {
  ComputePlanResponse,
  CreateInstanceRequest,
  CreateSSHKeyRequest,
  DatacenterRegion,
  InstanceActionResponse,
  InstanceListItemResponse,
  InstanceResponse,
  PowerActionRequest,
  SSHKeyResponse,
  TerminalSessionResponse,
} from "./types";

export async function listComputePlans(): Promise<ComputePlanResponse[]> {
  return apiRequest<ComputePlanResponse[]>("/compute/plans");
}

export async function listInstances(region?: DatacenterRegion): Promise<InstanceListItemResponse[]> {
  return apiRequest<InstanceListItemResponse[]>("/compute/instances", {
    query: { region },
  });
}

export async function getInstance(id: string): Promise<InstanceResponse> {
  return apiRequest<InstanceResponse>(`/compute/instances/${id}`);
}

export async function createInstance(payload: CreateInstanceRequest): Promise<InstanceResponse> {
  return apiRequest<InstanceResponse>("/compute/instances", {
    method: "POST",
    body: payload,
  });
}

export async function powerAction(
  id: string,
  action: PowerActionRequest["action"]
): Promise<InstanceActionResponse> {
  return apiRequest<InstanceActionResponse>(`/compute/instances/${id}/power`, {
    method: "POST",
    body: { action },
  });
}

export async function destroyInstance(id: string): Promise<void> {
  return apiRequest<void>(`/compute/instances/${id}`, {
    method: "DELETE",
  });
}

export async function createTerminalSession(id: string): Promise<TerminalSessionResponse> {
  return apiRequest<TerminalSessionResponse>(`/compute/instances/${id}/terminal`, {
    method: "POST",
  });
}

export async function listSSHKeys(): Promise<SSHKeyResponse[]> {
  return apiRequest<SSHKeyResponse[]>("/compute/ssh-keys");
}

export async function createSSHKey(payload: CreateSSHKeyRequest): Promise<SSHKeyResponse> {
  return apiRequest<SSHKeyResponse>("/compute/ssh-keys", {
    method: "POST",
    body: payload,
  });
}

export async function deleteSSHKey(id: string): Promise<void> {
  return apiRequest<void>(`/compute/ssh-keys/${id}`, {
    method: "DELETE",
  });
}
