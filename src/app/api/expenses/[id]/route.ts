import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateExpenseSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/error-handler";
import { sanitizeObject } from "@/lib/sanitize";

/**
 * GET /api/expenses/[id] - Get one expense.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const expense = await prisma.expense.findUnique({ where: { id }, include: { category: true } });
    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    return NextResponse.json(expense);
  } catch (error) {
    return handleApiError(error, "Failed to fetch expense");
  }
}

/**
 * PUT /api/expenses/[id] - Update an expense.
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate input (partial schema)
    const validatedData = updateExpenseSchema.parse(body);
    
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

    const expense = await prisma.expense.update({
      where: { id },
      data,
      include: { category: true },
    });
    return NextResponse.json(expense);
  } catch (error) {
    return handleApiError(error, "Failed to update expense");
  }
}

/**
 * DELETE /api/expenses/[id] - Delete an expense.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error, "Failed to delete expense");
  }
}
