/**
 * Central configuration for the CloudNova API client.
 *
 * NEXT_PUBLIC_API_BASE_URL must include the `/api/v1` prefix (the Django
 * Ninja root router is mounted there - see cloudnova-api's config/urls.py).
 */
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:8000/api/v1";
