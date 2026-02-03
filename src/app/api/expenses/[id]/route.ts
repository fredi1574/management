import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/expenses/[id] - Get one expense.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const expense = await prisma.expense.findUnique({ where: { id }, include: { category: true } });
  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(expense);
}

/**
 * PUT /api/expenses/[id] - Update an expense.
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { amount, categoryId, date, notes, isRecurring } = body;
  const data: { amount?: number; categoryId?: string; date?: Date; notes?: string | null; isRecurring?: boolean } = {};
  if (amount != null) data.amount = Number(amount);
  if (categoryId != null) data.categoryId = categoryId;
  if (date != null) data.date = new Date(date);
  if (notes !== undefined) data.notes = notes ?? null;
  if (isRecurring !== undefined) data.isRecurring = Boolean(isRecurring);

  const expense = await prisma.expense.update({
    where: { id },
    data,
    include: { category: true },
  });
  return NextResponse.json(expense);
}

/**
 * DELETE /api/expenses/[id] - Delete an expense.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.expense.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
