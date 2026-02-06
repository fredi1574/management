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
    <nav className="sticky top-0 z-10 border-b border-[var(--border)]/40 bg-white/80 backdrop-blur-xl dark:bg-[var(--card-bg)]/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2 font-bold text-[var(--text-primary)] transition duration-200 hover:bg-[var(--background-secondary)] dark:hover:bg-[var(--background-secondary)]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] shadow-lg">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="hidden sm:inline bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] bg-clip-text text-transparent">
            Finance
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <div className="flex gap-1 rounded-xl bg-[var(--background-secondary)] p-1 dark:bg-[var(--background-secondary)]/50">
            {links.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition duration-200 ${
                    isActive
                      ? "bg-white text-[var(--primary)] shadow-md dark:bg-[var(--card-bg)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:text-[var(--text-tertiary)] dark:hover:text-[var(--text-primary)]"
                  }`}
                  title={label}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              );
            })}
          </div>
          <button
            onClick={toggleTheme}
            className="ml-2 rounded-lg p-2 text-[var(--text-secondary)] transition duration-200 hover:bg-[var(--background-secondary)] hover:text-[var(--text-primary)]"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </nav>
  );
}
