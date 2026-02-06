import Link from "next/link";
import { LayoutDashboard, Calendar, BarChart3, TrendingUp } from "lucide-react";
import { CurrentMonthDetail } from "@/app/CurrentMonthDetail";

export default function HomePage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthNameRaw = now.toLocaleString("default", { month: "long" });
  const monthNameDisplay = now.toLocaleString("default", { month: "long", year: "numeric" });
  const monthlyPath = `/monthly/${year}/${monthNameRaw.toLowerCase()}`;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] shadow-lg">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              {monthNameDisplay}
            </h1>
          </div>
          <p className="text-[var(--text-secondary)]">
            Track and analyze your income, expenses, and investments
          </p>
        </div>
        <Link
          href={monthlyPath}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-white transition-all duration-200 hover:shadow-lg hover:brightness-110"
        >
          View Details
          <BarChart3 className="h-4 w-4" />
        </Link>
      </div>

      {/* Dashboard Content */}
      <CurrentMonthDetail year={year} month={month} />
    </div>
  );
}
