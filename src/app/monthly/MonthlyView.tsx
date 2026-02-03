"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Search, Download } from "lucide-react";
import { MonthlyIncomes } from "@/app/monthly/MonthlyIncomes";
import { MonthlyExpenses } from "@/app/monthly/MonthlyExpenses";
import { MonthlySummary } from "@/app/monthly/MonthlySummary";
import { MONTHS, monthNumberToName } from "@/lib/date-utils";

interface MonthlyViewProps {
    year: number;
    month: number;
}

export function MonthlyView({ year, month }: MonthlyViewProps) {
    const router = useRouter();
    const [search, setSearch] = useState("");

    const handleMonthChange = (newMonth: number) => {
        const monthName = monthNumberToName(newMonth).toLowerCase();
        router.push(`/monthly/${year}/${monthName}`);
    };

    const handleYearChange = (newYear: number) => {
        const monthName = monthNumberToName(month).toLowerCase();
        router.push(`/monthly/${newYear}/${monthName}`);
    };

    const now = new Date();

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    <span className="rounded-xl bg-indigo-100 p-2 dark:bg-indigo-900/50">
                        <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </span>
                    Monthly view
                </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                <label className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Month</span>
                    <select
                        value={month}
                        onChange={(e) => handleMonthChange(Number(e.target.value))}
                        className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                        {MONTHS.map((m, i) => (
                            <option key={m} value={i + 1}>{m}</option>
                        ))}
                    </select>
                </label>
                <label className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Year</span>
                    <select
                        value={year}
                        onChange={(e) => handleYearChange(Number(e.target.value))}
                        className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                        {Array.from({ length: 10 }, (_, i) => now.getFullYear() - 5 + i).map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </label>
                <label className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-zinc-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Filter by notes"
                        className="w-40 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 sm:w-48"
                    />
                </label>
                <a
                    href={`/api/export/csv?year=${year}&month=${month}`}
                    download
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                    <Download className="h-4 w-4" />
                    Export CSV
                </a>
            </div>
            <MonthlySummary year={year} month={month} />
            <div className="grid gap-6 lg:grid-cols-2">
                <MonthlyIncomes year={year} month={month} search={search} />
                <MonthlyExpenses year={year} month={month} search={search} />
            </div>
        </div>
    );
}
