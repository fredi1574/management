"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { TrendingUp, Plus, Wallet, DollarSign, Pencil, Trash2, X, Layers, Activity, Calendar, Info, ChevronRight, ArrowUpRight } from "lucide-react";
import { formatCurrency, formatDateInput } from "@/lib/format";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { StockPurchase } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

const formatUsd = (value: number) => formatCurrency(value, "USD");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface StocksSummary {
  totalInvested: number;
  totalCostWithFees: number;
  totalCurrentValue: number;
  profitLoss: number;
  count: number;
}

function StocksForm({
  editing,
  onSuccess,
  onCancel,
}: {
  editing: StockPurchase | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [currency, setCurrency] = useState(editing?.currency ?? "USD");
  const [exchangeRate, setExchangeRate] = useState(editing?.exchangeRate ?? 3.7);
  const [quantity, setQuantity] = useState(editing?.quantity ?? 0);
  const [totalCost, setTotalCost] = useState(editing ? editing.quantity * editing.pricePerUnit : 0);
  const [ticker, setTicker] = useState(editing?.ticker ?? "");
  const [date, setDate] = useState(editing ? formatDateInput(new Date(editing.date)) : formatDateInput(new Date()));
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [currentValue, setCurrentValue] = useState(editing?.currentValue?.toString() ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const finalTotalUsd = currency === "ILS" ? totalCost / (exchangeRate || 1) : totalCost;
      const payload = {
        ticker,
        quantity,
        pricePerUnit: quantity > 0 ? finalTotalUsd / quantity : 0,
        date,
        broker: null,
        fee: null,
        notes: notes || null,
        currentValue: currentValue ? Number(currentValue) : null,
        currency,
        exchangeRate: currency === "ILS" ? exchangeRate : null,
      };

      const res = await fetch(editing ? `/api/stocks/${editing.id}` : "/api/stocks", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save purchase");
      }

      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const usdEquivalent = currency === "ILS" ? totalCost / exchangeRate : totalCost;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md transition-opacity"
        onClick={onCancel}
      />
      <motion.form
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onSubmit={handleSubmit}
        className="relative w-full max-w-xl space-y-6 rounded-[2.5rem] glass p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
              {editing ? "Refine Entry" : "New Investment"}
            </h2>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Asset Acquisition Details</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full h-10 w-10 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Symbol / Ticker</label>
            <div className="relative group">
               <Activity className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-hover:text-amber-500 transition-colors" />
               <input
                name="ticker"
                placeholder="e.g. NVDA"
                required
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="w-full rounded-2xl border-none bg-white/50 px-11 py-3.5 shadow-sm ring-1 ring-zinc-200 focus:ring-2 focus:ring-amber-500 dark:bg-zinc-900/50 dark:ring-zinc-700"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Asset Quantity</label>
            <div className="relative group">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-hover:text-amber-500 transition-colors" />
              <input
                name="quantity"
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={quantity || ""}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-2xl border-none bg-white/50 px-11 py-3.5 shadow-sm ring-1 ring-zinc-200 focus:ring-2 focus:ring-amber-500 dark:bg-zinc-900/50 dark:ring-zinc-700"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Capital Spent</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/40 px-2 py-1 rounded-lg outline-none cursor-pointer"
              >
                <option value="USD">USD ($)</option>
                <option value="ILS">ILS (₪)</option>
              </select>
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
                {currency === "USD" ? "$" : "₪"}
              </div>
              <input
                name="totalCost"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={totalCost || ""}
                onChange={(e) => setTotalCost(Number(e.target.value))}
                className="w-full rounded-2xl border-none bg-white/50 px-11 py-3.5 shadow-sm ring-1 ring-zinc-200 focus:ring-2 focus:ring-amber-500 dark:bg-zinc-900/50 dark:ring-zinc-700"
              />
            </div>
          </div>

          {currency === "ILS" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="space-y-1.5"
            >
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">FX Rate (ILS/USD)</label>
              <input
                name="exchangeRate"
                type="number"
                step="0.0001"
                required
                value={exchangeRate || ""}
                onChange={(e) => setExchangeRate(Number(e.target.value))}
                className="w-full rounded-2xl border-none bg-white/50 px-4 py-3.5 shadow-sm ring-1 ring-zinc-200 focus:ring-2 focus:ring-amber-500 dark:bg-zinc-900/50 dark:ring-zinc-700"
              />
            </motion.div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Acquisition Date</label>
            <div className="relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-hover:text-amber-500 transition-colors" />
              <input
                name="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-2xl border-none bg-white/50 px-11 py-3.5 shadow-sm ring-1 ring-zinc-200 focus:ring-2 focus:ring-amber-500 dark:bg-zinc-900/50 dark:ring-zinc-700"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Market Value (Optional)</label>
             <div className="relative group">
              <ArrowUpRight className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-hover:text-amber-500 transition-colors" />
              <input
                name="currentValue"
                type="number"
                step="0.01"
                placeholder="Price in USD"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="w-full rounded-2xl border-none bg-white/50 px-11 py-3.5 shadow-sm ring-1 ring-zinc-200 focus:ring-2 focus:ring-amber-500 dark:bg-zinc-900/50 dark:ring-zinc-700"
              />
            </div>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Strategic Notes</label>
            <div className="relative group">
              <Info className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-hover:text-amber-500 transition-colors" />
              <input
                name="notes"
                placeholder="Rationale for purchase..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-2xl border-none bg-white/50 px-11 py-3.5 shadow-sm ring-1 ring-zinc-200 focus:ring-2 focus:ring-amber-500 dark:bg-zinc-900/50 dark:ring-zinc-700"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 ring-1 ring-rose-100 dark:ring-rose-900/50">
            {error}
          </div>
        )}

        <AnimatePresence>
          {currency === "ILS" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl bg-amber-50/50 p-4 dark:bg-amber-900/20 ring-1 ring-amber-100/50 dark:ring-amber-900/30"
            >
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-amber-700/70 dark:text-amber-400/70 uppercase">USD Net Investment</span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-300 tabular-nums">
                  {formatUsd(usdEquivalent)}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-[1.25rem] bg-zinc-100 py-3.5 text-sm font-black text-zinc-500 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 rounded-[1.25rem] py-3.5 text-sm font-black text-white transition shadow-xl ${isSubmitting
              ? "bg-zinc-400 cursor-not-allowed"
              : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/30 active:scale-95"
              }`}
          >
            {isSubmitting ? "Processing..." : editing ? "Save Refinements" : "Initiate Purchase"}
          </button>
        </div>
      </motion.form>
    </div>
  );
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

export default function StocksPage() {
  const [stocks, setStocks] = useState<StockPurchase[]>([]);
  const [summary, setSummary] = useState<StocksSummary | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [infoTicker, setInfoTicker] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/stocks").then((r) => r.json()).then(setStocks);
    fetch("/api/stocks/summary").then((r) => r.json()).then(setSummary);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/stocks/sync", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      load();
    } catch (err) {
      console.error(err);
      alert("Failed to sync prices. Please try again later.");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => load(), [load]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Delete this purchase?")) return;
      await fetch(`/api/stocks/${id}`, { method: "DELETE" });
      load();
    },
    [load]
  );

  const cost = (p: StockPurchase) => p.quantity * p.pricePerUnit;
  const value = (p: StockPurchase) => (p.currentValue != null ? p.currentValue : p.quantity * p.pricePerUnit);

  const chartData = useMemo(() => {
    const sorted = [...stocks].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let cumulative = 0;
    return sorted.map((p) => {
      cumulative += cost(p);
      return {
        date: formatDateInput(new Date(p.date)),
        invested: Number(cumulative.toFixed(2)),
      };
    });
  }, [stocks]);

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 shadow-xl shadow-amber-500/30">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            Equity Portfolio
          </h1>
          <p className="text-zinc-500 font-medium pl-1 gap-2 flex items-center">
            Tracking <span className="font-bold text-zinc-900 dark:text-zinc-100">{stocks.length}</span> positions worth 
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{summary ? formatUsd(summary.totalCurrentValue) : "$0.00"}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 rounded-2xl border-none glass px-5 py-2.5 text-sm font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 disabled:opacity-50"
          >
            <Activity className={`h-4 w-4 text-amber-500 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing Market..." : "Live Update"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => {
              setEditingId(null);
              setShowForm(!showForm);
            }}
            className={`inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-black transition shadow-xl ${showForm 
              ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" 
              : "bg-amber-600 text-white shadow-amber-600/30 hover:bg-amber-700"
              }`}
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "Add Buy Order"}
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {stocks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.5rem] glass p-8 shadow-xl"
          >
            <div className="mb-8 flex items-center justify-between px-2">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100">Cumulative Progress</h2>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Historical cost basis (USD)</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
                <Activity className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
            <div className="h-72 w-full px-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-zinc-100 dark:stroke-zinc-800" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    className="text-[10px] font-bold text-zinc-400"
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    className="text-[10px] font-bold text-zinc-400"
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-2xl glass px-4 py-3 shadow-xl border-none">
                            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">{payload[0].payload.date}</p>
                            <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                              {formatUsd(payload[0].value as number)}
                            </p>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Invested Capital</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="invested"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorInvested)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {summary && (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            <motion.div 
              variants={item}
              className={`col-span-full flex flex-col items-center justify-center space-y-3 rounded-[2.5rem] p-12 text-center shadow-xl ring-1 ring-inset transition-all ${summary.profitLoss >= 0
              ? "bg-emerald-50/50 ring-emerald-200/50 dark:bg-emerald-950/20 dark:ring-emerald-900/30"
              : "bg-rose-50/50 ring-rose-200/50 dark:bg-rose-950/20 dark:ring-rose-900/30"
              }`}
            >
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Total Capital P&L</p>
                <h2 className={`text-7xl font-black tabular-nums tracking-tighter ${summary.profitLoss >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}>
                  {summary.profitLoss >= 0 ? "+" : ""}{formatUsd(summary.profitLoss)}
                </h2>
              </div>
              <div className={`flex items-center gap-2 rounded-full px-5 py-2 text-lg font-black shadow-lg ${summary.profitLoss >= 0 
                ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                : "bg-rose-500 text-white shadow-rose-500/20"
                }`}>
                {summary.totalInvested > 0 ? (summary.profitLoss / summary.totalInvested * 100).toFixed(2) : "0.00"}% ROI
              </div>
            </motion.div>

            <motion.div variants={item} className="group flex items-center gap-5 rounded-3xl glass p-6 shadow-sm transition-all hover:shadow-md card-shine">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
                <Wallet className="h-7 w-7 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Invested</p>
                <p className="text-xl font-black tabular-nums text-zinc-900 dark:text-zinc-100">{formatUsd(summary.totalInvested)}</p>
              </div>
            </motion.div>
            <motion.div variants={item} className="group flex items-center gap-5 rounded-3xl glass p-6 shadow-sm transition-all hover:shadow-md card-shine">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
                <DollarSign className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Market Valuation</p>
                <p className="text-xl font-black tabular-nums text-zinc-900 dark:text-zinc-100">{formatUsd(summary.totalCurrentValue)}</p>
              </div>
            </motion.div>
            <motion.div variants={item} className="group flex items-center gap-5 rounded-3xl glass p-6 shadow-sm transition-all hover:shadow-md card-shine">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/30">
                <Layers className="h-7 w-7 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Holdings</p>
                <p className="text-xl font-black tabular-nums text-zinc-900 dark:text-zinc-100">{stocks.length}</p>
              </div>
            </motion.div>
            <motion.div variants={item} className="group flex items-center gap-5 rounded-3xl glass p-6 shadow-sm transition-all hover:shadow-md card-shine">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
                <Activity className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Diversification</p>
                <p className="text-xl font-black tabular-nums text-zinc-900 dark:text-zinc-100">{new Set(stocks.map(p => p.ticker)).size} Tickers</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <StocksForm
            editing={editingId ? stocks.find((s) => s.id === editingId) ?? null : null}
            onSuccess={() => {
              setEditingId(null);
              setShowForm(false);
              load();
            }}
            onCancel={() => {
              setEditingId(null);
              setShowForm(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {infoTicker && (
          <StockInfoModal
            ticker={infoTicker}
            onClose={() => setInfoTicker(null)}
          />
        )}
      </AnimatePresence>
      <motion.div 
        variants={item}
        className="overflow-hidden rounded-[2.5rem] glass shadow-xl"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-800/50">
              <th className="px-8 py-5 text-left font-black uppercase tracking-widest text-[10px] text-zinc-400">Acquisition Date</th>
              <th className="px-8 py-5 text-left font-black uppercase tracking-widest text-[10px] text-zinc-400">Equity Asset</th>
              <th className="px-8 py-5 text-right font-black uppercase tracking-widest text-[10px] text-zinc-400">Quantity</th>
              <th className="px-8 py-5 text-right font-black uppercase tracking-widest text-[10px] text-zinc-400">Cost Basis</th>
              <th className="px-8 py-5 text-right font-black uppercase tracking-widest text-[10px] text-zinc-400">Market Value</th>
              <th className="px-8 py-5 text-right font-black uppercase tracking-widest text-[10px] text-zinc-400">Unrealized P&L</th>
              <th className="px-8 py-5 text-right font-black uppercase tracking-widest text-[10px] text-zinc-400">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {stocks.map((p) => {
              const pl = value(p) - cost(p);
              return (
                <tr key={p.id} className="group transition-colors hover:bg-zinc-50/30 dark:hover:bg-zinc-800/30">
                  <td className="px-8 py-4 font-bold text-zinc-500 tabular-nums">{formatDateInput(new Date(p.date))}</td>
                  <td className="px-8 py-4">
                    <button
                      onClick={() => setInfoTicker(p.ticker)}
                      className="group/ticker flex flex-col items-start gap-0.5 text-left"
                    >
                      <span className="font-black text-zinc-900 group-hover/ticker:text-amber-600 dark:text-zinc-100 dark:group-hover/ticker:text-amber-400 transition-colors">
                        {p.ticker}
                      </span>
                      {p.name && (
                        <span className="text-[10px] text-zinc-400 font-bold truncate max-w-[120px] uppercase tracking-wider">
                          {p.name}
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-8 py-4 text-right tabular-nums font-bold text-zinc-600 dark:text-zinc-300">{p.quantity}</td>
                  <td className="px-8 py-4 text-right tabular-nums font-black text-zinc-900 dark:text-zinc-100">{formatUsd(cost(p))}</td>
                  <td className="px-8 py-4 text-right tabular-nums font-black text-zinc-900 dark:text-zinc-100">{formatUsd(value(p))}</td>
                  <td className={`px-8 py-4 text-right font-black tabular-nums ${pl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    <div className="flex flex-col items-end">
                      <span>{pl >= 0 ? "+" : ""}{formatUsd(pl)}</span>
                      <span className="text-[10px] opacity-70">
                         {cost(p) > 0 ? ((pl / cost(p)) * 100).toFixed(2) : "0.00"}%
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => { setEditingId(p.id); setShowForm(true); }}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-amber-600 dark:hover:bg-zinc-800"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>
      {stocks.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-[2.5rem] border border-dashed border-zinc-200 dark:border-zinc-800 glass">
          <div className="rounded-full bg-zinc-50 p-4 dark:bg-zinc-800/30 mb-4">
             <Layers className="h-10 w-10 text-zinc-200 dark:text-zinc-700" />
          </div>
          <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">Digital Vault Empty</p>
          <p className="text-xs font-medium text-zinc-400 mt-1">Initiate a buy order to begin tracking</p>
        </div>
      )}
    </div>
  );
}

