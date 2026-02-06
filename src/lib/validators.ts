import { z } from "zod";

// Expense validation
export const createExpenseSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  date: z.string().datetime().or(z.date()),
  notes: z.string().optional(),
  isRecurring: z.boolean().optional().default(false),
});

export const updateExpenseSchema = createExpenseSchema.partial();

// Income validation
export const createIncomeSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  date: z.string().datetime().or(z.date()),
  notes: z.string().optional(),
  isRecurring: z.boolean().optional().default(false),
});

export const updateIncomeSchema = createIncomeSchema.partial();

// Category validation
export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50),
  type: z.enum(["income", "expense"]),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").optional(),
  icon: z.string().optional(),
});

// Stock validation
export const createStockSchema = z.object({
  ticker: z.string().min(1).toUpperCase(),
  quantity: z.number().positive("Quantity must be positive"),
  pricePerUnit: z.number().positive("Price must be positive"),
  date: z.string().datetime().or(z.date()),
  broker: z.string().optional(),
  fee: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  currentValue: z.number().optional(),
  currency: z.string().optional().default("USD"),
  exchangeRate: z.number().optional(),
});

export const updateStockSchema = createStockSchema.partial();

// Query parameter validation
export const monthYearQuerySchema = z.object({
  month: z.string().regex(/^\d{1,2}$/).optional(),
  year: z.string().regex(/^\d{4}$/).optional(),
  search: z.string().optional(),
});

export const categoryTypeQuerySchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
});

// Type exports
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateStockInput = z.infer<typeof createStockSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
