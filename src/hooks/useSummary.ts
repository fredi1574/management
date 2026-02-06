import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export interface MonthlySummary {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface YearlySummary {
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyBreakdown: Array<{
    month: number;
    income: number;
    expense: number;
  }>;
}

export function useMonthlySummary(year: number, month: number) {
  const { data, error, isLoading, mutate } = useSWR<MonthlySummary>(
    `/api/summary/month?year=${year}&month=${month}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    summary: data || { year, month, totalIncome: 0, totalExpense: 0, balance: 0 },
    isLoading,
    error,
    mutate,
  };
}

export function useYearlySummary(year: number) {
  const { data, error, isLoading, mutate } = useSWR<YearlySummary>(
    `/api/summary/year?year=${year}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    summary: data,
    isLoading,
    error,
    mutate,
  };
}
