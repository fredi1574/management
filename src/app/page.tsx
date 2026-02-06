import Link from "next/link";
import { LayoutDashboard, Wallet, ArrowRight, TrendingUp, Calendar, ChevronRight } from "lucide-react";
import { CurrentMonthDetail } from "@/app/CurrentMonthDetail";

export default function HomePage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthNameDisplay = now.toLocaleString("default", { month: "long" });

  return (
    <div className="space-y-16 pb-24">
      <header className="relative py-20 px-8 overflow-hidden rounded-[3rem] bg-zinc-950 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-24 -mr-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-[100px]" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-96 w-96 rounded-full bg-amber-500/10 blur-[100px]" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            Active Capital Ledger
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-white md:text-7xl">
              Welcome, <span className="text-zinc-500 italic">User</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg font-medium text-zinc-400">
              Your decentralized financial ecosystem for <span className="text-white font-bold">precise tracking</span> and <span className="text-white font-bold">strategic growth</span>.
            </p>
          </div>
          
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-3 rounded-[1.25rem] bg-white/5 border border-white/10 px-6 py-3 backdrop-blur-md">
              <Calendar className="h-5 w-5 text-zinc-500" />
              <span className="font-black text-white uppercase tracking-widest text-xs">{monthNameDisplay} {year}</span>
            </div>
            <Link 
              href="/stocks"
              className="flex items-center gap-3 rounded-[1.25rem] bg-indigo-600 hover:bg-indigo-500 px-6 py-3 shadow-xl shadow-indigo-500/20 transition-all border border-indigo-500/50"
            >
               <TrendingUp className="h-5 w-5 text-white" />
               <span className="font-black text-white uppercase tracking-widest text-xs">Portfolio View</span>
               <ChevronRight className="h-4 w-4 text-white/50" />
            </Link>
          </div>
        </div>
      </header>

      <section className="px-1">
        <CurrentMonthDetail year={year} month={month} />
      </section>
    </div>
  );
}
