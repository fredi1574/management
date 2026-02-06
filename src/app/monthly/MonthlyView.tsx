"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Search, Download, ChevronRight, Filter } from "lucide-react";
import { MonthlyIncomes } from "@/app/monthly/MonthlyIncomes";
import { MonthlyExpenses } from "@/app/monthly/MonthlyExpenses";
import { MonthlySummary } from "@/app/monthly/MonthlySummary";
import { MONTHS, monthNumberToName } from "@/lib/date-utils";
import { motion } from "framer-motion";

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
        <div className="space-y-12 pb-20">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between px-2">
                <div className="space-y-2">
                    <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 shadow-xl shadow-indigo-500/30">
                            <Calendar className="h-6 w-6 text-white" />
                        </div>
                        Executive Ledger
                    </h1>
                    <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 uppercase tracking-widest pl-1">
                        <span>Period Analysis</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                            {monthNumberToName(month)} {year}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href={`/api/export/csv?year=${year}&month=${month}`}
                        download
                        className="inline-flex items-center gap-2 rounded-2xl glass px-5 py-2.5 text-sm font-black text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                        <Download className="h-4 w-4 text-indigo-500" />
                        Export Data
                    </motion.a>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 rounded-[2rem] glass p-4 shadow-xl">
               <div className="flex flex-1 flex-wrap items-center gap-4">
                    <div className="relative group flex-1 min-w-[200px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search ledger entries..."
                            className="w-full rounded-2xl border-none bg-white/50 px-11 py-3 text-sm shadow-sm ring-1 ring-zinc-200 focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900/50 dark:ring-zinc-700 transition-all font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 glass bg-white/30 dark:bg-zinc-900/30 rounded-2xl px-3 py-1.5 ring-1 ring-zinc-200 dark:ring-zinc-800">
                           <Filter className="h-3.5 w-3.5 text-zinc-400" />
                           <select
                                value={month}
                                onChange={(e) => handleMonthChange(Number(e.target.value))}
                                className="bg-transparent text-sm font-black text-zinc-600 dark:text-zinc-300 outline-none cursor-pointer pr-4"
                            >
                                {MONTHS.map((m, i) => (
                                    <option key={m} value={i + 1} className="dark:bg-zinc-900">{m}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-1.5 glass bg-white/30 dark:bg-zinc-900/30 rounded-2xl px-3 py-1.5 ring-1 ring-zinc-200 dark:ring-zinc-800">
                           <select
                                value={year}
                                onChange={(e) => handleYearChange(Number(e.target.value))}
                                className="bg-transparent text-sm font-black text-zinc-600 dark:text-zinc-300 outline-none cursor-pointer"
                            >
                                {Array.from({ length: 10 }, (_, i) => now.getFullYear() - 5 + i).map((y) => (
                                    <option key={y} value={y} className="dark:bg-zinc-900">{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>
               </div>
            </div>

            <MonthlySummary year={year} month={month} />

            <div className="grid gap-8 lg:grid-cols-2">
                <MonthlyIncomes year={year} month={month} search={search} />
                <MonthlyExpenses year={year} month={month} search={search} />
            </div>
        </div>
    );
}
