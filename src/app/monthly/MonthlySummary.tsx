"use client";

import { useEffect, useState, useMemo } from "react";
import { ArrowDownCircle, ArrowUpCircle, Wallet, Loader2, LayoutGrid, PieChart as PieChartIcon, TrendingDown, Target, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Expense } from "@/types";
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
      <div className="flex items-center justify-center rounded-3xl glass p-12 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100">Financial Snapshot</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Real-time performance metrics</p>
        </div>
        <div className="flex rounded-2xl glass p-1 shadow-sm">
          <button
            onClick={() => setView("cards")}
            className={`rounded-xl p-2 transition ${view === "cards"
              ? "bg-white text-amber-600 shadow-sm dark:bg-zinc-800 dark:text-amber-400"
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("chart")}
            className={`rounded-xl p-2 transition ${view === "chart"
              ? "bg-white text-amber-600 shadow-sm dark:bg-zinc-800 dark:text-amber-400"
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
          >
            <PieChartIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "cards" ? (
          <motion.div 
            key="cards"
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -20 }}
            className="grid gap-6 sm:grid-cols-3"
          >
            <motion.div variants={item} className="group relative flex flex-col gap-4 overflow-hidden rounded-[2rem] glass p-6 shadow-xl transition-all hover:scale-[1.02] card-shine">
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-emerald-100 p-3 dark:bg-emerald-900/40">
                  <ArrowDownCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="h-2 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "80%" }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Revenue</p>
                <p className="text-2xl font-black tabular-nums text-zinc-900 dark:text-zinc-50">{formatCurrency(data.totalIncome)}</p>
              </div>
            </motion.div>

            <motion.div variants={item} className="group relative flex flex-col gap-4 overflow-hidden rounded-[2rem] glass p-6 shadow-xl transition-all hover:scale-[1.02] card-shine">
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-rose-100 p-3 dark:bg-rose-900/40">
                  <ArrowUpCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="h-2 w-12 rounded-full bg-rose-100 dark:bg-rose-900/30 overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: data.totalIncome > 0 ? `${(data.totalExpense / data.totalIncome) * 100}%` : "100%" }}
                    className="h-full bg-rose-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Operational Burn</p>
                <p className="text-2xl font-black tabular-nums text-zinc-900 dark:text-zinc-50">{formatCurrency(data.totalExpense)}</p>
              </div>
            </motion.div>

            <motion.div variants={item} className="group relative flex flex-col gap-4 overflow-hidden rounded-[2rem] glass p-6 shadow-xl transition-all hover:scale-[1.02] card-shine">
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-indigo-100 p-3 dark:bg-indigo-900/40">
                  <Wallet className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-lg">
                  {data.totalIncome > 0 ? ((data.balance / data.totalIncome) * 100).toFixed(0) : 0}% Net
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Retained Surplus</p>
                <p className={`text-2xl font-black tabular-nums ${data.balance >= 0 ? "text-zinc-900 dark:text-zinc-50" : "text-rose-600 dark:text-rose-400"}`}>
                  {formatCurrency(data.balance)}
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="chart"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-[2.5rem] glass p-8 shadow-xl"
          >
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
              <div className="h-[280px] flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="rounded-2xl glass px-4 py-3 shadow-xl border-none">
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{payload[0].name}</p>
                                        <p className="text-lg font-black text-zinc-900 dark:text-zinc-100 tabular-nums">
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
              <div className="flex flex-col justify-center gap-4 lg:w-72">
                <div className="rounded-2xl bg-zinc-50/50 p-5 dark:bg-zinc-800/30 border border-zinc-100/50 dark:border-zinc-800/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-3 w-3 text-rose-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Peak Burn</p>
                  </div>
                  <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{formatCurrency(data.totalExpense)}</p>
                </div>
                <div className="rounded-2xl bg-zinc-50/50 p-5 dark:bg-zinc-800/30 border border-zinc-100/50 dark:border-zinc-800/50">
                   <div className="flex items-center gap-2 mb-1">
                    <Target className="h-3 w-3 text-emerald-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Retention Goal</p>
                  </div>
                  <p className={`text-2xl font-black ${data.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {formatCurrency(data.balance)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
