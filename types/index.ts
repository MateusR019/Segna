// ─── Finances ────────────────────────────────────────────────────────────────

export type TransactionType = "income" | "expense";

export type ExpenseCategory =
  | "housing"
  | "food"
  | "transport"
  | "health"
  | "entertainment"
  | "education"
  | "shopping"
  | "investments"
  | "other";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string; // "YYYY-MM-DD"
  createdAt: string;
}

export interface CategorySummary {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyBalance {
  month: string;
  income: number;
  expenses: number;
}

// ─── Habits ──────────────────────────────────────────────────────────────────

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
}

// Key: "YYYY-MM-DD", Value: array of completed habit IDs
export type CompletionMap = Record<string, string[]>;

export interface HabitWithStreak extends Habit {
  streak: number;
  completedToday: boolean;
}

export interface WeekDay {
  date: string;
  label: string;
  completedIds: string[];
  totalHabits: number;
  completionRate: number;
}

// ─── DeFi / Crypto ───────────────────────────────────────────────────────────

export interface Token {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  priceInBRL: number;
  color: string;
  addedAt: string;
}

export interface TokenWithValue extends Token {
  totalValue: number;
  percentage: number;
}
