import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiError {
  error: string;
  status?: number;
  details?: Record<string, string[]>;
}

/**
 * Format Zod validation errors into a readable structure
 */
export function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  error.errors.forEach((err) => {
    const path = err.path.join(".");
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(err.message);
  });
  return formatted;
}

/**
 * Handle API errors and return consistent error response
 */
export function handleApiError(error: unknown, defaultMessage = "Internal server error") {
  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation error",
        details: formatZodErrors(error),
      },
      { status: 400 }
    );
  }

  // Prisma errors
  if (error instanceof Error) {
    // Handle Prisma known errors
    if (error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Record already exists" },
        { status: 409 }
      );
    }
    if (error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    // Log the error in development
    if (process.env.NODE_ENV === "development") {
      console.error("[API Error]", error.message);
    }

    // Return generic error message in production
    return NextResponse.json(
      { error: defaultMessage },
      { status: 500 }
    );
  }

  // Unknown error type
  if (process.env.NODE_ENV === "development") {
    console.error("[API Error]", error);
  }

  return NextResponse.json(
    { error: defaultMessage },
    { status: 500 }
  );
}

/**
 * Parse query parameters with validation
 */
export function parseQueryParams<T>(
  url: string,
  schema: {
    parse(data: unknown): T;
  }
): T {
  const { searchParams } = new URL(url);
  const params = Object.fromEntries(searchParams.entries());
  return schema.parse(params);
}
