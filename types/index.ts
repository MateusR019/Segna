// ─── Finances ────────────────────────────────────────────────────────────────

export type TransactionType = "income" | "expense";

export type ExpenseCategory =
  | "housing"
  | "food"
  | "transport"
  | "fuel"
  | "health"
  | "gym"
  | "supplements"
  | "entertainment"
  | "education"
  | "shopping"
  | "investments"
  | "other";

export type IncomeCategory =
  | "salary"
  | "freelance"
  | "gig"
  | "investment_return"
  | "gift"
  | "other_income";

export type AnyCategory = ExpenseCategory | IncomeCategory;

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;      // AnyCategory | categoria personalizada
  subcategory?: string;  // detalhamento livre (ex: "Mercado", "Delivery")
  description: string;
  amount: number;
  date: string; // "YYYY-MM-DD"
  createdAt: string;
  recurring?: boolean;
  investmentId?: string; // vincula a um investimento (aporte ou resgate)
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

// 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab
// undefined/empty = todos os dias
export type WeekDayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  tag?: HabitTag;
  weekDays?: WeekDayIndex[]; // undefined = todos os dias
  order?: number;
  createdAt: string;
  template?: HabitTemplate;  // undefined = "default"
  paused?: boolean;          // se true, oculto no checklist diário
  negative?: boolean;        // se true, "não fazer" é o objetivo (ex: Sem açúcar)
  targetCount?: number;      // undefined/1 = toggle; >1 = modo contador (ex: Água 8x)
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
  score?: number; // 1–10 score diário
}

// Habit detail page templates
export type HabitTemplate = "default" | "weekly" | "notes";

// Free-form annotation for a habit
export interface HabitAnnotation {
  id: string;
  title?: string;
  content: string;
  createdAt: string; // ISO string
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
  image?: string;               // base64 data URL de imagem colada/arrastada
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
  priceInUSD?: number;   // preço em dólar (display principal)
  priceAtAlert?: number;
  avgCostBRL?: number;   // preço médio de entrada em BRL (legado)
  avgCostUSD?: number;   // preço médio de entrada em USD (preferencial)
  color: string;
  addedAt: string;
}

// Taxa de câmbio BRL/USD armazenada no defiStore
export interface ExchangeRate {
  usdToBRL: number;
  updatedAt: string;
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

// ─── DeFi - Pools de Liquidez ─────────────────────────────────────────────────

export type PoolStatus = "active" | "closed";

export interface LiquidityPool {
  id: string;
  protocol: string;           // "Uniswap V3", "PancakeSwap", etc.
  tokenA: string;             // "ETH"
  tokenB: string;             // "USDC"
  network: string;            // "Ethereum", "BSC", "Polygon", etc.
  depositedUSD: number;       // valor no momento do depósito em USD
  currentValueUSD: number;    // valor atual da posição em USD (manual)
  feesEarnedUSD?: number;     // fees/rendimentos acumulados em USD
  apy?: number;               // APY estimado em % (ex: 12.5)
  color: string;
  addedAt: string;            // ISO string
  status: PoolStatus;
}

// ─── DeFi - Watchlist ─────────────────────────────────────────────────────────

export interface WatchToken {
  id: string;
  symbol: string;           // "BTC"
  name: string;             // "Bitcoin"
  targetPriceUSD?: number;  // preço alvo de compra em USD (opcional)
  color: string;
  addedAt: string;
}

// ─── Tarefas ──────────────────────────────────────────────────────────────────

export type TaskPriority = "low" | "medium" | "high";

export type TaskRecurrence = "daily" | "weekly" | "monthly";

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string;           // "YYYY-MM-DD" — dia que pertence
  completed: boolean;
  completedAt?: string;   // ISO string
  priority: TaskPriority;
  createdAt: string;
  recurrence?: TaskRecurrence; // undefined = tarefa normal; definido = template recorrente
  generatedFrom?: string;      // ID do template que gerou esta instância
  time?: string;               // "HH:MM" — horário opcional da tarefa
}

// ─── Mood ─────────────────────────────────────────────────────────────────────

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
  id: string;
  date: string;          // "YYYY-MM-DD"
  mood: MoodLevel;       // 1=Péssimo … 5=Ótimo
  note?: string;
  createdAt: string;
}

// ─── Métricas Corporais ───────────────────────────────────────────────────────

export interface BodyMetric {
  id: string;
  date: string;          // "YYYY-MM-DD"
  weight?: number;       // kg
  waist?: number;        // cm
  bodyFat?: number;      // %
  muscleMass?: number;   // %
  chest?: number;        // cm — circunferência do peito
  bicep?: number;        // cm — circunferência do bícep
  thigh?: number;        // cm — circunferência da coxa
  hip?: number;          // cm — circunferência do quadril
  note?: string;
  createdAt: string;
}

// ─── Treino / Workout ─────────────────────────────────────────────────────────

export interface WorkoutSet {
  id: string;
  reps: number;
  weight?: number;   // kg — undefined = peso corporal
  done: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
  note?: string;
}

export interface WorkoutSession {
  id: string;
  date: string;       // "YYYY-MM-DD"
  name?: string;      // "Push Day", "Treino A", etc.
  exercises: WorkoutExercise[];
  duration?: number;  // minutos (manual)
  note?: string;
  createdAt: string;  // ISO
}

// ─── Investimentos / Reservas ────────────────────────────────────────────────

export type InvestmentType =
  | "renda-fixa"
  | "acoes"
  | "fundos"
  | "cripto"
  | "previdencia"
  | "poupanca"
  | "outro";

export interface Investment {
  id: string;
  name: string;           // "Tesouro IPCA+ 2035", "Poupança"
  type: InvestmentType;
  currentValue: number;   // valor atual de mercado (atualizado manualmente ou via API)
  yieldRate?: number;     // % ao ano estimado (para exibição)
  note?: string;
  color: string;
  createdAt: string;
  // Campos exclusivos para cripto (preço auto-fetched)
  symbol?: string;        // "BTC", "ETH", "SOL" — usado para buscar preço via CoinGecko
  quantity?: number;      // quantidade de tokens (currentValue = price × quantity)
  pricePerUnit?: number;  // preço atual por unidade em BRL (atualizado via API)
}

// ─── DeFi - Trade Log ────────────────────────────────────────────────────────

export type TradeType = "buy" | "sell";

export interface TradeEntry {
  id: string;
  tokenId: string;
  type: TradeType;
  quantity: number;
  priceUSD: number;       // preço por unidade no momento da trade
  totalUSD: number;       // quantity * priceUSD
  date: string;           // "YYYY-MM-DD"
  note?: string;
  createdAt: string;
}
