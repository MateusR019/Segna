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
  recurring?: boolean;
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

// Metas financeiras por categoria
export interface CategoryGoal {
  id: string;
  category: ExpenseCategory;
  limitAmount: number;
  createdAt: string;
}

// Feature 2: Meta de economia mensal
export interface SavingsGoal {
  targetAmount: number;
}

// ─── Habits ──────────────────────────────────────────────────────────────────

export type HabitTag = "saude" | "trabalho" | "pessoal" | "aprendizado" | "financas";

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  tag?: HabitTag;
  order?: number; // Feature 8: drag-and-drop order
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

export interface HabitFrequencyGoal {
  habitId: string;
  timesPerWeek: number;
}

// Feature 5: Nota opcional por hábito (por data)
export interface HabitNote {
  habitId: string;
  date: string; // "YYYY-MM-DD"
  text: string;
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
  tagId?: string;
  createdAt: string;
  pinned?: boolean;             // Feature 14: fixar nota
  mode?: "text" | "checklist"; // Feature 15: modo checklist
}

// ─── Finanças - Orçamento global ─────────────────────────────────────────────

export interface MonthlyBudget {
  limitAmount: number;
}

// ─── DeFi / Crypto ───────────────────────────────────────────────────────────

export interface PortfolioSnapshot {
  date: string;
  totalBRL: number;
}

export interface Token {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  priceInBRL: number;
  priceAtAlert?: number;
  avgCostBRL?: number; // Feature 9: custo médio
  color: string;
  addedAt: string;
}

// Feature 11: histórico de preços manuais
export interface PriceEntry {
  id: string;
  tokenId: string;
  date: string; // "YYYY-MM-DD"
  priceBRL: number;
}

export interface TokenWithValue extends Token {
  totalValue: number;
  percentage: number;
}
