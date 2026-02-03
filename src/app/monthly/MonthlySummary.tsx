"use client";

import { useEffect, useState, useMemo } from "react";
import { ArrowDownCircle, ArrowUpCircle, Wallet, Loader2, LayoutGrid, PieChart as PieChartIcon } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Expense } from "@/types";

interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

/**
 * Displays income/expense/balance for the selected month with optional Chart view.
 */
const ICON_FALLBACK: Record<string, string> = {
  Salary: "Banknote",
  Freelance: "Laptop",
  Investments: "TrendingUp",
  "Other income": "PlusCircle",
  Food: "UtensilsCrossed",
  Rent: "Home",
  Utilities: "Zap",
  Transport: "Car",
  Shopping: "ShoppingBag",
  Health: "HeartPulse",
  Other: "Tag",
};

export function MonthlySummary({ year, month }: { year: number; month: number }) {
  const [data, setData] = useState<Summary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [view, setView] = useState<"cards" | "chart">("cards");

  useEffect(() => {
    fetch(`/api/summary/month?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));

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

  if (!data) {
    return (
      <div className="flex items-center justify-center rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Monthly Performance</h2>
        <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            onClick={() => setView("cards")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${view === "cards"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("chart")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${view === "chart"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              }`}
          >
            <PieChartIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {view === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl bg-emerald-50 p-4 shadow-sm ring-1 ring-emerald-100 dark:bg-emerald-950/30 dark:ring-emerald-900/50">
            <div className="rounded-xl bg-emerald-500/20 p-2.5 dark:bg-emerald-500/30">
              <ArrowDownCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Income</p>
              <p className="text-lg font-bold tabular-nums text-emerald-800 dark:text-emerald-200">{formatCurrency(data.totalIncome)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-red-50 p-4 shadow-sm ring-1 ring-red-100 dark:bg-red-950/30 dark:ring-red-900/50">
            <div className="rounded-xl bg-red-500/20 p-2.5 dark:bg-red-500/30">
              <ArrowUpCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">Expenses</p>
              <p className="text-lg font-bold tabular-nums text-red-800 dark:text-red-200">{formatCurrency(data.totalExpense)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-indigo-50 p-4 shadow-sm ring-1 ring-indigo-100 dark:bg-indigo-950/30 dark:ring-indigo-900/50">
            <div className="rounded-xl bg-indigo-500/20 p-2.5 dark:bg-indigo-500/30">
              <Wallet className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Balance</p>
              <p className={`text-lg font-bold tabular-nums ${data.balance >= 0 ? "text-indigo-800 dark:text-indigo-200" : "text-red-700 dark:text-red-300"}`}>
                {formatCurrency(data.balance)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
            <div className="h-[250px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
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
            <div className="flex flex-col justify-center gap-4 lg:w-64">
              <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Expenses</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(data.totalExpense)}</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Monthly Net</p>
                <p className={`text-xl font-bold ${data.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {formatCurrency(data.balance)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
