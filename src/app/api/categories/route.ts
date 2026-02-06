import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createCategorySchema, categoryTypeQuerySchema } from "@/lib/validators";
import { handleApiError, parseQueryParams } from "@/lib/error-handler";
import { sanitizeInput } from "@/lib/sanitize";
import { jsonResponseWithCache, READ_ONLY_CACHE } from "@/lib/cache";

/**
 * GET /api/categories - List all categories, optionally by type.
 */
export async function GET(request: Request) {
  try {
    const params = parseQueryParams(request.url, categoryTypeQuerySchema);
    const where = params.type ? { type: params.type } : {};
    const categories = await prisma.category.findMany({ where, orderBy: { name: "asc" } });
    
    return jsonResponseWithCache(
      categories,
      READ_ONLY_CACHE.CATEGORIES.maxAge,
      READ_ONLY_CACHE.CATEGORIES.sMaxAge
    );
  } catch (error) {
    return handleApiError(error, "Failed to fetch categories");
  }
}

/**
 * POST /api/categories - Create a category.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createCategorySchema.parse(body);
    
    // Sanitize string inputs
    const sanitizedName = sanitizeInput(validatedData.name);

    const category = await prisma.category.create({
      data: {
        name: sanitizedName,
        type: validatedData.type,
        color: validatedData.color || "#6366f1",
        icon: validatedData.icon || "Tag",
      },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Failed to create category");
  }
}
