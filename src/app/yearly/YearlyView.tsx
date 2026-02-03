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
import { BarChart3, ArrowDownCircle, ArrowUpCircle, Wallet, Download, Loader2, LineChart as LineChartIcon, LayoutPanelLeft } from "lucide-react";
import { formatCurrency } from "@/lib/format";

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

export function YearlyView({ year }: YearlyViewProps) {
    const router = useRouter();
    const [data, setData] = useState<YearSummary | null>(null);
    const [chartType, setChartType] = useState<"bar" | "area">("bar");

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
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    <span className="rounded-xl bg-indigo-100 p-2 dark:bg-indigo-900/50">
                        <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </span>
                    Yearly overview ({year})
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={year}
                        onChange={(e) => handleYearChange(Number(e.target.value))}
                        className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                        {Array.from({ length: 10 }, (_, i) => now.getFullYear() - 5 + i).map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <a
                        href={`/api/export/csv?year=${year}`}
                        download
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </a>
                </div>
            </div>
            {!data && (
                <div className="flex items-center justify-center rounded-2xl bg-white p-12 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
            )}
            {data && (
                <>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex items-center gap-4 rounded-2xl bg-emerald-50 p-4 shadow-sm ring-1 ring-emerald-100 dark:bg-emerald-950/30 dark:ring-emerald-900/50">
                            <div className="rounded-xl bg-emerald-500/20 p-2.5 dark:bg-emerald-500/30">
                                <ArrowDownCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total income</p>
                                <p className="text-xl font-bold tabular-nums text-emerald-800 dark:text-emerald-200">{formatCurrency(data.totalIncome)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 rounded-2xl bg-red-50 p-4 shadow-sm ring-1 ring-red-100 dark:bg-red-950/30 dark:ring-red-900/50">
                            <div className="rounded-xl bg-red-500/20 p-2.5 dark:bg-red-500/30">
                                <ArrowUpCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-red-700 dark:text-red-300">Total expenses</p>
                                <p className="text-xl font-bold tabular-nums text-red-800 dark:text-red-200">{formatCurrency(data.totalExpense)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 rounded-2xl bg-indigo-50 p-4 shadow-sm ring-1 ring-indigo-100 dark:bg-indigo-950/30 dark:ring-indigo-900/50">
                            <div className="rounded-xl bg-indigo-500/20 p-2.5 dark:bg-indigo-500/30">
                                <Wallet className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Year balance</p>
                                <p className={`text-xl font-bold tabular-nums ${data.balance >= 0 ? "text-indigo-800 dark:text-indigo-200" : "text-red-700 dark:text-red-300"}`}>
                                    {formatCurrency(data.balance)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Monthly comparison</h2>
                            <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
                                <button
                                    onClick={() => setChartType("bar")}
                                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${chartType === "bar"
                                        ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                                        : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                                        }`}
                                    title="Bar Chart"
                                >
                                    <LayoutPanelLeft className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setChartType("area")}
                                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${chartType === "area"
                                        ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                                        : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                                        }`}
                                    title="Area Chart"
                                >
                                    <LineChartIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartType === "bar" ? (
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
                                        <XAxis dataKey="name" className="text-xs" />
                                        <YAxis tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))} />
                                        <Tooltip
                                            formatter={(v: number) => formatCurrency(v)}
                                            contentStyle={{
                                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                                borderRadius: "12px",
                                                border: "none",
                                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                ) : (
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
                                        <XAxis dataKey="name" className="text-xs" />
                                        <YAxis tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))} />
                                        <Tooltip
                                            formatter={(v: number) => formatCurrency(v)}
                                            contentStyle={{
                                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                                borderRadius: "12px",
                                                border: "none",
                                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                            }}
                                        />
                                        <Legend />
                                        <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                                        <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
                                    </AreaChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                                    <th className="px-5 py-3 text-left font-medium text-zinc-700 dark:text-zinc-300">Month</th>
                                    <th className="px-5 py-3 text-right font-medium text-zinc-700 dark:text-zinc-300">Income</th>
                                    <th className="px-5 py-3 text-right font-medium text-zinc-700 dark:text-zinc-300">Expense</th>
                                    <th className="px-5 py-3 text-right font-medium text-zinc-700 dark:text-zinc-300">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.months.map((row) => (
                                    <tr key={row.month} className="border-b border-zinc-100 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
                                        <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-100">{MONTHS[row.month - 1]}</td>
                                        <td className="px-5 py-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">{formatCurrency(row.totalIncome)}</td>
                                        <td className="px-5 py-3 text-right tabular-nums text-red-600 dark:text-red-400">{formatCurrency(row.totalExpense)}</td>
                                        <td className={`px-5 py-3 text-right font-medium tabular-nums ${row.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                                            {formatCurrency(row.balance)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
