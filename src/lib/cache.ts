import { NextResponse } from "next/server";

/**
 * Cache duration presets
 */
export const CACHE_DURATIONS = {
  SECOND: 1,
  MINUTE: 60,
  FIVE_MINUTES: 300,
  TEN_MINUTES: 600,
  HOUR: 3600,
  DAY: 86400,
};

/**
 * Create cache control headers for API responses
 * @param maxAge - Max age in seconds for browser cache
 * @param sMaxAge - Max age in seconds for CDN/server cache
 * @param staleWhileRevalidate - Serve stale content while revalidating (seconds)
 */
export function getCacheHeaders(
  maxAge: number = CACHE_DURATIONS.MINUTE,
  sMaxAge: number = CACHE_DURATIONS.FIVE_MINUTES,
  staleWhileRevalidate: number = CACHE_DURATIONS.DAY
) {
  return {
    "Cache-Control": `public, s-maxage=${sMaxAge}, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    "CDN-Cache-Control": `public, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
  };
}

/**
 * Create a JSON response with caching headers
 */
export function jsonResponseWithCache(
  data: unknown,
  maxAge: number = CACHE_DURATIONS.MINUTE,
  sMaxAge: number = CACHE_DURATIONS.FIVE_MINUTES,
  status: number = 200
) {
  const response = NextResponse.json(data, { status });

  // Add cache headers
  const cacheHeaders = getCacheHeaders(maxAge, sMaxAge);
  Object.entries(cacheHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Cache control for GET requests (read-only data)
 */
export const READ_ONLY_CACHE = {
  // Expenses/Income/Categories - revalidate frequently for freshness
  TRANSACTIONS: {
    maxAge: CACHE_DURATIONS.MINUTE,
    sMaxAge: CACHE_DURATIONS.FIVE_MINUTES,
    staleWhileRevalidate: CACHE_DURATIONS.HOUR,
  },
  // Monthly summaries - can be cached longer
  SUMMARY: {
    maxAge: CACHE_DURATIONS.FIVE_MINUTES,
    sMaxAge: CACHE_DURATIONS.TEN_MINUTES,
    staleWhileRevalidate: CACHE_DURATIONS.DAY,
  },
  // Stock data - cache less frequently (prices change)
  STOCKS: {
    maxAge: CACHE_DURATIONS.MINUTE,
    sMaxAge: CACHE_DURATIONS.FIVE_MINUTES,
    staleWhileRevalidate: CACHE_DURATIONS.HOUR,
  },
  // Categories - cache longer (rarely change)
  CATEGORIES: {
    maxAge: CACHE_DURATIONS.HOUR,
    sMaxAge: CACHE_DURATIONS.HOUR,
    staleWhileRevalidate: CACHE_DURATIONS.DAY,
  },
};

/**
 * No-cache control for write/delete operations
 */
export function getNoCacheHeaders() {
  return {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };
}
