"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2, X, List, LayoutGrid } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { formatCurrency, formatDateInput } from "@/lib/format";
import type { Category, Expense } from "@/types";

/**
 * Lists and manages expense entries for the selected month.
 */
export function MonthlyExpenses({ year, month, search = "" }: { year: number; month: number; search?: string }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isGrouped, setIsGrouped] = useState(false);

  const load = useCallback(() => {
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    if (search.trim()) params.set("search", search.trim());
    fetch(`/api/expenses?${params}`).then((r) => r.json()).then(setExpenses);
    fetch("/api/categories?type=expense").then((r) => r.json()).then(setCategories);
  }, [year, month, search]);

  useEffect(() => load(), [load]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Delete this expense?")) return;
      await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      load();
    },
    [load]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      let categoryId = (form.querySelector('[name="categoryId"]') as HTMLSelectElement).value;

      if (categoryId === "new") {
        const name = (form.querySelector('[name="newCategoryName"]') as HTMLInputElement).value;
        const color = (form.querySelector('[name="newCategoryColor"]') as HTMLInputElement).value;

        const catRes = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, color, type: "expense" }),
        });
        const newCat = await catRes.json();
        categoryId = newCat.id;
      }

      const payload = {
        amount: Number((form.querySelector('[name="amount"]') as HTMLInputElement).value),
        categoryId,
        date: (form.querySelector('[name="date"]') as HTMLInputElement).value,
        notes: (form.querySelector('[name="notes"]') as HTMLInputElement).value || null,
        isRecurring: (form.querySelector('[name="isRecurring"]') as HTMLInputElement).checked,
      };

      if (editingId) {
        await fetch(`/api/expenses/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }
      setEditingId(null);
      setShowForm(false);
      setIsCreatingCategory(false);
      form.reset();
      load();
    },
    [editingId, load]
  );

  const groupedExpenses = useMemo(() => {
    const groups: Record<string, { category: Category; items: Expense[]; total: number }> = {};
    expenses.forEach((item) => {
      if (!groups[item.categoryId]) {
        groups[item.categoryId] = { category: item.category, items: [], total: 0 };
      }
      groups[item.categoryId].items.push(item);
      groups[item.categoryId].total += item.amount;
    });
    return Object.values(groups).sort((a, b) => b.total - a.total);
  }, [expenses]);

  const defaultDate = `${year}-${String(month).padStart(2, "0")}-01`;
  return (
    <div className="card-elevated overflow-hidden rounded-2xl bg-[var(--card-bg)] ring-1 ring-[var(--border)] dark:ring-[var(--border)]">
      <div className="space-y-5 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
              <CategoryIcon name="TrendingDown" className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Expenses</h2>
              <p className="text-xs text-[var(--text-secondary)]">{expenses.length} transaction{expenses.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setIsGrouped(!isGrouped)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--background-secondary)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition duration-200 hover:bg-[var(--border)] hover:text-[var(--text-primary)]"
              title={isGrouped ? "Show individual" : "Group by category"}
            >
              {isGrouped ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
              <span className="hidden sm:inline">{isGrouped ? "List" : "Group"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setShowForm(!showForm);
                setIsCreatingCategory(false);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition duration-200 ${
                showForm
                  ? "bg-[var(--background-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  : "bg-red-600 text-white hover:shadow-lg hover:brightness-110"
              }`}
            >
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? "Cancel" : "Add"}
            </button>
          </div>
        </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] p-5">
          <input
            name="amount"
            type="number"
            step="0.01"
            required
            placeholder="Amount (ILS)"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
          />
          <div className="space-y-2">
            <select
              name="categoryId"
              required
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2.5 text-[var(--text-primary)] transition focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
              onChange={(e) => setIsCreatingCategory(e.target.value === "new")}
            >
              <option value="" disabled selected>Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="new" className="font-semibold">+ New Category...</option>
            </select>
            {isCreatingCategory && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                <input
                  name="newCategoryName"
                  type="text"
                  required
                  placeholder="Category Name"
                  className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                />
                <input
                  name="newCategoryColor"
                  type="color"
                  defaultValue="#ef4444"
                  className="h-10 w-16 rounded-lg border border-[var(--border)]"
                />
              </div>
            )}
          </div>
          <input
            name="date"
            type="date"
            defaultValue={defaultDate}
            required
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
          />
          <input
            name="notes"
            type="text"
            placeholder="Notes (optional)"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
          />
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <input name="isRecurring" type="checkbox" className="rounded border-[var(--border)]" />
            Recurring transaction
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition duration-200 hover:shadow-lg hover:brightness-110"
          >
            {editingId ? "Save Change" : "Add Expense"}
          </button>
        </form>
      )}

      {isGrouped ? (
        <div className="space-y-6">
          {groupedExpenses.map(({ category, items, total }) => (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg p-1" style={{ backgroundColor: `${category.color}20` }}>
                    <CategoryIcon name={category.icon} categoryName={category.name} className="h-4 w-4" style={{ color: category.color }} />
                  </span>
                  <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{category.name}</h3>
                </div>
                <span className="text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{formatCurrency(total)}</span>
              </div>
              <ul className="space-y-1 pl-5">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between py-1 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="text-zinc-600 dark:text-zinc-400">
                        {item.notes || "No notes"}
                        <span className="ml-2 text-xs text-zinc-400">{new Date(item.date).toLocaleDateString()}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="tabular-nums text-zinc-700 dark:text-zinc-300">{formatCurrency(item.amount)}</span>
                      <div className="flex gap-0.5">
                        <button onClick={() => setEditingId(item.id)} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDelete(item.id)} className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <ul className="space-y-2.5">
          {expenses.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--background-secondary)]/50 px-4 py-3 transition duration-200 hover:bg-[var(--background-secondary)] hover:ring-1 hover:ring-[var(--primary)]/20"
            >
              {editingId === item.id ? (
                <form onSubmit={(e) => { handleSubmit(e); setEditingId(null); }} className="flex w-full flex-wrap items-end gap-2">
                  <input name="amount" type="number" step="0.01" defaultValue={item.amount} required className="w-24 rounded-lg border px-2 py-1.5 dark:bg-zinc-800" />
                  <select name="categoryId" defaultValue={item.categoryId} className="rounded-lg border px-2 py-1.5 dark:bg-zinc-800">
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <input name="date" type="date" defaultValue={formatDateInput(new Date(item.date))} className="rounded-lg border px-2 py-1.5 dark:bg-zinc-800" />
                  <input name="notes" type="text" defaultValue={item.notes ?? ""} className="min-w-[100px] flex-1 rounded-lg border px-2 py-1.5 dark:bg-zinc-800" />
                  <label className="flex items-center gap-1 text-sm">
                    <input name="isRecurring" type="checkbox" defaultChecked={item.isRecurring} className="rounded" />
                    Recurring
                  </label>
                  <button type="submit" className="rounded-lg bg-red-600 px-2.5 py-1.5 text-sm text-white">Save</button>
                  <button type="button" onClick={() => setEditingId(null)} className="rounded-lg px-2.5 py-1.5 text-sm text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700">Cancel</button>
                </form>
              ) : (
                <>
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="rounded-lg p-1.5" style={{ backgroundColor: `${item.category.color}20` }}>
                      <CategoryIcon name={item.category.icon} categoryName={item.category.name} className="h-4 w-4" style={{ color: item.category.color }} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold tabular-nums text-[var(--text-primary)]">{formatCurrency(item.amount)}</p>
                      <p className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                        <span className="rounded-md px-1.5 py-0.5 text-xs font-medium" style={{ backgroundColor: `${item.category.color}15`, color: item.category.color }}>{item.category.name}</span>
                        {item.notes && <span>· {item.notes}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => setEditingId(item.id)} className="rounded-lg p-2 text-[var(--text-tertiary)] transition hover:bg-[var(--background-secondary)] hover:text-[var(--text-primary)]" aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleDelete(item.id)} className="rounded-lg p-2 text-[var(--text-tertiary)] transition hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}
