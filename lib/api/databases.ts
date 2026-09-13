import { apiRequest } from "./http";
import type {
  CreateDatabaseClusterRequest,
  CreateDatabaseUserRequest,
  DatabaseActionResponse,
  DatabaseBackupResponse,
  DatabaseClusterListItemResponse,
  DatabaseClusterResponse,
  DatabasePlanResponse,
  DatabaseUserResponse,
  DatacenterRegion,
  ToggleHARequest,
} from "./types";

export async function listDatabasePlans(): Promise<DatabasePlanResponse[]> {
  return apiRequest<DatabasePlanResponse[]>("/databases/plans");
}

export async function listDatabaseClusters(
  region?: DatacenterRegion,
  limit?: number,
  offset?: number
): Promise<DatabaseClusterListItemResponse[]> {
  return apiRequest<DatabaseClusterListItemResponse[]>("/databases/clusters", {
    query: { region, limit, offset },
  });
}

export async function getDatabaseCluster(id: string): Promise<DatabaseClusterResponse> {
  return apiRequest<DatabaseClusterResponse>(`/databases/clusters/${id}`);
}

export async function createDatabaseCluster(
  payload: CreateDatabaseClusterRequest
): Promise<DatabaseClusterResponse> {
  return apiRequest<DatabaseClusterResponse>("/databases/clusters", {
    method: "POST",
    body: payload,
  });
}

export async function toggleDatabaseHA(
  id: string,
  haEnabled: boolean
): Promise<DatabaseClusterResponse> {
  const payload: ToggleHARequest = { ha_enabled: haEnabled };
  return apiRequest<DatabaseClusterResponse>(`/databases/clusters/${id}/ha`, {
    method: "POST",
    body: payload,
  });
}

export async function createDatabaseBackup(
  id: string,
  label?: string
): Promise<DatabaseBackupResponse> {
  return apiRequest<DatabaseBackupResponse>(`/databases/clusters/${id}/backups`, {
    method: "POST",
    body: label ? { label } : {},
  });
}

export async function createDatabaseUser(
  id: string,
  payload: CreateDatabaseUserRequest
): Promise<DatabaseUserResponse> {
  return apiRequest<DatabaseUserResponse>(`/databases/clusters/${id}/users`, {
    method: "POST",
    body: payload,
  });
}

export async function destroyDatabaseCluster(id: string): Promise<DatabaseActionResponse | void> {
  return apiRequest<DatabaseActionResponse | void>(`/databases/clusters/${id}`, {
    method: "DELETE",
  });
}
