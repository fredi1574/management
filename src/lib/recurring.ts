import { prisma } from "./db";
import { addMonths, addYears, isBefore, startOfDay } from "date-fns";

export type RecurrencePattern = "monthly" | "yearly" | "weekly" | "daily";

/**
 * Check if a recurring transaction should be created today
 */
export function shouldCreateRecurringTransaction(
  lastCreatedDate: Date,
  pattern: RecurrencePattern
): boolean {
  const today = startOfDay(new Date());
  const lastDate = startOfDay(lastCreatedDate);

  switch (pattern) {
    case "daily":
      return isBefore(lastDate, today);
    case "weekly":
      return isBefore(addDays(lastDate, 7), today);
    case "monthly":
      return isBefore(addMonths(lastDate, 1), today);
    case "yearly":
      return isBefore(addYears(lastDate, 1), today);
    default:
      return false;
  }
}

/**
 * Generate next recurrence date
 */
export function getNextRecurrenceDate(
  baseDate: Date,
  pattern: RecurrencePattern
): Date {
  switch (pattern) {
    case "daily":
      return addDays(baseDate, 1);
    case "weekly":
      return addDays(baseDate, 7);
    case "monthly":
      return addMonths(baseDate, 1);
    case "yearly":
      return addYears(baseDate, 1);
    default:
      return baseDate;
  }
}

/**
 * Create recurring expense instances
 * Should be called periodically (via cron job or background task)
 */
export async function processRecurringExpenses() {
  const today = startOfDay(new Date());

  // Find all recurring expenses that were created on or before today
  const recurringExpenses = await prisma.expense.findMany({
    where: {
      isRecurring: true,
      date: {
        lte: today,
      },
    },
  });

  const created: string[] = [];
  const errors: { id: string; error: string }[] = [];

  for (const expense of recurringExpenses) {
    try {
      // Check if we need to create a new instance
      const lastInstance = await prisma.expense.findFirst({
        where: {
          categoryId: expense.categoryId,
          amount: expense.amount,
          notes: expense.notes,
          isRecurring: true,
        },
        orderBy: { date: "desc" },
        take: 1,
      });

      if (lastInstance && shouldCreateRecurringTransaction(lastInstance.date, "monthly")) {
        const newExpense = await prisma.expense.create({
          data: {
            amount: expense.amount,
            categoryId: expense.categoryId,
            date: getNextRecurrenceDate(lastInstance.date, "monthly"),
            notes: expense.notes,
            isRecurring: true,
          },
        });
        created.push(newExpense.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errors.push({ id: expense.id, error: message });
      console.error(`[Recurring Expense] Error processing ${expense.id}:`, message);
    }
  }

  return { created, errors };
}

/**
 * Create recurring income instances
 */
export async function processRecurringIncomes() {
  const today = startOfDay(new Date());

  const recurringIncomes = await prisma.income.findMany({
    where: {
      isRecurring: true,
      date: {
        lte: today,
      },
    },
  });

  const created: string[] = [];
  const errors: { id: string; error: string }[] = [];

  for (const income of recurringIncomes) {
    try {
      const lastInstance = await prisma.income.findFirst({
        where: {
          categoryId: income.categoryId,
          amount: income.amount,
          notes: income.notes,
          isRecurring: true,
        },
        orderBy: { date: "desc" },
        take: 1,
      });

      if (lastInstance && shouldCreateRecurringTransaction(lastInstance.date, "monthly")) {
        const newIncome = await prisma.income.create({
          data: {
            amount: income.amount,
            categoryId: income.categoryId,
            date: getNextRecurrenceDate(lastInstance.date, "monthly"),
            notes: income.notes,
            isRecurring: true,
          },
        });
        created.push(newIncome.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errors.push({ id: income.id, error: message });
      console.error(`[Recurring Income] Error processing ${income.id}:`, message);
    }
  }

  return { created, errors };
}

/**
 * API endpoint to manually trigger recurring transactions
 */
export async function processAllRecurring() {
  const [expenseResult, incomeResult] = await Promise.all([
    processRecurringExpenses(),
    processRecurringIncomes(),
  ]);

  return {
    expenses: expenseResult,
    incomes: incomeResult,
    totalCreated: expenseResult.created.length + incomeResult.created.length,
    totalErrors: expenseResult.errors.length + incomeResult.errors.length,
  };
}

// Helper function
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
