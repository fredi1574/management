import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth } from "date-fns";
import { prisma } from "@/lib/db";
import { createStockSchema, monthYearQuerySchema } from "@/lib/validators";
import { handleApiError, parseQueryParams } from "@/lib/error-handler";
import { sanitizeObject } from "@/lib/sanitize";

/**
 * GET /api/stocks - List stock purchases, optionally filtered by month/year.
 */
export async function GET(request: Request) {
  try {
    const params = parseQueryParams(request.url, monthYearQuerySchema);
    const { month, year } = params;

    const where: { date?: { gte?: Date; lte?: Date } } = {};
    if (year && month) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      where.date = { gte: startOfMonth(start), lte: endOfMonth(start) };
    }

    const stocks = await prisma.stockPurchase.findMany({
      where,
      orderBy: { date: "desc" },
    });
    return NextResponse.json(stocks);
  } catch (error) {
    return handleApiError(error, "Failed to fetch stocks");
  }
}

/**
 * POST /api/stocks - Create a stock purchase.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createStockSchema.parse(body);
    
    // Sanitize string inputs
    const sanitized = sanitizeObject({
      notes: validatedData.notes,
      broker: validatedData.broker,
    });

    const stock = await prisma.stockPurchase.create({
      data: {
        ticker: validatedData.ticker.toUpperCase(),
        quantity: validatedData.quantity,
        pricePerUnit: validatedData.pricePerUnit,
        date: new Date(validatedData.date),
        broker: sanitized.broker || null,
        fee: validatedData.fee || null,
        notes: sanitized.notes || null,
        currentValue: validatedData.currentValue || null,
        currency: validatedData.currency || "USD",
        exchangeRate: validatedData.exchangeRate || null,
      },
    });
    return NextResponse.json(stock, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Failed to create stock");
  }
}
