import { eachMonthOfInterval, format, getYear, getMonth, startOfYear, endOfYear } from "date-fns";

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

/**
 * Calculate spending trends over a year
 */
export function calculateYearlyTrends(
  transactions: Array<{
    amount: number;
    date: string | Date;
    type: "income" | "expense";
  }>,
  year: number
): MonthlyTrend[] {
  const startDate = startOfYear(new Date(year, 0, 1));
  const endDate = endOfYear(new Date(year, 0, 1));

  const months = eachMonthOfInterval({ start: startDate, end: endDate });
  const trends: MonthlyTrend[] = [];

  months.forEach((month) => {
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const monthTransactions = transactions.filter((t) => {
      const date = typeof t.date === "string" ? new Date(t.date) : t.date;
      return date >= monthStart && date <= monthEnd;
    });

    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    trends.push({
      month: format(month, "MMM yyyy"),
      income,
      expense,
      balance: income - expense,
    });
  });

  return trends;
}

/**
 * Calculate category breakdown with percentages
 */
export function calculateCategoryBreakdown(
  transactions: Array<{
    amount: number;
    category: { name: string; color: string };
  }>
): CategoryBreakdown[] {
  const categoryMap = new Map<
    string,
    { amount: number; color: string; count: number }
  >();

  transactions.forEach((t) => {
    const key = t.category.name;
    if (!categoryMap.has(key)) {
      categoryMap.set(key, { amount: 0, color: t.category.color, count: 0 });
    }
    const category = categoryMap.get(key)!;
    category.amount += t.amount;
    category.count++;
  });

  const total = Array.from(categoryMap.values()).reduce(
    (sum, cat) => sum + cat.amount,
    0
  );

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: total > 0 ? (data.amount / total) * 100 : 0,
      color: data.color,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Calculate spending velocity (amount spent per day)
 */
export function calculateSpendingVelocity(
  transactions: Array<{
    amount: number;
    date: string | Date;
  }>,
  startDate: Date,
  endDate: Date
): number {
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  return daysDiff > 0 ? totalSpent / daysDiff : 0;
}

/**
 * Find top spending categories
 */
export function getTopCategories(
  breakdown: CategoryBreakdown[],
  limit: number = 5
): CategoryBreakdown[] {
  return breakdown.slice(0, limit);
}

/**
 * Calculate savings rate
 */
export function calculateSavingsRate(income: number, expense: number): number {
  if (income === 0) return 0;
  return ((income - expense) / income) * 100;
}

/**
 * Identify spending anomalies (transactions significantly above/below average)
 */
export function identifyAnomalies(
  transactions: Array<{ amount: number; id: string }>,
  standardDeviations: number = 2
): Array<{ id: string; amount: number; deviation: number }> {
  if (transactions.length < 2) return [];

  const mean = transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;
  const variance =
    transactions.reduce((sum, t) => sum + Math.pow(t.amount - mean, 2), 0) /
    transactions.length;
  const stdDev = Math.sqrt(variance);

  return transactions
    .filter((t) => Math.abs(t.amount - mean) > standardDeviations * stdDev)
    .map((t) => ({
      id: t.id,
      amount: t.amount,
      deviation: (t.amount - mean) / stdDev,
    }))
    .sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
}

/**
 * Project future balance based on trends
 */
export function projectBalance(
  historicalTrends: Array<{ income: number; expense: number }>,
  monthsAhead: number = 3
): Array<{ month: number; projectedBalance: number }> {
  if (historicalTrends.length === 0) return [];

  // Calculate average monthly balance
  const avgBalances = historicalTrends.map((t) => t.income - t.expense);
  const avgBalance =
    avgBalances.reduce((sum, b) => sum + b, 0) / avgBalances.length;

  const projections = [];
  for (let i = 1; i <= monthsAhead; i++) {
    projections.push({
      month: i,
      projectedBalance: avgBalance * i,
    });
  }

  return projections;
}
