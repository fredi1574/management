import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth } from "date-fns";
import { prisma } from "@/lib/db";

/**
 * GET /api/export/csv?year=&month= - Export incomes and expenses for a month as CSV.
 * GET /api/export/csv?year= - Export full year (all months) as CSV.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  if (!year) return NextResponse.json({ error: "year required" }, { status: 400 });

  const y = Number(year);
  const m = month ? Number(month) : null;

  if (m != null) {
    const start = new Date(y, m - 1, 1);
    const range = { gte: startOfMonth(start), lte: endOfMonth(start) };
    const [incomes, expenses] = await Promise.all([
      prisma.income.findMany({
        where: { date: range },
        include: { category: true },
        orderBy: { date: "asc" },
      }),
      prisma.expense.findMany({
        where: { date: range },
        include: { category: true },
        orderBy: { date: "asc" },
      }),
    ]);
    const rows: string[] = [
      "Type,Date,Category,Amount,Notes,Recurring",
      ...incomes.map(
        (i) =>
          `Income,${i.date.toISOString().slice(0, 10)},${i.category.name},${i.amount},"${(i.notes ?? "").replace(/"/g, '""')}",${i.isRecurring}`
      ),
      ...expenses.map(
        (e) =>
          `Expense,${e.date.toISOString().slice(0, 10)},${e.category.name},${e.amount},"${(e.notes ?? "").replace(/"/g, '""')}",${e.isRecurring}`
      ),
    ];
    const csv = rows.join("\r\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="export-${y}-${String(m).padStart(2, "0")}.csv"`,
      },
    });
  }

  const start = new Date(y, 0, 1);
  const end = new Date(y, 11, 31, 23, 59, 59);
  const range = { gte: start, lte: end };
  const [incomes, expenses] = await Promise.all([
    prisma.income.findMany({
      where: { date: range },
      include: { category: true },
      orderBy: { date: "asc" },
    }),
    prisma.expense.findMany({
      where: { date: range },
      include: { category: true },
      orderBy: { date: "asc" },
    }),
  ]);
  const rows: string[] = [
    "Type,Date,Category,Amount,Notes,Recurring",
    ...incomes.map(
      (i) =>
        `Income,${i.date.toISOString().slice(0, 10)},${i.category.name},${i.amount},"${(i.notes ?? "").replace(/"/g, '""')}",${i.isRecurring}`
    ),
    ...expenses.map(
      (e) =>
        `Expense,${e.date.toISOString().slice(0, 10)},${e.category.name},${e.amount},"${(e.notes ?? "").replace(/"/g, '""')}",${e.isRecurring}`
    ),
  ];
  const csv = rows.join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="export-${y}.csv"`,
    },
  });
}
