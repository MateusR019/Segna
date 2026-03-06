import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface InsightPayload {
  habits: { name: string; streak: number; weekRate: number }[];
  finance: { monthExpenses: number; monthIncome: number; topCategory: string; budgetPct: number | null };
  tasks: { doneToday: number; totalToday: number; overdueCt: number };
  mood: { avgWeek: number | null };
}

interface AiInsight {
  type: "positive" | "warning" | "info" | "negative";
  icon: string;
  title: string;
  body: string;
}

// ─── Prompt builder ─────────────────────────────────────────────────────────────

function buildPrompt(payload: InsightPayload): string {
  const { habits, finance, tasks, mood } = payload;

  const habitSummary = habits.length === 0
    ? "Sem hábitos cadastrados."
    : habits
        .slice(0, 5)
        .map((h) => `${h.name}: ${h.weekRate}% na semana, streak ${h.streak} dias`)
        .join("; ");

  const financeSummary = `Receitas: R$${finance.monthIncome.toFixed(2)}, Despesas: R$${finance.monthExpenses.toFixed(2)}, Maior categoria: ${finance.topCategory || "N/A"}${finance.budgetPct !== null ? `, Orçamento: ${finance.budgetPct}% usado` : ""}`;

  const tasksSummary = `Hoje: ${tasks.doneToday}/${tasks.totalToday} concluídas, ${tasks.overdueCt} em atraso`;

  const moodSummary = mood.avgWeek !== null
    ? `Humor médio na semana: ${mood.avgWeek.toFixed(1)}/5`
    : "Sem registros de humor na semana";

  return `Você é um assistente de análise de produtividade pessoal. Analise os dados abaixo e gere exatamente 3 insights concisos e acionáveis em português brasileiro. Seja específico com os números.

Dados do usuário:
- Hábitos: ${habitSummary}
- Finanças do mês: ${financeSummary}
- Tarefas: ${tasksSummary}
- Humor: ${moodSummary}

Retorne APENAS um JSON array com 3 objetos no formato:
[{"type":"positive"|"warning"|"info"|"negative","icon":"emoji","title":"título curto","body":"descrição em 1-2 frases com dados específicos"}]

Regras:
- Foque no que é mais relevante/acionável
- Use números dos dados quando possível
- Títulos com até 5 palavras
- Corpo com até 120 caracteres
- Não use markdown, apenas JSON puro`;
}

function parseInsights(text: string): AiInsight[] | null {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as AiInsight[];
  } catch {
    return null;
  }
}

// ─── Provider: OpenAI ──────────────────────────────────────────────────────────

async function runOpenAI(prompt: string): Promise<AiInsight[]> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0]?.message?.content ?? "";
  const insights = parseInsights(text);
  if (!insights) throw new Error("parse_error");
  return insights;
}

// ─── Provider: Anthropic ──────────────────────────────────────────────────────

async function runAnthropic(prompt: string): Promise<AiInsight[]> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const insights = parseInsights(text);
  if (!insights) throw new Error("parse_error");
  return insights;
}

// ─── Provider: Google Gemini ───────────────────────────────────────────────────

async function runGemini(prompt: string): Promise<AiInsight[]> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const insights = parseInsights(text);
  if (!insights) throw new Error("parse_error");
  return insights;
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let payload: InsightPayload;
  try {
    payload = (await req.json()) as InsightPayload;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const prompt = buildPrompt(payload);

  // Try providers in order: OpenAI → Anthropic → Gemini
  const providers: Array<{ name: string; key: string | undefined; run: () => Promise<AiInsight[]> }> = [
    {
      name: "openai",
      key: process.env.OPENAI_API_KEY,
      run: () => runOpenAI(prompt),
    },
    {
      name: "anthropic",
      key: process.env.ANTHROPIC_API_KEY,
      run: () => runAnthropic(prompt),
    },
    {
      name: "gemini",
      key: process.env.GEMINI_API_KEY,
      run: () => runGemini(prompt),
    },
  ];

  const available = providers.filter((p) => p.key);

  if (available.length === 0) {
    return NextResponse.json({ error: "no_key" }, { status: 503 });
  }

  // Try each available provider in order
  let lastError: string = "unknown";
  for (const provider of available) {
    try {
      const insights = await provider.run();
      return NextResponse.json({ insights, source: "ai", provider: provider.name });
    } catch (err) {
      lastError = err instanceof Error ? err.message : "unknown";
      console.error(`AI insights [${provider.name}] error:`, err);
      // Continue to next provider
    }
  }

  return NextResponse.json({ error: lastError }, { status: 500 });
}
