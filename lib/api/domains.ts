import { apiRequest } from "./http";
import type {
  AddDNSRecordRequest,
  DNSRecordResponse,
  DomainAvailabilityResponse,
  DomainResponse,
  LinkDomainRequest,
  RegisterDomainRequest,
  UpdateDomainSettingsRequest,
} from "./types";

export async function listDomains(limit?: number, offset?: number): Promise<DomainResponse[]> {
  return apiRequest<DomainResponse[]>("/domains", {
    query: { limit, offset },
  });
}

export async function getDomain(id: string): Promise<DomainResponse> {
  return apiRequest<DomainResponse>(`/domains/${id}`);
}

export async function checkDomainAvailability(name: string): Promise<DomainAvailabilityResponse> {
  return apiRequest<DomainAvailabilityResponse>("/domains/check-availability", {
    query: { name },
  });
}

export async function registerDomain(payload: RegisterDomainRequest): Promise<DomainResponse> {
  return apiRequest<DomainResponse>("/domains/register", {
    method: "POST",
    body: payload,
  });
}

export async function addDNSRecord(
  domainId: string,
  payload: AddDNSRecordRequest
): Promise<DNSRecordResponse> {
  return apiRequest<DNSRecordResponse>(`/domains/${domainId}/records`, {
    method: "POST",
    body: payload,
  });
}

export async function deleteDNSRecord(
  domainId: string,
  recordId: string
): Promise<void> {
  return apiRequest<void>(`/domains/${domainId}/records/${recordId}`, {
    method: "DELETE",
  });
}

export async function linkDomain(
  domainId: string,
  payload: LinkDomainRequest
): Promise<DomainResponse> {
  return apiRequest<DomainResponse>(`/domains/${domainId}/link`, {
    method: "POST",
    body: payload,
  });
}

export async function unlinkDomain(domainId: string): Promise<DomainResponse> {
  return apiRequest<DomainResponse>(`/domains/${domainId}/unlink`, {
    method: "POST",
  });
}

export async function updateDomainSettings(
  domainId: string,
  payload: UpdateDomainSettingsRequest
): Promise<DomainResponse> {
  return apiRequest<DomainResponse>(`/domains/${domainId}/settings`, {
    method: "PATCH",
    body: payload,
  });
}

export async function destroyDomain(domainId: string): Promise<void> {
  return apiRequest<void>(`/domains/${domainId}`, {
    method: "DELETE",
  });
}
