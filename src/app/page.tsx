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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            <LayoutDashboard className="h-7 w-7 text-indigo-500" />
            This month
          </h1>
        </div>
      </div>
      <CurrentMonthDetail year={year} month={month} />
    </div>
  );
}
