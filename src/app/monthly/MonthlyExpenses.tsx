"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2, X, List, LayoutGrid, Receipt, Calendar as CalendarIcon, Tag, Info, Wallet } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { formatCurrency, formatDateInput } from "@/lib/format";
import type { Category, Expense } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Lists and manages expense entries for the selected month.
 */
export function MonthlyExpenses({ year, month, search = "" }: { year: number; month: number; search?: string }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isGrouped, setIsGrouped] = useState(true);

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
    <div className="rounded-3xl glass p-6 shadow-xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2.5 text-xl font-black text-zinc-900 dark:text-zinc-100">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30">
              <Receipt className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </span>
            Expense Log
          </h2>
          <p className="text-sm font-medium text-zinc-500 pl-12">Track where your money goes</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsGrouped(!isGrouped)}
            className="flex h-10 w-10 items-center justify-center rounded-xl glass hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title={isGrouped ? "Show individual" : "Group by category"}
          >
            {isGrouped ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingId(null);
              setShowForm(!showForm);
              setIsCreatingCategory(false);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold shadow-lg transition-all ${showForm
              ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              : "bg-rose-600 text-white shadow-rose-600/20 hover:bg-rose-700"
              }`}
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "Add New"}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="overflow-hidden space-y-4 rounded-2xl bg-zinc-50/50 p-5 dark:bg-zinc-800/20 border border-dashed border-zinc-200 dark:border-zinc-700"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 ml-1">
                  <Receipt className="h-3 w-3" /> Description
                </label>
                <input name="notes" type="text" placeholder="What was this for?" className="w-full rounded-xl border-none bg-white px-4 py-2.5 shadow-sm ring-1 ring-zinc-200 focus:ring-2 focus:ring-rose-500 dark:bg-zinc-900 dark:ring-zinc-700" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 ml-1">
                  <Wallet className="h-3 w-3" /> Amount (ILS)
                </label>
                <input name="amount" type="number" step="0.01" required placeholder="0.00" className="w-full rounded-xl border-none bg-white px-4 py-2.5 shadow-sm ring-1 ring-zinc-200 focus:ring-2 focus:ring-rose-500 dark:bg-zinc-900 dark:ring-zinc-700" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 ml-1">
                  <Tag className="h-3 w-3" /> Category
                </label>
                <select
                  name="categoryId"
                  required
                  className="w-full rounded-xl border-none bg-white px-4 py-2.5 shadow-sm ring-1 ring-zinc-200 focus:ring-2 focus:ring-rose-500 dark:bg-zinc-900 dark:ring-zinc-700"
                  onChange={(e) => setIsCreatingCategory(e.target.value === "new")}
                >
                  <option value="" disabled selected>Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  <option value="new" className="font-bold text-rose-600 dark:text-rose-400">+ Add New Category</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 ml-1">
                  <CalendarIcon className="h-3 w-3" /> Date
                </label>
                <input name="date" type="date" defaultValue={defaultDate} required className="w-full rounded-xl border-none bg-white px-4 py-2.5 shadow-sm ring-1 ring-zinc-200 focus:ring-2 focus:ring-rose-500 dark:bg-zinc-900 dark:ring-zinc-700" />
              </div>
            </div>

            <AnimatePresence>
              {isCreatingCategory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex gap-3 pt-2"
                >
                  <input name="newCategoryName" type="text" required placeholder="Category Name" className="flex-1 rounded-xl border-none bg-white px-4 py-2.5 shadow-sm ring-1 ring-zinc-200 focus:ring-2 focus:ring-rose-500 dark:bg-zinc-900 dark:ring-zinc-700" />
                  <input name="newCategoryColor" type="color" defaultValue="#ef4444" className="h-[46px] w-16 p-1.5 rounded-xl border-none bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input name="isRecurring" type="checkbox" className="peer sr-only" />
                  <div className="h-6 w-11 rounded-full bg-zinc-200 transition peer-checked:bg-rose-600 dark:bg-zinc-700" />
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
                </div>
                <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200">Recurring Expense</span>
              </label>
              <button type="submit" className="rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-zinc-900/20 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                {editingId ? "Update Entry" : "Save Expense"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="min-h-[200px]">
        {isGrouped ? (
          <div className="space-y-8">
            {groupedExpenses.map(({ category, items, total }) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={category.id}
                className="group"
              >
                <div className="flex items-end justify-between border-b pb-2 mb-3 px-1 border-zinc-100 dark:border-zinc-800 transition-colors group-hover:border-rose-500/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                      <CategoryIcon name={category.icon} categoryName={category.name} className="h-4 w-4" style={{ color: category.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">{category.name}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{items.length} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{formatCurrency(total)}</p>
                    <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full mt-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        className="h-full"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                  </div>
                </div>
                <ul className="space-y-1 pl-11">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between group/item py-1.5 transition-all">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 group-hover/item:text-zinc-900 dark:group-hover/item:text-zinc-200 transition-colors">
                          {item.notes || "No description"}
                          <span className="ml-3 text-[10px] font-bold text-zinc-300 dark:text-zinc-600">{new Date(item.date).toLocaleDateString()}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold tabular-nums text-zinc-700 dark:text-zinc-300">{formatCurrency(item.amount)}</span>
                        <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <button onClick={() => setEditingId(item.id)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 dark:hover:bg-zinc-800 dark:hover:text-indigo-400"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleDelete(item.id)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        ) : (
          <ul className="grid gap-3">
            {expenses.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group flex flex-col gap-3 rounded-2xl bg-zinc-50/50 p-4 transition-all hover:bg-white hover:shadow-md dark:bg-zinc-800/20 dark:hover:bg-zinc-800/40 ring-1 ring-transparent hover:ring-rose-500/20"
              >
                {editingId === item.id ? (
                  <form onSubmit={(e) => { handleSubmit(e); setEditingId(null); }} className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                       <input name="amount" type="number" step="0.01" defaultValue={item.amount} required className="rounded-xl border bg-white px-3 py-1.5 dark:bg-zinc-900" />
                       <select name="categoryId" defaultValue={item.categoryId} className="rounded-xl border bg-white px-3 py-1.5 dark:bg-zinc-900">
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input name="date" type="date" defaultValue={formatDateInput(new Date(item.date))} className="rounded-xl border bg-white px-3 py-1.5 dark:bg-zinc-900" />
                      <input name="notes" type="text" defaultValue={item.notes ?? ""} className="rounded-xl border bg-white px-3 py-1.5 dark:bg-zinc-900" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setEditingId(null)} className="rounded-xl px-4 py-1.5 text-sm font-bold text-zinc-500">Cancel</button>
                      <button type="submit" className="rounded-xl bg-rose-600 px-4 py-1.5 text-sm font-bold text-white">Save</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-inner transition-transform group-hover:scale-110" style={{ backgroundColor: `${item.category.color}15` }}>
                        <CategoryIcon name={item.category.icon} categoryName={item.category.name} className="h-5 w-5" style={{ color: item.category.color }} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                           <p className="font-black text-zinc-900 dark:text-zinc-100 tabular-nums">{formatCurrency(item.amount)}</p>
                           {item.isRecurring && <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[8px] font-black uppercase text-zinc-500 dark:bg-zinc-700">Recurring</span>}
                        </div>
                        <p className="truncate text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                          {item.notes || <span className="italic opacity-50 font-normal">No description</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[10px] font-black text-zinc-300 dark:text-zinc-600">{new Date(item.date).toLocaleDateString()}</span>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingId(item.id)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 dark:hover:bg-zinc-800"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDelete(item.id)} className="rounded-lg p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.li>
            ))}
          </ul>
        )}
      </div>
      
      {!expenses.length && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-zinc-50 p-4 dark:bg-zinc-800/30 mb-4">
             <Info className="h-8 w-8 text-zinc-200 dark:text-zinc-700" />
          </div>
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No expenses found</p>
        </div>
      )}
    </div>
  );
}
