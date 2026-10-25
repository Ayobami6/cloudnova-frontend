/**
 * Central configuration for the TibiCloud API client.
 *
 * Defaults to `/api/v1` so client-side browser requests go through
 * the Next.js / Vercel proxy, preventing Mixed Content and CORS issues.
 */
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "/api/v1";

