import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

interface InsightPayload {
  habits: { name: string; streak: number; weekRate: number }[];
  finance: { monthExpenses: number; monthIncome: number; topCategory: string; budgetPct: number | null };
  tasks: { doneToday: number; totalToday: number; overdueCt: number };
  mood: { avgWeek: number | null };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "no_key" }, { status: 503 });
  }

  let payload: InsightPayload;
  try {
    payload = (await req.json()) as InsightPayload;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const { habits, finance, tasks, mood } = payload;

  const habitSummary = habits.length === 0
    ? "Sem hábitos cadastrados."
    : habits
        .slice(0, 5)
        .map((h) => `${h.name}: ${h.weekRate}% na semana, streak ${h.streak} dias`)
        .join("; ");

  const financeSummary = `Receitas: R$${finance.monthIncome.toFixed(2)}, Despesas: R$${finance.monthExpenses.toFixed(2)}, Maior categoria: ${finance.topCategory || "N/A"}${finance.budgetPct !== null ? `, Orçamento: ${finance.budgetPct}% usado` : ""}`;

  const tasksSummary = `Hoje: ${tasks.doneToday}/${tasks.totalToday} concluídas, ${tasks.overdueCt} em atraso`;

  const moodSummary = mood.avgWeek !== null ? `Humor médio na semana: ${mood.avgWeek.toFixed(1)}/5` : "Sem registros de humor na semana";

  const prompt = `Você é um assistente de análise de produtividade pessoal. Analise os dados abaixo e gere exatamente 3 insights concisos e acionáveis em português brasileiro. Seja específico com os números.

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

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "parse_error" }, { status: 500 });
    }

    const insights = JSON.parse(jsonMatch[0]) as unknown[];

    return NextResponse.json({ insights, source: "ai" });
  } catch (err) {
    console.error("AI insights error:", err);
    return NextResponse.json({ error: "ai_error" }, { status: 500 });
  }
}
