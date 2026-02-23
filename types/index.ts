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
  recurring?: boolean; // Feature 6: recorrência
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

// Feature 1: Metas financeiras por categoria
export interface CategoryGoal {
  id: string;
  category: ExpenseCategory;
  limitAmount: number; // limite mensal em R$
  createdAt: string;
}

// ─── Habits ──────────────────────────────────────────────────────────────────

// Feature 7: Tags nos hábitos
export type HabitTag = "saude" | "trabalho" | "pessoal" | "aprendizado" | "financas";

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  tag?: HabitTag; // Feature 7
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

// ─── Notas ───────────────────────────────────────────────────────────────────

export interface NoteTag {
  id: string;
  label: string;
  color: string;
}

export interface Note {
  id: string;
  content: string;
  tagId?: string; // optional reference to a NoteTag
  createdAt: string; // ISO timestamp
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
