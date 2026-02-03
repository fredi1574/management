import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth } from "date-fns";
import { prisma } from "@/lib/db";

/**
 * GET /api/stocks - List stock purchases, optionally filtered by month/year.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

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
}

/**
 * POST /api/stocks - Create a stock purchase.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const { ticker, quantity, pricePerUnit, date, broker, fee, notes, currentValue, currency, exchangeRate } = body;
  if (!ticker || quantity == null || pricePerUnit == null || !date) {
    return NextResponse.json(
      { error: "Missing ticker, quantity, pricePerUnit, or date" },
      { status: 400 }
    );
  }
  const stock = await prisma.stockPurchase.create({
    data: {
      ticker: String(ticker).toUpperCase(),
      quantity: Number(quantity),
      pricePerUnit: Number(pricePerUnit),
      date: new Date(date),
      broker: broker ?? null,
      fee: fee != null ? Number(fee) : null,
      notes: notes ?? null,
      currentValue: currentValue != null ? Number(currentValue) : null,
      currency: currency ?? "USD",
      exchangeRate: exchangeRate != null ? Number(exchangeRate) : null,
    },
  });
  return NextResponse.json(stock);
}
