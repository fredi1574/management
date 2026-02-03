"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, BarChart3, TrendingUp, Wallet, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { monthNumberToName } from "@/lib/date-utils";

/**
 * Main app navigation with icons.
 */
export function Nav() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const now = new Date();
  const currentMonthName = monthNumberToName(now.getMonth() + 1).toLowerCase();
  const currentYear = now.getFullYear();
  const currentMonthlyPath = `/monthly/${currentYear}/${currentMonthName}`;
  const currentYearlyPath = `/yearly/${currentYear}`;

  const links = [
    { href: "/", label: "Home", icon: LayoutDashboard },
    { href: currentMonthlyPath, label: "Monthly", icon: Calendar },
    { href: currentYearlyPath, label: "Yearly", icon: BarChart3 },
    { href: "/stocks", label: "Stocks", icon: TrendingUp },
  ];

  return (
    <nav className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          <Wallet className="h-5 w-5 text-indigo-500" />
          <span className="hidden sm:inline">Finance</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              );
            })}
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </nav>
  );
}
