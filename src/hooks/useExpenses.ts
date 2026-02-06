import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    type: string;
    color: string;
    icon: string;
  };
  date: string;
  notes: string | null;
  isRecurring: boolean;
}

export function useExpenses(year: number, month: number, search?: string) {
  const params = new URLSearchParams();
  params.set("year", year.toString());
  params.set("month", month.toString());
  if (search) params.set("search", search);

  const { data, error, isLoading, mutate } = useSWR<Expense[]>(
    `/api/expenses?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    expenses: data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useExpense(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Expense>(
    id ? `/api/expenses/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    expense: data,
    isLoading,
    error,
    mutate,
  };
}

export async function createExpense(data: Partial<Expense>) {
  const response = await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create expense");
  }

  return response.json();
}

export async function updateExpense(id: string, data: Partial<Expense>) {
  const response = await fetch(`/api/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update expense");
  }

  return response.json();
}

export async function deleteExpense(id: string) {
  const response = await fetch(`/api/expenses/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete expense");
  }

  return response.json();
}
