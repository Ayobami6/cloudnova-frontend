import { apiRequest } from "./http";
import type {
  AlertResponse,
  ClearAllAlertsResponse,
  CreateAlertRequest,
} from "./types";

export async function listAlerts(
  unreadOnly?: boolean,
  limit?: number,
  offset?: number
): Promise<AlertResponse[]> {
  return apiRequest<AlertResponse[]>("/alerts", {
    query: {
      unread_only: unreadOnly,
      limit,
      offset,
    },
  });
}

export async function markAlertRead(id: string): Promise<AlertResponse> {
  return apiRequest<AlertResponse>(`/alerts/${id}/read`, {
    method: "POST",
  });
}

export async function clearAllAlerts(): Promise<ClearAllAlertsResponse> {
  return apiRequest<ClearAllAlertsResponse>("/alerts/clear-all", {
    method: "POST",
  });
}

export async function createAlert(payload: CreateAlertRequest): Promise<AlertResponse> {
  return apiRequest<AlertResponse>("/alerts", {
    method: "POST",
    body: payload,
  });
}
