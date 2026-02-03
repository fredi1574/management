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
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Monthly Overview</h2>

      {summary === null ? (
        <div className="flex items-center justify-center rounded-2xl bg-white p-12 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Summary Cards */}
          <div className="space-y-4 lg:col-span-5">
            <div className="flex items-start gap-4 rounded-2xl bg-emerald-50 p-5 shadow-sm ring-1 ring-emerald-100 dark:bg-emerald-950/30 dark:ring-emerald-900/50">
              <div className="rounded-xl bg-emerald-500/20 p-2.5 dark:bg-emerald-500/30">
                <ArrowDownCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Income</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums text-emerald-800 dark:text-emerald-200">
                  {formatCurrency(summary.totalIncome)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl bg-red-50 p-5 shadow-sm ring-1 ring-red-100 dark:bg-red-950/30 dark:ring-red-900/50">
              <div className="rounded-xl bg-red-500/20 p-2.5 dark:bg-red-500/30">
                <ArrowUpCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Expenses</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums text-red-800 dark:text-red-200">
                  {formatCurrency(summary.totalExpense)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl bg-indigo-50 p-5 shadow-sm ring-1 ring-indigo-100 dark:bg-indigo-950/30 dark:ring-indigo-900/50">
              <div className="rounded-xl bg-indigo-500/20 p-2.5 dark:bg-indigo-500/30">
                <Wallet className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Net Balance</p>
                <p
                  className={`mt-0.5 text-xl font-bold tabular-nums ${summary.balance >= 0 ? "text-indigo-800 dark:text-indigo-200" : "text-red-700 dark:text-red-300"
                    }`}
                >
                  {formatCurrency(summary.balance)}
                </p>
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="lg:col-span-7">
            <div className="h-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
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
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center gap-4 sm:w-48">
                  <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Spent</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(summary.totalExpense)}</p>
                  </div>
                  <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Monthly Net</p>
                    <p className={`text-lg font-bold ${summary.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                      {formatCurrency(summary.balance)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlyIncomes year={year} month={month} />
        <MonthlyExpenses year={year} month={month} />
      </div>
    </div>
  );
}
