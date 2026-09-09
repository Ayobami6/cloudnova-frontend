/**
 * RFC 7807 Problem Details envelope, as returned by cloudnova-api's
 * config/api.py exception handlers.
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string | null;
  code: string;
  invalid_params?: { name: string; reason: string }[];
}

/**
 * Thrown by the API client for any non-2xx response. Carries the parsed
 * RFC 7807 body when the server returned one (every error response from
 * cloudnova-api does), falling back to a generic envelope for network
 * failures or non-JSON responses (e.g. a proxy timeout page).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly detail: string;
  readonly invalidParams: { name: string; reason: string }[];

  constructor(problem: ProblemDetails) {
    super(problem.detail || problem.title);
    this.name = "ApiError";
    this.status = problem.status;
    this.code = problem.code;
    this.detail = problem.detail || problem.title;
    this.invalidParams = problem.invalid_params || [];
  }

  /** True when this error represents an expired/invalid session. */
  get isAuthError(): boolean {
    return this.status === 401;
  }

  /** First field-level validation message, if this was a 422. */
  get firstFieldError(): string | undefined {
    return this.invalidParams[0]?.reason;
  }
}

export function networkError(cause: unknown): ApiError {
  return new ApiError({
    type: "about:blank",
    title: "Network Error",
    status: 0,
    detail:
      cause instanceof Error
        ? `Could not reach the CloudNova API: ${cause.message}`
        : "Could not reach the CloudNova API.",
    code: "NETWORK_ERROR",
  });
}
