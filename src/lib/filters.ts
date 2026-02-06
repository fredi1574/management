import { isWithinInterval, parseISO } from "date-fns";

export interface FilterOptions {
  startDate?: string | Date;
  endDate?: string | Date;
  categories?: string[];
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  isRecurring?: boolean;
}

export interface FilterResult<T> {
  items: T[];
  total: number;
  filtered: number;
}

/**
 * Filter expenses by multiple criteria
 */
export function filterExpenses<T extends Record<string, any>>(
  items: T[],
  options: FilterOptions
): FilterResult<T> {
  const total = items.length;
  let filtered = items;

  // Filter by date range
  if (options.startDate || options.endDate) {
    const startDate = options.startDate ? parseISO(options.startDate.toString()) : new Date(0);
    const endDate = options.endDate ? parseISO(options.endDate.toString()) : new Date();

    filtered = filtered.filter((item) => {
      const itemDate = parseISO(item.date);
      return isWithinInterval(itemDate, { start: startDate, end: endDate });
    });
  }

  // Filter by categories
  if (options.categories && options.categories.length > 0) {
    filtered = filtered.filter((item) => options.categories!.includes(item.categoryId));
  }

  // Filter by amount range
  if (options.minAmount !== undefined) {
    filtered = filtered.filter((item) => item.amount >= options.minAmount!);
  }
  if (options.maxAmount !== undefined) {
    filtered = filtered.filter((item) => item.amount <= options.maxAmount!);
  }

  // Filter by search text (in notes)
  if (options.search) {
    const searchLower = options.search.toLowerCase();
    filtered = filtered.filter((item) => {
      const notes = (item.notes || "").toLowerCase();
      const categoryName = (item.category?.name || "").toLowerCase();
      return notes.includes(searchLower) || categoryName.includes(searchLower);
    });
  }

  // Filter by recurrence
  if (options.isRecurring !== undefined) {
    filtered = filtered.filter((item) => item.isRecurring === options.isRecurring);
  }

  return {
    items: filtered,
    total,
    filtered: filtered.length,
  };
}

/**
 * Group items by category
 */
export function groupByCategory<T extends { categoryId: string; category?: { name: string } }>(
  items: T[]
): Record<string, { category: T["category"]; items: T[]; total: number }> {
  const grouped: Record<string, { category: T["category"]; items: T[]; total: number }> = {};

  items.forEach((item) => {
    if (!grouped[item.categoryId]) {
      grouped[item.categoryId] = {
        category: item.category,
        items: [],
        total: 0,
      };
    }
    grouped[item.categoryId].items.push(item);
    grouped[item.categoryId].total += (item as any).amount || 0;
  });

  return grouped;
}

/**
 * Group items by date (month/day)
 */
export function groupByDate<T extends { date: string | Date }>(
  items: T[],
  format: "day" | "month" | "year" = "month"
): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};

  items.forEach((item) => {
    const date = typeof item.date === "string" ? parseISO(item.date) : item.date;
    let key: string;

    switch (format) {
      case "day":
        key = date.toISOString().split("T")[0];
        break;
      case "month":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      case "year":
        key = `${date.getFullYear()}`;
        break;
      default:
        key = date.toISOString();
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  });

  return grouped;
}

/**
 * Calculate statistics from items
 */
export function calculateStats<T extends { amount: number }>(items: T[]) {
  if (items.length === 0) {
    return {
      total: 0,
      average: 0,
      min: 0,
      max: 0,
      count: 0,
    };
  }

  const amounts = items.map((item) => item.amount);
  const total = amounts.reduce((sum, amount) => sum + amount, 0);
  const average = total / amounts.length;
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);

  return {
    total,
    average,
    min,
    max,
    count: items.length,
  };
}
