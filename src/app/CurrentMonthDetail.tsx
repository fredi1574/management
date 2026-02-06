"use client";

import { MonthlyExpenses } from "@/app/monthly/MonthlyExpenses";
import { MonthlyIncomes } from "@/app/monthly/MonthlyIncomes";
import { formatCurrency } from "@/lib/format";
import type { Expense } from "@/types";
import { ArrowDownCircle, ArrowUpCircle, LayoutGrid, Loader2, PieChart as PieChartIcon, Wallet, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

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
    <div className="space-y-12">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">Monthly Performance</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Current active cycle analysis</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl glass shadow-sm">
          <PieChartIcon className="h-5 w-5 text-indigo-500" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {summary === null ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center rounded-3xl glass p-24"
          >
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 lg:grid-cols-12"
          >
            {/* Summary Cards */}
            <div className="space-y-4 lg:col-span-5">
              <motion.div
                variants={item}
                whileHover={{ scale: 1.02 }}
                className="group relative flex items-start gap-5 rounded-3xl bg-emerald-50/50 p-6 shadow-sm ring-1 ring-emerald-100/50 transition-all hover:shadow-md dark:bg-emerald-950/20 dark:ring-emerald-900/30 card-shine"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/20">
                  <ArrowDownCircle className="h-7 w-7 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold uppercase tracking-wider text-emerald-700/70 dark:text-emerald-400/70">Total Revenue</p>
                  <p className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight text-emerald-900 dark:text-emerald-100">
                    {formatCurrency(summary.totalIncome)}
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={item}
                whileHover={{ scale: 1.02 }}
                className="group relative flex items-start gap-5 rounded-3xl bg-rose-50/50 p-6 shadow-sm ring-1 ring-rose-100/50 transition-all hover:shadow-md dark:bg-rose-950/20 dark:ring-rose-900/30 card-shine"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500 shadow-lg shadow-rose-500/20">
                  <ArrowUpCircle className="h-7 w-7 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold uppercase tracking-wider text-rose-700/70 dark:text-rose-400/70">Total Spending</p>
                  <p className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight text-rose-900 dark:text-rose-100">
                    {formatCurrency(summary.totalExpense)}
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={item}
                whileHover={{ scale: 1.02 }}
                className={`group relative flex items-start gap-5 rounded-3xl p-6 shadow-sm ring-1 transition-all hover:shadow-md card-shine ${summary.balance >= 0
                  ? "bg-indigo-50/50 ring-indigo-100/50 dark:bg-indigo-950/20 dark:ring-indigo-900/30"
                  : "bg-amber-50/50 ring-amber-100/50 dark:bg-amber-950/20 dark:ring-amber-900/30"
                  }`}
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${summary.balance >= 0
                  ? "bg-indigo-600 shadow-indigo-500/20"
                  : "bg-amber-600 shadow-amber-500/20"
                  }`}>
                  <Wallet className="h-7 w-7 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold uppercase tracking-wider ${summary.balance >= 0
                    ? "text-indigo-700/70 dark:text-indigo-400/70"
                    : "text-amber-700/70 dark:text-amber-400/70"
                    }`}>Net Balance</p>
                  <p className={`mt-1 text-3xl font-extrabold tabular-nums tracking-tight ${summary.balance >= 0
                    ? "text-indigo-900 dark:text-indigo-100"
                    : "text-amber-900 dark:text-amber-100"
                    }`}>
                    {formatCurrency(summary.balance)}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Pie Chart */}
            <motion.div variants={item} className="lg:col-span-7">
              <div className="h-full rounded-3xl glass p-8 shadow-sm">
                <div className="flex flex-col gap-8 lg:flex-row">
                  <div className="h-[300px] flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={110}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              stroke="transparent"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-2xl glass px-4 py-3 shadow-xl border-none">
                                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                    {payload[0].name}
                                  </p>
                                  <p className="text-indigo-600 dark:text-indigo-400 font-bold tabular-nums">
                                    {formatCurrency(payload[0].value as number)}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col justify-center gap-4 lg:w-40">
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Summary</p>
                      <div className="h-1 w-8 rounded-full bg-indigo-500" />
                    </div>
                    <div className="space-y-3">
                      <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/40">
                        <p className="text-[10px] font-bold uppercase text-zinc-400">Total Spent</p>
                        <p className="text-xl font-black text-rose-600 dark:text-rose-400">{formatCurrency(summary.totalExpense)}</p>
                      </div>
                      <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/40">
                        <p className="text-[10px] font-bold uppercase text-zinc-400">Savings</p>
                        <p className={`text-xl font-black ${summary.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600/50"}`}>
                          {summary.balance > 0 ? ((summary.balance / summary.totalIncome) * 100).toFixed(0) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid gap-8 lg:grid-cols-2"
      >
        <motion.div variants={item}>
          <MonthlyIncomes year={year} month={month} />
        </motion.div>
        <motion.div variants={item}>
          <MonthlyExpenses year={year} month={month} />
        </motion.div>
      </motion.div>
    </div>
  );
}
