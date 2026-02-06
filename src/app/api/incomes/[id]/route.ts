import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateIncomeSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/error-handler";
import { sanitizeObject } from "@/lib/sanitize";

/**
 * GET /api/incomes/[id] - Get one income.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const income = await prisma.income.findUnique({ where: { id }, include: { category: true } });
    if (!income) {
      return NextResponse.json({ error: "Income not found" }, { status: 404 });
    }
    return NextResponse.json(income);
  } catch (error) {
    return handleApiError(error, "Failed to fetch income");
  }
}

/**
 * PUT /api/incomes/[id] - Update an income.
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate input (partial schema)
    const validatedData = updateIncomeSchema.parse(body);
    
    // Sanitize string inputs
    const sanitized = sanitizeObject({
      notes: validatedData.notes,
    });

    const data: { amount?: number; categoryId?: string; date?: Date; notes?: string | null; isRecurring?: boolean } = {};
    if (validatedData.amount != null) data.amount = validatedData.amount;
    if (validatedData.categoryId != null) data.categoryId = validatedData.categoryId;
    if (validatedData.date != null) data.date = new Date(validatedData.date);
    if (validatedData.notes !== undefined) data.notes = sanitized.notes || null;
    if (validatedData.isRecurring !== undefined) data.isRecurring = validatedData.isRecurring;

    const income = await prisma.income.update({
      where: { id },
      data,
      include: { category: true },
    });
    return NextResponse.json(income);
  } catch (error) {
    return handleApiError(error, "Failed to update income");
  }
}

/**
 * DELETE /api/incomes/[id] - Delete an income.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.income.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "Failed to delete income");
  }
}
