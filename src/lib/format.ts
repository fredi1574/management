/**
 * Format amount as currency. Default ILS for incomes/expenses; use "USD" for stocks.
 */
export function formatCurrency(value: number, currency: "ILS" | "USD" = "ILS"): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
}

/**
 * Format date as YYYY-MM-DD for inputs.
 */
export function formatDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}
