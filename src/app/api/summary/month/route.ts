import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth } from "date-fns";
import { prisma } from "@/lib/db";

/**
 * GET /api/summary/month?year=&month= - Aggregates for a given month.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  if (!year || !month) {
    return NextResponse.json({ error: "year and month required" }, { status: 400 });
  }
  const start = new Date(Number(year), Number(month) - 1, 1);
  const range = { gte: startOfMonth(start), lte: endOfMonth(start) };

  const [incomeSum, expenseSum] = await Promise.all([
    prisma.income.aggregate({ where: { date: range }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { date: range }, _sum: { amount: true } }),
  ]);

  const totalIncome = incomeSum._sum.amount ?? 0;
  const totalExpense = expenseSum._sum.amount ?? 0;
  return NextResponse.json({
    year: Number(year),
    month: Number(month),
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  });
}
