import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/stocks/[id] - Get one stock purchase.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stock = await prisma.stockPurchase.findUnique({ where: { id } });
  if (!stock) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(stock);
}

/**
 * PUT /api/stocks/[id] - Update a stock purchase.
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const data: {
    ticker?: string;
    quantity?: number;
    pricePerUnit?: number;
    date?: Date;
    broker?: string | null;
    fee?: number | null;
    notes?: string | null;
    currentValue?: number | null;
    currency?: string;
    exchangeRate?: number | null;
  } = {};
  if (body.ticker != null) data.ticker = String(body.ticker).toUpperCase();
  if (body.quantity != null) data.quantity = Number(body.quantity);
  if (body.pricePerUnit != null) data.pricePerUnit = Number(body.pricePerUnit);
  if (body.date != null) data.date = new Date(body.date);
  if (body.broker !== undefined) data.broker = body.broker ?? null;
  if (body.fee !== undefined) data.fee = body.fee != null ? Number(body.fee) : null;
  if (body.notes !== undefined) data.notes = body.notes ?? null;
  if (body.currentValue !== undefined) data.currentValue = body.currentValue != null ? Number(body.currentValue) : null;
  if (body.currency != null) data.currency = String(body.currency);
  if (body.exchangeRate !== undefined) data.exchangeRate = body.exchangeRate != null ? Number(body.exchangeRate) : null;

  const stock = await prisma.stockPurchase.update({ where: { id }, data });
  return NextResponse.json(stock);
}

/**
 * DELETE /api/stocks/[id] - Delete a stock purchase.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.stockPurchase.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
