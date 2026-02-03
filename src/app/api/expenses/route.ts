import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth } from "date-fns";
import { prisma } from "@/lib/db";

/**
 * GET /api/expenses - List expenses, optionally filtered by month/year.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const search = searchParams.get("search")?.trim();

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
  return NextResponse.json(expenses);
}

/**
 * POST /api/expenses - Create an expense entry.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const { amount, categoryId, date, notes, isRecurring } = body;
  if (amount == null || !categoryId || !date) {
    return NextResponse.json({ error: "Missing amount, categoryId, or date" }, { status: 400 });
  }
  const expense = await prisma.expense.create({
    data: {
      amount: Number(amount),
      categoryId,
      date: new Date(date),
      notes: notes ?? null,
      isRecurring: Boolean(isRecurring),
    },
    include: { category: true },
  });
  return NextResponse.json(expense);
}
