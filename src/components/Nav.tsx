"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, BarChart3, TrendingUp, Wallet, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { monthNumberToName } from "@/lib/date-utils";
import { motion, AnimatePresence } from "framer-motion";

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
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: currentMonthlyPath, label: "Monthly", icon: Calendar },
    { href: currentYearlyPath, label: "Yearly", icon: BarChart3 },
    { href: "/stocks", label: "Wealth", icon: TrendingUp },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all duration-300"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-110">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="hidden font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:inline text-lg">
            Capital<span className="text-indigo-600">Flow</span>
          </span>
        </Link>
        <div className="flex items-center gap-1.5 md:gap-3">
          <div className="flex items-center p-1 bg-zinc-100/50 dark:bg-zinc-800/50 rounded-2xl">
            {links.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute inset-0 z-0 rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${isActive ? "animate-pulse" : ""}`} />
                    <span className="hidden md:inline">{label}</span>
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100/50 text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-700/50 dark:hover:text-zinc-100 transition-colors"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ y: 20, opacity: 0, rotate: 45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -20, opacity: 0, rotate: -45 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </nav>
  );
}
