export interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
  icon: string;
}

export interface Income {
  id: string;
  amount: number;
  categoryId: string;
  category: Category;
  date: string;
  notes: string | null;
  isRecurring: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  category: Category;
  date: string;
  notes: string | null;
  isRecurring: boolean;
}

export interface StockPurchase {
  id: string;
  ticker: string;
  name?: string | null;
  quantity: number;
  pricePerUnit: number;
  date: string;
  broker: string | null;
  fee: number | null;
  notes: string | null;
  currentValue: number | null;
  currency: string;
  exchangeRate: number | null;
}
