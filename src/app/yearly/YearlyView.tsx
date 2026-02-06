"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    AreaChart,
    Area,
} from "recharts";
import { BarChart3, ArrowDownCircle, ArrowUpCircle, Wallet, Download, Loader2, LineChart as LineChartIcon, LayoutPanelLeft, ChevronRight, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { motion, AnimatePresence } from "framer-motion";

const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface MonthRow {
    month: number;
    totalIncome: number;
    totalExpense: number;
    balance: number;
}

interface YearSummary {
    year: number;
    months: MonthRow[];
    totalIncome: number;
    totalExpense: number;
    balance: number;
}

interface YearlyViewProps {
    year: number;
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

export function YearlyView({ year }: YearlyViewProps) {
    const router = useRouter();
    const [data, setData] = useState<YearSummary | null>(null);
    const [chartType, setChartType] = useState<"bar" | "area">("area");

    useEffect(() => {
        fetch(`/api/summary/year?year=${year}`)
            .then((r) => r.json())
            .then(setData)
            .catch(() => setData(null));
    }, [year]);

    const chartData = data
        ? data.months.map((row) => ({
            name: MONTHS[row.month - 1],
            income: row.totalIncome,
            expense: row.totalExpense,
            balance: row.balance,
        }))
        : [];

    const handleYearChange = (newYear: number) => {
        router.push(`/yearly/${newYear}`);
    };

    const now = new Date();

    return (
        <div className="space-y-12 pb-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-500/30">
                            <BarChart3 className="h-6 w-6 text-white" />
                        </div>
                        Annual Audit
                    </h1>
                    <p className="text-zinc-500 font-medium pl-1 gap-2 flex items-center">
                        Financial performance for fiscal year 
                        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-bold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                            {year}
                        </span>
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                       <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                        <select
                            value={year}
                            onChange={(e) => handleYearChange(Number(e.target.value))}
                            className="appearance-none rounded-2xl border-none glass pl-10 pr-10 py-2.5 text-sm font-bold shadow-sm ring-1 ring-zinc-200 focus:ring-2 focus:ring-indigo-500 dark:ring-zinc-700"
                        >
                            {Array.from({ length: 10 }, (_, i) => now.getFullYear() - 5 + i).map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 rotate-90" />
                    </div>
                    <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href={`/api/export/csv?year=${year}`}
                        download
                        className="inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white shadow-xl shadow-zinc-900/20 transition hover:bg-black dark:bg-white dark:text-black"
                    >
                        <Download className="h-4 w-4" />
                        Export Audit
                    </motion.a>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {!data ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center rounded-[2.5rem] glass p-24"
                    >
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                    </motion.div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="space-y-8"
                    >
                        {/* Summary Cards */}
                        <div className="grid gap-6 sm:grid-cols-3">
                            <motion.div variants={item} className="group relative flex items-start gap-5 rounded-3xl bg-emerald-50/50 p-6 shadow-sm ring-1 ring-emerald-100/50 transition-all hover:shadow-md dark:bg-emerald-950/20 dark:ring-emerald-900/30 card-shine">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/20">
                                    <ArrowDownCircle className="h-7 w-7 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-700/70 dark:text-emerald-400/70">Total Revenue</p>
                                    <p className="mt-1 text-2xl font-black tabular-nums tracking-tight text-emerald-900 dark:text-emerald-100">{formatCurrency(data.totalIncome)}</p>
                                </div>
                            </motion.div>
                            <motion.div variants={item} className="group relative flex items-start gap-5 rounded-3xl bg-rose-50/50 p-6 shadow-sm ring-1 ring-rose-100/50 transition-all hover:shadow-md dark:bg-rose-950/20 dark:ring-rose-900/30 card-shine">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500 shadow-lg shadow-rose-500/20">
                                    <ArrowUpCircle className="h-7 w-7 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-widest text-rose-700/70 dark:text-rose-400/70">Total Expenses</p>
                                    <p className="mt-1 text-2xl font-black tabular-nums tracking-tight text-rose-900 dark:text-rose-100">{formatCurrency(data.totalExpense)}</p>
                                </div>
                            </motion.div>
                            <motion.div variants={item} className="group relative flex items-start gap-5 rounded-3xl bg-indigo-50/50 p-6 shadow-sm ring-1 ring-indigo-100/50 transition-all hover:shadow-md dark:bg-indigo-950/20 dark:ring-indigo-900/30 card-shine">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/20">
                                    <Wallet className="h-7 w-7 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-700/70 dark:text-indigo-400/70">Net Savings</p>
                                    <p className={`mt-1 text-2xl font-black tabular-nums tracking-tight ${data.balance >= 0 ? "text-indigo-900 dark:text-indigo-100" : "text-rose-900 dark:text-rose-100"}`}>
                                        {formatCurrency(data.balance)}
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Chart Area */}
                        <motion.div variants={item} className="rounded-[2.5rem] glass p-8 shadow-xl">
                            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100">Growth Projection</h2>
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Revenue vs Operating costs</p>
                                </div>
                                <div className="flex items-center gap-1.5 p-1 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-2xl">
                                    <button
                                        onClick={() => setChartType("bar")}
                                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${chartType === "bar"
                                            ? "bg-white text-zinc-900 shadow-md dark:bg-zinc-700 dark:text-zinc-100"
                                            : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                                            }`}
                                    >
                                        <LayoutPanelLeft className="h-3.5 w-3.5" />
                                        Columns
                                    </button>
                                    <button
                                        onClick={() => setChartType("area")}
                                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${chartType === "area"
                                            ? "bg-white text-zinc-900 shadow-md dark:bg-zinc-700 dark:text-zinc-100"
                                            : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                                            }`}
                                    >
                                        <LineChartIcon className="h-3.5 w-3.5" />
                                        Surface
                                    </button>
                                </div>
                            </div>
                            <div className="h-80 w-full px-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    {chartType === "bar" ? (
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-zinc-100 dark:stroke-zinc-800" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-[10px] font-bold text-zinc-400" dy={10} />
                                            <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-zinc-400" tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="rounded-2xl glass px-4 py-3 shadow-xl border-none space-y-1">
                                                                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                                                                {payload.map((entry: any) => (
                                                                    <div key={entry.dataKey} className="flex items-center justify-between gap-8">
                                                                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300 capitalize">{entry.name}</span>
                                                                        <span className="text-sm font-black tabular-nums" style={{ color: entry.fill }}>{formatCurrency(entry.value)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Legend iconType="circle" />
                                            <Bar dataKey="income" name="Revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                                            <Bar dataKey="expense" name="Spending" fill="#ef4444" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    ) : (
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-zinc-100 dark:stroke-zinc-800" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-[10px] font-bold text-zinc-400" dy={10} />
                                            <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-zinc-400" tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))} />
                                            <Tooltip
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="rounded-2xl glass px-4 py-3 shadow-xl border-none space-y-1">
                                                                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                                                                {payload.map((entry: any) => (
                                                                    <div key={entry.dataKey} className="flex items-center justify-between gap-8">
                                                                        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300 capitalize">{entry.name}</span>
                                                                        <span className="text-sm font-black tabular-nums" style={{ color: entry.color }}>{formatCurrency(entry.value)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Legend iconType="circle" />
                                            <Area type="monotone" dataKey="income" name="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                                            <Area type="monotone" dataKey="expense" name="Spending" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
                                        </AreaChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Table Area */}
                        <motion.div variants={item} className="overflow-hidden rounded-[2.5rem] glass shadow-xl">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-800/50">
                                        <th className="px-8 py-5 text-left font-black uppercase tracking-widest text-[10px] text-zinc-400">Month</th>
                                        <th className="px-8 py-5 text-right font-black uppercase tracking-widest text-[10px] text-zinc-400">Revenue</th>
                                        <th className="px-8 py-5 text-right font-black uppercase tracking-widest text-[10px] text-zinc-400">Spending</th>
                                        <th className="px-8 py-5 text-right font-black uppercase tracking-widest text-[10px] text-zinc-400">Net Profit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {data.months.map((row) => (
                                        <tr key={row.month} className="group transition-colors hover:bg-zinc-50/30 dark:hover:bg-zinc-800/30">
                                            <td className="px-8 py-4 font-bold text-zinc-900 dark:text-zinc-100">{MONTHS[row.month - 1]}</td>
                                            <td className="px-8 py-4 text-right tabular-nums font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(row.totalIncome)}</td>
                                            <td className="px-8 py-4 text-right tabular-nums font-bold text-rose-500/80 dark:text-rose-400/80">{formatCurrency(row.totalExpense)}</td>
                                            <td className={`px-8 py-4 text-right font-black tabular-nums ${row.balance >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-rose-600 dark:text-rose-400"}`}>
                                                {formatCurrency(row.balance)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