function StockInfoModal({ ticker, onClose }: { ticker: string; onClose: () => void }) {
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/stocks/info/${ticker}`)
      .then((r) => r.json())
      .then((data) => {
        setInfo(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [ticker]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] glass shadow-2xl"
      >
        <div className="bg-zinc-50/50 p-8 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
          {loading ? (
             <div className="flex h-32 flex-col items-center justify-center gap-4">
                <Activity className="h-8 w-8 animate-spin text-amber-600" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Syncing Market Data</p>
             </div>
          ) : info?.error ? (
              <div className="flex flex-col items-center justify-center gap-4 py-8 text-center text-rose-500">
                 <X className="h-10 w-10" />
                 <p className="text-sm font-black uppercase tracking-widest">{info.error}</p>
              </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{info.ticker}</h2>
                    <span className="rounded-xl bg-white/50 px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm dark:bg-zinc-800/50 ring-1 ring-zinc-200 dark:ring-zinc-700">
                      {info.exchange}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-wide">{info.name}</p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full bg-white h-10 w-10 flex items-center justify-center text-zinc-400 shadow-sm transition hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 ring-1 ring-zinc-200 dark:ring-zinc-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums tracking-tighter">
                  {formatCurrency(info.price, info.currency)}
                </span>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-lg ${info.change >= 0 ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-rose-500 text-white shadow-rose-500/20"}`}>
                  {info.change >= 0 ? "+" : ""}{info.change?.toFixed(2)} ({info.changePercent?.toFixed(2)}%)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-px bg-zinc-200/50 dark:bg-zinc-800/50 rounded-2xl overflow-hidden ring-1 ring-zinc-200/50 dark:ring-zinc-800/50">
                <div className="bg-white/50 p-5 dark:bg-zinc-900/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Session High</p>
                  <p className="mt-1 text-lg font-black text-zinc-900 dark:text-zinc-50 tabular-nums">{formatCurrency(info.dayHigh, info.currency)}</p>
                </div>
                <div className="bg-white/50 p-5 dark:bg-zinc-900/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Session Low</p>
                  <p className="mt-1 text-lg font-black text-zinc-900 dark:text-zinc-50 tabular-nums">{formatCurrency(info.dayLow, info.currency)}</p>
                </div>
                <div className="bg-white/50 p-5 dark:bg-zinc-900/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">52W Extreme</p>
                  <p className="mt-1 text-lg font-black text-zinc-900 dark:text-zinc-50 tabular-nums">{formatCurrency(info.high52, info.currency)}</p>
                </div>
                <div className="bg-white/50 p-5 dark:bg-zinc-900/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Volume</p>
                  <p className="mt-1 text-lg font-black text-zinc-900 dark:text-zinc-50 tabular-nums">{info.volume?.toLocaleString()}</p>
                </div>
              </div>

              <div className="px-1 text-center">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] italic">Delayed execution • Yahoo API</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
