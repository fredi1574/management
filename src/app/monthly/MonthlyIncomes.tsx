"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { formatCurrency, formatDateInput } from "@/lib/format";
import type { Category, Income } from "@/types";

export function MonthlyIncomes({ year, month, search = "" }: { year: number; month: number; search?: string }) {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const load = useCallback(() => {
    const params = new URLSearchParams({ year: String(year), month: String(month) });
    if (search.trim()) params.set("search", search.trim());
    fetch(`/api/incomes?${params}`).then((r) => r.json()).then(setIncomes);
    fetch("/api/categories?type=income").then((r) => r.json()).then(setCategories);
  }, [year, month, search]);

  useEffect(() => load(), [load]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Delete this income?")) return;
      await fetch(`/api/incomes/${id}`, { method: "DELETE" });
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
          body: JSON.stringify({ name, color, type: "income" }),
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
        await fetch(`/api/incomes/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/incomes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setEditingId(null);
      setShowForm(false);
      setIsCreatingCategory(false);
      form.reset();
      load();
    },
    [editingId, load]
  );

  const defaultDate = `${year}-${String(month).padStart(2, "0")}-01`;

  return (
    <div className="card-elevated overflow-hidden rounded-2xl bg-[var(--card-bg)] ring-1 ring-[var(--border)]">
      <div className="space-y-5 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <CategoryIcon name="TrendingUp" className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Incomes</h2>
              <p className="text-xs text-[var(--text-secondary)]">{incomes.length} transaction{incomes.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
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
                : "bg-emerald-600 text-white hover:shadow-lg hover:brightness-110"
            }`}
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "Add"}
          </button>
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
                    defaultValue="#10b981"
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
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white transition duration-200 hover:shadow-lg hover:brightness-110"
            >
              {editingId ? "Save Change" : "Add Income"}
            </button>
          </form>
        )}

        <ul className="space-y-2.5">
          {incomes.map((item) => (
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
                <button type="submit" className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-sm text-white">Save</button>
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
              )}
            </li>
          ))}
        </ul>

        {incomes.length === 0 && !showForm && (
          <div className="rounded-xl border border-dashed border-[var(--border)] py-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              No incomes this month. Click Add to create one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
