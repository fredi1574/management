import { NextRequest, NextResponse } from "next/server";
import { getClientIdentifier, rateLimiters, rateLimitResponse } from "./rate-limit";

/**
 * Rate limit middleware for API routes
 * Use this to wrap handler functions that need rate limiting
 */
export function withRateLimit(
  handler: (request: Request, context?: any) => Promise<NextResponse>,
  limiter = rateLimiters.api
) {
  return async (request: Request, context?: any) => {
    const clientId = getClientIdentifier(request as NextRequest);

    if (limiter.isLimited(clientId)) {
      return rateLimitResponse(limiter.getResetTime(clientId));
    }

    return handler(request, context);
  };
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Enable XSS filtering
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

/**
 * Validate request method
 */
export function validateMethod(
  request: Request,
  allowedMethods: string[]
): NextResponse | null {
  if (!allowedMethods.includes(request.method)) {
    return NextResponse.json(
      { error: `Method ${request.method} not allowed` },
      { status: 405, headers: { Allow: allowedMethods.join(", ") } }
    );
  }
  return null;
}

/**
 * Wrap handler with multiple middleware
 */
export function withMiddleware(
  handler: (request: Request, context?: any) => Promise<NextResponse>,
  options: {
    methods?: string[];
    rateLimit?: boolean;
    limiter?: any;
  } = {}
) {
  return async (request: Request, context?: any) => {
    // Validate method
    if (options.methods) {
      const methodError = validateMethod(request, options.methods);
      if (methodError) return methodError;
    }

    // Apply rate limiting
    if (options.rateLimit !== false) {
      const limiter = options.limiter || rateLimiters.api;
      const clientId = getClientIdentifier(request as NextRequest);

      if (limiter.isLimited(clientId)) {
        return rateLimitResponse(limiter.getResetTime(clientId));
      }
    }

    // Call handler
    let response = await handler(request, context);

    // Add security headers
    response = addSecurityHeaders(response);

    return response;
  };
}
