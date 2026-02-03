import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/categories - List all categories, optionally by type.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const where = type ? { type: type as "income" | "expense" } : {};
  const categories = await prisma.category.findMany({ where, orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}

/**
 * POST /api/categories - Create a category.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const { name, type, color, icon } = body;
  if (!name || !type || !["income", "expense"].includes(type)) {
    return NextResponse.json({ error: "Invalid name or type" }, { status: 400 });
  }
  const category = await prisma.category.create({
    data: { name, type, color: color || "#6366f1", icon: icon || "Tag" },
  });
  return NextResponse.json(category);
}
