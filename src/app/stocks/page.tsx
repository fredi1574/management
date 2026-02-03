"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { TrendingUp, Plus, Wallet, DollarSign, Pencil, Trash2, X, Layers, Activity } from "lucide-react";
import { formatCurrency, formatDateInput } from "@/lib/format";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { StockPurchase } from "@/types";

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
        throw new Error(data.error || "cFailed to save purchase");
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

  const now = new Date();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-xl animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300 space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {editing ? "Edit Purchase" : "Add Purchase"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Symbol</label>
            <input
              name="ticker"
              placeholder="e.g. AAPL"
              required
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Quantity</label>
            <input
              name="quantity"
              type="number"
              step="any"
              required
              placeholder="0.00"
              value={quantity || ""}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase">Total Paid</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-lg outline-none"
              >
                <option value="USD">USD</option>
                <option value="ILS">ILS</option>
              </select>
            </div>
            <input
              name="totalCost"
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={totalCost || ""}
              onChange={(e) => setTotalCost(Number(e.target.value))}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          {currency === "ILS" && (
            <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-left-2 duration-200">
              <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Exchange Rate (ILS/USD)</label>
              <input
                name="exchangeRate"
                type="number"
                step="0.0001"
                required
                value={exchangeRate || ""}
                onChange={(e) => setExchangeRate(Number(e.target.value))}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Purchase Date</label>
            <input
              name="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Market Value (USD)</label>
            <input
              name="currentValue"
              type="number"
              step="0.01"
              placeholder="Optional"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase ml-1">Notes</label>
            <input
              name="notes"
              placeholder="Notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        {currency === "ILS" && (
          <div className="mt-2 rounded-2xl bg-amber-50 p-4 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Final USD Equivalent:</span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400 tabular-nums">
                {formatUsd(usdEquivalent)}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl bg-zinc-100 py-3 text-sm font-bold text-zinc-600 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 rounded-xl py-3 text-sm font-bold text-white transition shadow-lg ${isSubmitting
              ? "bg-zinc-400 cursor-not-allowed"
              : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
              }`}
          >
            {isSubmitting ? "Saving..." : editing ? "Save Changes" : "Confirm Purchase"}
          </button>
        </div>
      </form>
    </div>
  );
}

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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          <span className="rounded-xl bg-amber-100 p-2 dark:bg-amber-900/50">
            <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </span>
          Portfolio History
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 disabled:opacity-50"
          >
            <Activity className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Refresh Prices"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setShowForm(!showForm);
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${showForm ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300" : "bg-amber-600 text-white hover:bg-amber-700 active:scale-95"
              }`}
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "Add purchase"}
          </button>
        </div>
      </div>

      {stocks.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:ring-zinc-800">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
            <Activity className="h-5 w-5 text-indigo-500" />
            Total Investment (USD)
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-zinc-100 dark:stroke-zinc-800" />
                <XAxis
                  dataKey="date"
                  className="text-xs text-zinc-400"
                  tick={{ fill: 'currentColor' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  className="text-xs text-zinc-400"
                  tick={{ fill: 'currentColor' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(v: number) => [formatUsd(v), "Cumulative Invested"]}
                />
                <Area
                  type="monotone"
                  dataKey="invested"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInvested)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className={`col-span-full flex flex-col items-center justify-center space-y-2 rounded-3xl p-8 text-center shadow-sm ring-1 ring-inset transition-all ${summary.profitLoss >= 0
            ? "bg-emerald-50 ring-emerald-200 dark:bg-emerald-900/20 dark:ring-emerald-800"
            : "bg-rose-50 ring-rose-200 dark:bg-rose-900/20 dark:ring-rose-800"
            }`}>
            <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Performance</p>
            <h2 className={`text-6xl font-black tabular-nums ${summary.profitLoss >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}>
              {summary.profitLoss >= 0 ? "+" : ""}{formatUsd(summary.profitLoss)}
            </h2>
            <p className={`flex items-center gap-1 text-xl font-bold ${summary.profitLoss >= 0 ? "text-emerald-600/80 dark:text-emerald-400/80" : "text-rose-600/80 dark:text-rose-400/80"
              }`}>
              {summary.totalInvested > 0 ? (summary.profitLoss / summary.totalInvested * 100).toFixed(2) : "0.00"}% ROI
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="rounded-xl bg-amber-100 p-2.5 dark:bg-amber-900/50">
              <Wallet className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Invested</p>
              <p className="text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{formatUsd(summary.totalInvested)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="rounded-xl bg-indigo-100 p-2.5 dark:bg-indigo-900/50">
              <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Market Value</p>
              <p className="text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{formatUsd(summary.totalCurrentValue)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="rounded-xl bg-purple-100 p-2.5 dark:bg-purple-900/50">
              <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Holdings</p>
              <p className="text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{stocks.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <div className="rounded-xl bg-blue-100 p-2.5 dark:bg-blue-900/50">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Active Tickers</p>
              <p className="text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{new Set(stocks.map(p => p.ticker)).size}</p>
            </div>
          </div>
        </div>
      )}
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

      {infoTicker && (
        <StockInfoModal
          ticker={infoTicker}
          onClose={() => setInfoTicker(null)}
        />
      )}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700 text-zinc-500 text-[11px] uppercase tracking-wider">
              <th className="px-5 py-3 text-left font-semibold">Date</th>
              <th className="px-5 py-3 text-left font-semibold">Stock</th>
              <th className="px-5 py-3 text-right font-semibold">Qty</th>
              <th className="px-5 py-3 text-right font-semibold">Total Paid</th>
              <th className="px-5 py-3 text-right font-semibold">Market Value</th>
              <th className="px-5 py-3 text-right font-semibold">P&L</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((p) => {
              const pl = value(p) - cost(p);
              return (
                <tr key={p.id} className="border-b border-zinc-100 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
                  <td className="px-5 py-3 text-zinc-900 dark:text-zinc-100">{formatDateInput(new Date(p.date))}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <button
                      onClick={() => setInfoTicker(p.ticker)}
                      className="group flex flex-col items-start gap-0.5 text-left"
                    >
                      <span className="font-bold text-zinc-900 group-hover:text-amber-600 dark:text-zinc-100 dark:group-hover:text-amber-400 transition-colors">
                        {p.ticker}
                      </span>
                      {p.name && (
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-[120px]">
                          {p.name}
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{p.quantity}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{formatUsd(cost(p))}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{formatUsd(value(p))}</td>
                  <td className={`px-5 py-3 text-right font-medium tabular-nums ${pl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {formatUsd(pl)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => { setEditingId(p.id); setShowForm(true); }}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
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
      </div>
      {stocks.length === 0 && !showForm && (
        <p className="rounded-2xl border border-dashed border-zinc-200 bg-white py-12 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          No stock purchases in this period. Click Add purchase to add one.
        </p>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4">
            <Activity className="h-8 w-8 animate-spin text-amber-600" />
            <p className="text-sm font-medium text-zinc-500">Fetching market data...</p>
          </div>
        ) : info?.error ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 p-8 text-center">
            <X className="h-8 w-8 text-rose-500" />
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{info.error}</p>
            <button onClick={onClose} className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-bold dark:bg-zinc-800">Close</button>
          </div>
        ) : (
          <>
            <div className="bg-zinc-50 p-6 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{info.ticker}</h2>
                    <span className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      {info.exchange}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{info.name}</p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full bg-white p-2 text-zinc-400 shadow-sm transition hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {formatCurrency(info.price, info.currency)}
                </span>
                <div className={`flex items-center gap-1 text-sm font-bold ${info.change >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {info.change >= 0 ? "+" : ""}{info.change?.toFixed(2)} ({info.changePercent?.toFixed(2)}%)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-zinc-100 dark:bg-zinc-800">
              <div className="bg-white p-6 dark:bg-zinc-900/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Day High</p>
                <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(info.dayHigh, info.currency)}</p>
              </div>
              <div className="bg-white p-6 dark:bg-zinc-900/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Day Low</p>
                <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(info.dayLow, info.currency)}</p>
              </div>
              <div className="bg-white p-6 dark:bg-zinc-900/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">52W High</p>
                <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(info.high52, info.currency)}</p>
              </div>
              <div className="bg-white p-6 dark:bg-zinc-900/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">52W Low</p>
                <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(info.low52, info.currency)}</p>
              </div>
              <div className="col-span-2 bg-white p-6 dark:bg-zinc-900/50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Volume</p>
                    <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">{info.volume?.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Previous Close</p>
                    <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(info.previousClose, info.currency)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 text-center">
              <p className="text-[10px] text-zinc-400 font-medium italic">Data provided by Yahoo Finance • Delayed by 15 mins</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
