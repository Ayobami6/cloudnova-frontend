/**
 * Client-side JWT storage for the "client-side tokens" auth strategy:
 * the browser calls the Django API directly and keeps the access/refresh
 * token pair itself (Authorization header), rather than a server-side
 * BFF holding an httpOnly cookie.
 *
 * Tokens live in an in-memory cache (fast, synchronous reads for every
 * request) mirrored into localStorage (so a page refresh doesn't force a
 * fresh login). This trades some XSS exposure for architectural
 * simplicity - an accepted tradeoff for this iteration.
 */

const ACCESS_TOKEN_KEY = "cloudnova_access_token";
const REFRESH_TOKEN_KEY = "cloudnova_refresh_token";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

let cache: TokenPair | null = null;
let hydrated = false;

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (typeof window === "undefined") return;
  try {
    const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
    if (accessToken && refreshToken) {
      cache = { accessToken, refreshToken };
    }
  } catch {
    // localStorage unavailable (private browsing, disabled storage) - fall
    // back to in-memory-only tokens for the lifetime of this page load.
  }
}

export function getTokens(): TokenPair | null {
  hydrate();
  return cache;
}

export function getAccessToken(): string | null {
  return getTokens()?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return getTokens()?.refreshToken ?? null;
}

export function setTokens(tokens: TokenPair): void {
  cache = tokens;
  hydrated = true;
  try {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  } catch {
    // Best-effort persistence only; the in-memory cache still works for
    // the rest of this page load.
  }
}

export function clearTokens(): void {
  cache = null;
  hydrated = true;
  try {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ignore
  }
}
