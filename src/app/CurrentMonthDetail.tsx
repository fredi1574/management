"use client";

import { MonthlyExpenses } from "@/app/monthly/MonthlyExpenses";
import { MonthlyIncomes } from "@/app/monthly/MonthlyIncomes";
import { formatCurrency } from "@/lib/format";
import type { Expense } from "@/types";
import { ArrowDownCircle, ArrowUpCircle, LayoutGrid, Loader2, PieChart as PieChartIcon, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

/**
 * Current month summary cards AND charts with income/expense details.
 */
export function CurrentMonthDetail({ year, month }: { year: number; month: number }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    fetch(`/api/summary/month?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then(setSummary)
      .catch(() => setSummary(null));

    fetch(`/api/expenses?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then(setExpenses)
      .catch(() => setExpenses([]));
  }, [year, month]);

  const chartData = useMemo(() => {
    const groups: Record<string, { name: string; value: number; color: string }> = {};
    expenses.forEach((e) => {
      if (!groups[e.categoryId]) {
        groups[e.categoryId] = { name: e.category.name, value: 0, color: e.category.color };
      }
      groups[e.categoryId].value += e.amount;
    });
    return Object.values(groups).sort((a, b) => b.value - a.value);
  }, [expenses]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Monthly Overview</h2>
        <p className="mt-1 text-[var(--text-secondary)]">Comprehensive view of your financial activity</p>
      </div>

      {summary === null ? (
        <div className="flex items-center justify-center rounded-2xl bg-[var(--card-bg)] p-12 shadow-md ring-1 ring-[var(--border)]">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--text-tertiary)]" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Summary Cards */}
          <div className="space-y-4 lg:col-span-5">
            {/* Income Card */}
            <div className="card-elevated overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 ring-1 ring-emerald-200/50 dark:from-emerald-950/30 dark:to-emerald-900/20 dark:ring-emerald-800/50">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-emerald-500/20 p-3 dark:bg-emerald-500/30">
                  <ArrowDownCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Income</p>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-800 dark:text-emerald-200">
                    {formatCurrency(summary.totalIncome)}
                  </p>
                </div>
              </div>
            </div>

            {/* Expenses Card */}
            <div className="card-elevated overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-red-100/50 p-6 ring-1 ring-red-200/50 dark:from-red-950/30 dark:to-red-900/20 dark:ring-red-800/50">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-red-500/20 p-3 dark:bg-red-500/30">
                  <ArrowUpCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-300">Expenses</p>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-red-800 dark:text-red-200">
                    {formatCurrency(summary.totalExpense)}
                  </p>
                </div>
              </div>
            </div>

            {/* Balance Card */}
            <div className="card-elevated overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary-light)]/10 p-6 ring-1 ring-[var(--primary)]/20 dark:from-[var(--primary)]/20 dark:to-[var(--primary-light)]/10 dark:ring-[var(--primary)]/40">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-[var(--primary)]/20 p-3 dark:bg-[var(--primary)]/30">
                  <Wallet className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--primary)]">Net Balance</p>
                  <p
                    className={`mt-2 text-2xl font-bold tabular-nums ${
                      summary.balance >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(summary.balance)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="lg:col-span-7">
            <div className="card-elevated h-full overflow-hidden rounded-2xl bg-[var(--card-bg)] p-6 ring-1 ring-[var(--border)]">
              <h3 className="mb-6 text-lg font-semibold text-[var(--text-primary)]">Expense Breakdown</h3>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="h-[280px] flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "var(--card-bg)",
                          borderRadius: "12px",
                          border: "1px solid var(--border)",
                          boxShadow: "var(--shadow-md)",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center gap-4 sm:w-48">
                  <div className="rounded-xl bg-[var(--background-secondary)] p-4 dark:bg-[var(--background-secondary)]/50">
                    <p className="text-xs font-semibold text-[var(--text-secondary)]">Total Spent</p>
                    <p className="mt-2 text-lg font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(summary.totalExpense)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[var(--background-secondary)] p-4 dark:bg-[var(--background-secondary)]/50">
                    <p className="text-xs font-semibold text-[var(--text-secondary)]">Monthly Net</p>
                    <p
                      className={`mt-2 text-lg font-bold ${
                        summary.balance >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(summary.balance)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlyIncomes year={year} month={month} />
        <MonthlyExpenses year={year} month={month} />
      </div>
    </div>
  );
}
