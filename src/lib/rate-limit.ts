import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limit tracking
// In production, use Redis or similar for distributed systems
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Simple rate limiter using sliding window approach
 * In production, consider using Upstash Redis for distributed rate limiting
 */
export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private getKey(identifier: string): string {
    return `ratelimit:${identifier}`;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }

  isLimited(identifier: string): boolean {
    const key = this.getKey(identifier);
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    if (!entry || entry.resetTime < now) {
      // Create new entry
      entry = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      rateLimitStore.set(key, entry);
      return false;
    }

    entry.count++;
    return entry.count > this.maxRequests;
  }

  getRemainingRequests(identifier: string): number {
    const key = this.getKey(identifier);
    const entry = rateLimitStore.get(key);

    if (!entry || entry.resetTime < Date.now()) {
      return this.maxRequests;
    }

    return Math.max(0, this.maxRequests - entry.count);
  }

  getResetTime(identifier: string): number {
    const key = this.getKey(identifier);
    const entry = rateLimitStore.get(key);

    if (!entry) {
      return Date.now() + this.windowMs;
    }

    return entry.resetTime;
  }
}

/**
 * Create rate limit response
 */
export function rateLimitResponse(resetTime: number): NextResponse {
  const response = NextResponse.json(
    {
      error: "Too many requests",
      message: "You have exceeded the rate limit. Please try again later.",
    },
    { status: 429 }
  );

  response.headers.set("Retry-After", Math.ceil((resetTime - Date.now()) / 1000).toString());
  response.headers.set("X-RateLimit-Limit", "100");
  response.headers.set("X-RateLimit-Remaining", "0");
  response.headers.set("X-RateLimit-Reset", resetTime.toString());

  return response;
}

/**
 * Middleware helper to check rate limit
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from headers (works with proxies like Cloudflare)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    request.ip ||
    "unknown";

  return ip.trim();
}

/**
 * Default rate limiters for different endpoints
 */
export const rateLimiters = {
  // Auth endpoints - stricter limits
  auth: new RateLimiter(60000, 10),
  
  // Write operations - moderate limits
  write: new RateLimiter(60000, 50),
  
  // Read operations - generous limits
  read: new RateLimiter(60000, 200),
  
  // API endpoints - moderate limits
  api: new RateLimiter(60000, 100),
};
