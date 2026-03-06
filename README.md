<div align="center">

<img src="public/icon-192.png" width="80" height="80" alt="Segna" style="border-radius: 20px" />

# Segna

**Dashboard pessoal open source para organizar sua vida financeira, hábitos, notas e muito mais.**

[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://segna.space)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-database-green?logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/license-MIT-purple)](LICENSE)
[![Open Source](https://img.shields.io/badge/open%20source-%E2%9D%A4-red)](https://github.com/MateusR019/Segna)

[**🚀 Acessar o app →**](https://segna.space) &nbsp;·&nbsp; [Demo](#-demo) &nbsp;·&nbsp; [Funcionalidades](#-funcionalidades) &nbsp;·&nbsp; [Tecnologias](#-tecnologias) &nbsp;·&nbsp; [Rodar localmente](#-rodar-localmente)

</div>

---

## ✨ O que é o Segna?

O Segna é um **personal OS** — um dashboard centralizado para acompanhar tudo que importa na sua vida:

- 💰 Finanças pessoais com gráficos e metas
- 🏋️ Hábitos com streak, heatmap e score diário
- 📝 Notas com markdown, checklist e tags
- ₿ Portfolio de cripto com preços em tempo real
- 📈 Investimentos (renda fixa, ações, cripto)
- ✅ Tarefas com prioridade
- 🏋 Métricas corporais (peso, medidas)
- 🎯 Score diário e rastreamento de humor

Tudo sincronizado na nuvem, acessível de qualquer dispositivo, com um design escuro e rápido.

---

## 🎯 Demo

> Acesse **[segna.space](https://segna.space)** e faça login com a conta demo:
>
> **Email:** `Teste@gmail.com` &nbsp;|&nbsp; **Senha:** `Teste123`

---

## 📦 Funcionalidades

### 💰 Finanças
- Cadastro de receitas e despesas com categorias e subcategorias
- Transações recorrentes (lançamento automático todo mês)
- Categorias personalizadas
- Orçamento mensal com barra de progresso
- Metas por categoria (ex: máx R$500 em Alimentação)
- Meta de economia mensal
- Gráficos: linha mensal e pizza por categoria
- Seletor de mês com navegação ← →
- Busca e filtros em transações
- **Investimentos integrados** (reservas + renda fixa + cripto com preço automático)

### 🏋️ Hábitos
- Hábitos com ícone, cor e tag
- Modo contador (ex: 8 copos d'água)
- Hábitos negativos (ex: "Sem açúcar")
- Heatmap dos últimos 35 dias
- Streak e melhor streak histórico
- Score diário (1–10) com mini gráfico de 7 dias
- Plano semanal com grade de exercícios
- Meta de frequência semanal
- Nota diária por hábito

### 📝 Notas
- Editor markdown com preview
- Modo checklist interativo (`[ ] item`)
- Tags com cores personalizadas
- Notas fixadas (pin)
- Layout masonry (colunas)
- Busca e filtros

### ₿ DeFi / Cripto
- Portfolio com preços em BRL via CoinGecko
- Preço médio e P&L por token
- Gráfico de pizza e linha histórica
- Histórico de trades
- Pools de liquidez
- Watchlist de tokens
- Cotação USD/BRL em tempo real

### 📊 Dashboard
- Patrimônio total (financeiro + cripto + investimentos + pools)
- Resumo do mês (receitas, despesas, projeção)
- Checklist de hábitos de hoje
- Score diário e humor
- Streaks ativos
- Notas recentes
- Insights automáticos
- Widget de clima

---

## 🛠 Tecnologias

| Categoria | Tecnologias |
|-----------|-------------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Estilo** | Tailwind CSS, shadcn/ui, Radix UI |
| **Estado** | Zustand (persist + localStorage) |
| **Backend** | Supabase (Auth + Postgres + Row Level Security) |
| **APIs** | CoinGecko (preços cripto), Open-Meteo (clima) |
| **Deploy** | Vercel (edge), PWA (offline-first) |
| **Fontes** | Geist (Vercel) |

---

## 🚀 Rodar localmente

### Pré-requisitos
- Node.js 18+
- npm / pnpm / yarn
- Conta no [Supabase](https://supabase.com)

### 1. Clone o repositório

```bash
git clone https://github.com/MateusR019/Segna.git
cd Segna
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
```

### 4. Configure o banco de dados

No Supabase, crie a tabela `user_data` e a função RPC:

```sql
-- Tabela principal
create table public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data    jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Row Level Security
alter table public.user_data enable row level security;
create policy "Users can only access their own data"
  on public.user_data for all
  using (auth.uid() = user_id);

-- RPC para upsert atômico de um store
create or replace function upsert_user_store(
  p_user_id uuid,
  p_store   text,
  p_data    jsonb
) returns void language plpgsql security definer as $$
begin
  insert into public.user_data (user_id, data)
  values (p_user_id, jsonb_build_object(p_store, p_data))
  on conflict (user_id)
  do update set
    data = jsonb_set(user_data.data, array[p_store], p_data),
    updated_at = now();
end;
$$;
```

### 5. Rode o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Estrutura do projeto

```
Segna/
├── app/                    # Rotas Next.js (App Router)
│   ├── dashboard/          # Dashboard principal
│   ├── financas/           # Finanças + Investimentos
│   ├── habitos/            # Hábitos + detalhe por hábito
│   ├── notas/              # Notas com markdown
│   ├── defi/               # DeFi / Cripto
│   ├── tarefas/            # Tarefas do dia
│   ├── revisao/            # Revisão semanal
│   ├── corporal/           # Métricas corporais
│   ├── login/              # Landing page + auth
│   └── privacidade/        # Política de privacidade
├── components/             # Componentes React
│   ├── dashboard/          # Widgets do dashboard
│   ├── financas/           # Componentes de finanças
│   ├── habitos/            # Componentes de hábitos
│   ├── defi/               # Componentes DeFi
│   └── layout/             # Sidebar, BottomNav, AppShell
├── store/                  # Zustand stores
├── types/                  # TypeScript interfaces
└── lib/                    # Utilitários (db, format, supabase...)
```

---

## 🔒 Privacidade e segurança

- **Row Level Security** no Supabase — cada usuário acessa apenas seus próprios dados
- **Sem tracking** — nenhum cookie de analytics ou publicidade
- **Open source** — código auditável por qualquer pessoa
- [Política de Privacidade completa](https://segna.space/privacidade) (LGPD)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o repositório
2. Crie uma branch: `git checkout -b feat/minha-feature`
3. Faça suas mudanças com commits descritivos
4. Abra um Pull Request

Para reportar bugs ou sugerir features, abra uma [issue](https://github.com/MateusR019/Segna/issues).

---

## 📄 Licença

MIT © [Mateus](https://github.com/MateusR019) — use, modifique e distribua à vontade.

---

<div align="center">

Feito com ❤️ no Brasil 🇧🇷

**[segna.space](https://segna.space)**

</div>
