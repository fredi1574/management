import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth } from "date-fns";
import { prisma } from "@/lib/db";

/**
 * GET /api/stocks/summary - Totals: optional month/year for "invested this month", else all-time.
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

  const purchases = await prisma.stockPurchase.findMany({ where });
  const totalInvested = purchases.reduce((s, p) => s + p.quantity * p.pricePerUnit + (p.fee ?? 0), 0);
  const totalCurrentValue = purchases.reduce((s, p) => {
    if (p.currentValue != null) return s + p.currentValue;
    return s + p.quantity * p.pricePerUnit;
  }, 0);
  const totalCostWithFees = purchases.reduce((s, p) => s + p.quantity * p.pricePerUnit + (p.fee ?? 0), 0);

  return NextResponse.json({
    totalInvested,
    totalCostWithFees,
    totalCurrentValue,
    profitLoss: totalCurrentValue - totalCostWithFees,
    count: purchases.length,
  });
}
