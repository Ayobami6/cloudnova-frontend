import { API_BASE_URL } from "./config";
import { ApiError, networkError, type ProblemDetails } from "./errors";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./token-storage";
import type { RefreshTokenRequest, TokenPairResponse } from "./types";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Attach the Authorization header and retry once on 401. Default true. */
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
}

/** Dispatched on window when a refresh fails and the session is unrecoverable. */
export const SESSION_EXPIRED_EVENT = "cloudnova:session-expired";

// A single in-flight refresh is shared by every concurrent 401 so a burst
// of parallel requests doesn't each try to refresh (and invalidate) the
// token pair independently.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new ApiError({
        type: "about:blank",
        title: "Not Authenticated",
        status: 401,
        detail: "No session to refresh.",
        code: "NO_REFRESH_TOKEN",
      });
    }

    const payload: RefreshTokenRequest = { refresh_token: refreshToken };
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      clearTokens();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }
      throw await toApiError(response);
    }

    const pair = (await response.json()) as TokenPairResponse;
    setTokens({ accessToken: pair.access_token, refreshToken: pair.refresh_token });
    return pair.access_token;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as ProblemDetails;
    return new ApiError(body);
  } catch {
    return new ApiError({
      type: "about:blank",
      title: response.statusText || "Request Failed",
      status: response.status,
      detail: `Request failed with status ${response.status}.`,
      code: "UNKNOWN_ERROR",
    });
  }
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Core request function for every CloudNova API call.
 *
 * On a 401 from an authenticated request, attempts exactly one silent
 * token refresh and retries the original request once before giving up -
 * this covers the common case of an access token expiring mid-session
 * without forcing a full re-login.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, query } = options;
  const url = buildUrl(path, query);

  const doFetch = async (): Promise<Response> => {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (auth) {
      const token = getAccessToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      return await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (cause) {
      throw networkError(cause);
    }
  };

  let response = await doFetch();

  if (response.status === 401 && auth && getRefreshToken()) {
    try {
      await refreshAccessToken();
      response = await doFetch();
    } catch (refreshError) {
      if (refreshError instanceof ApiError) throw refreshError;
      throw networkError(refreshError);
    }
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
