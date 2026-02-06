import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth } from "date-fns";
import { prisma } from "@/lib/db";
import { createExpenseSchema, monthYearQuerySchema } from "@/lib/validators";
import { handleApiError, parseQueryParams } from "@/lib/error-handler";
import { sanitizeObject } from "@/lib/sanitize";
import { jsonResponseWithCache, READ_ONLY_CACHE } from "@/lib/cache";

/**
 * GET /api/expenses - List expenses, optionally filtered by month/year.
 */
export async function GET(request: Request) {
  try {
    const params = parseQueryParams(request.url, monthYearQuerySchema);
    const { month, year, search } = params;

    const where: { date?: { gte?: Date; lte?: Date }; notes?: { contains: string } } = {};
    if (year && month) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      where.date = { gte: startOfMonth(start), lte: endOfMonth(start) };
    }
    if (search) where.notes = { contains: search };

    const expenses = await prisma.expense.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
    });

    return jsonResponseWithCache(
      expenses,
      READ_ONLY_CACHE.TRANSACTIONS.maxAge,
      READ_ONLY_CACHE.TRANSACTIONS.sMaxAge
    );
  } catch (error) {
    return handleApiError(error, "Failed to fetch expenses");
  }
}

/**
 * POST /api/expenses - Create an expense entry.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createExpenseSchema.parse(body);
    
    // Sanitize string inputs
    const sanitized = sanitizeObject({
      notes: validatedData.notes,
    });

    const expense = await prisma.expense.create({
      data: {
        amount: validatedData.amount,
        categoryId: validatedData.categoryId,
        date: new Date(validatedData.date),
        notes: sanitized.notes || null,
        isRecurring: validatedData.isRecurring,
      },
      include: { category: true },
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Failed to create expense");
  }
}
