import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/incomes/[id] - Get one income.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const income = await prisma.income.findUnique({ where: { id }, include: { category: true } });
  if (!income) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(income);
}

/**
 * PUT /api/incomes/[id] - Update an income.
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

  const income = await prisma.income.update({
    where: { id },
    data,
    include: { category: true },
  });
  return NextResponse.json(income);
}

/**
 * DELETE /api/incomes/[id] - Delete an income.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.income.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
