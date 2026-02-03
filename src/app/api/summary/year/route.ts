import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth } from "date-fns";
import { prisma } from "@/lib/db";

/**
 * GET /api/summary/year?year= - Monthly breakdown for a year.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  if (!year) return NextResponse.json({ error: "year required" }, { status: 400 });
  const y = Number(year);

  const months: { month: number; totalIncome: number; totalExpense: number; balance: number }[] = [];
  for (let m = 1; m <= 12; m++) {
    const start = new Date(y, m - 1, 1);
    const range = { gte: startOfMonth(start), lte: endOfMonth(start) };
    const [incomeSum, expenseSum] = await Promise.all([
      prisma.income.aggregate({ where: { date: range }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { date: range }, _sum: { amount: true } }),
    ]);
    const totalIncome = incomeSum._sum.amount ?? 0;
    const totalExpense = expenseSum._sum.amount ?? 0;
    months.push({
      month: m,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    });
  }

  const totalIncome = months.reduce((s, row) => s + row.totalIncome, 0);
  const totalExpense = months.reduce((s, row) => s + row.totalExpense, 0);
  return NextResponse.json({
    year: y,
    months,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  });
}
