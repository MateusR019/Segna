-- ============================================================
-- SEGNA — Schema do Supabase  (v2 — março 2026)
-- Cole no SQL Editor do Supabase Dashboard e execute.
-- É seguro rodar múltiplas vezes (IF NOT EXISTS / OR REPLACE).
-- ============================================================

-- ─── 1. Tabela principal ──────────────────────────────────────────────────────
-- Coluna única `data JSONB` — adicionar um novo store não requer ALTER TABLE,
-- basta incluir a nova key no StoreKey de lib/db.ts.

CREATE TABLE IF NOT EXISTS user_data (
  user_id    UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  data       JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Garante que `data` existe mesmo em schemas antigos
ALTER TABLE user_data
  ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}';

-- ─── 2. Índices para escala ───────────────────────────────────────────────────
-- GIN: acelera buscas dentro do JSONB (@>, ?, jsonb_path_query etc.)
-- Essencial quando a base de usuários escalar — sem ele cada query faz table scan.
CREATE INDEX IF NOT EXISTS idx_user_data_gin     ON user_data USING GIN (data);

-- BTREE em updated_at: útil para queries de sincronização / admin dashboard
CREATE INDEX IF NOT EXISTS idx_user_data_updated ON user_data (updated_at DESC);

-- ─── 3. Migração colunas antigas → coluna `data` ─────────────────────────────
-- Move dados das colunas separadas para dentro de `data`
-- (só atualiza linhas onde `data` ainda está vazio — idempotente)
-- Inclui `investimentos` que foi adicionado após a migração original.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_data' AND column_name = 'financas'
  ) THEN
    UPDATE user_data
    SET data = jsonb_build_object(
      'financas',      COALESCE(financas,     '{}'),
      'habitos',       COALESCE(habitos,       '{}'),
      'notas',         COALESCE(notas,         '{}'),
      'defi',          COALESCE(defi,          '{}'),
      'settings',      COALESCE(settings,      '{}'),
      'tarefas',       COALESCE(tarefas,       '{}'),
      'mood',          COALESCE(mood,          '{}'),
      'corporal',      COALESCE(corporal,      '{}'),
      'investimentos', COALESCE(investimentos, '{}')
    )
    WHERE data = '{}';

    -- Remove colunas obsoletas após migração
    ALTER TABLE user_data DROP COLUMN IF EXISTS financas;
    ALTER TABLE user_data DROP COLUMN IF EXISTS habitos;
    ALTER TABLE user_data DROP COLUMN IF EXISTS notas;
    ALTER TABLE user_data DROP COLUMN IF EXISTS defi;
    ALTER TABLE user_data DROP COLUMN IF EXISTS settings;
    ALTER TABLE user_data DROP COLUMN IF EXISTS tarefas;
    ALTER TABLE user_data DROP COLUMN IF EXISTS mood;
    ALTER TABLE user_data DROP COLUMN IF EXISTS corporal;
    ALTER TABLE user_data DROP COLUMN IF EXISTS investimentos;
  END IF;
END $$;

-- ─── 4. Função RPC: upsert atômico por store ─────────────────────────────────
-- Usa jsonb_set → salvar um store nunca sobrescreve os outros stores.
-- Dois stores podem salvar simultaneamente sem race condition.
-- Não precisa criar nova função ao adicionar novo store.
CREATE OR REPLACE FUNCTION upsert_user_store(
  p_user_id UUID,
  p_store   TEXT,
  p_data    JSONB
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_data (user_id, data)
  VALUES (p_user_id, jsonb_build_object(p_store, p_data))
  ON CONFLICT (user_id)
  DO UPDATE SET
    data       = jsonb_set(user_data.data, ARRAY[p_store], p_data),
    updated_at = now();
END;
$$;

-- ─── 5. Função RPC: limpeza de priceHistory ──────────────────────────────────
-- priceHistory (store defi) pode crescer indefinidamente.
-- Esta função mantém apenas os últimos `keep_days` dias de histórico.
-- Rode periodicamente via Supabase pg_cron ou manualmente no SQL Editor.
--
-- Exemplo:  SELECT cleanup_price_history(365);  -- mantém último ano
CREATE OR REPLACE FUNCTION cleanup_price_history(keep_days INT DEFAULT 365)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cutoff       TIMESTAMPTZ := now() - (keep_days || ' days')::INTERVAL;
  rows_updated INT := 0;
BEGIN
  UPDATE user_data
  SET data = jsonb_set(
    data,
    '{defi,priceHistory}',
    COALESCE(
      (
        SELECT jsonb_agg(entry)
        FROM jsonb_array_elements(data->'defi'->'priceHistory') AS entry
        WHERE (entry->>'timestamp')::TIMESTAMPTZ >= cutoff
      ),
      '[]'::jsonb
    )
  )
  WHERE data->'defi'->'priceHistory' IS NOT NULL
    AND jsonb_array_length(data->'defi'->'priceHistory') > 0;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated;
END;
$$;

-- ─── 6. Função RPC: limpeza de completions antigos ───────────────────────────
-- completions no habitosStore usa {habitId: {date: bool}}.
-- Esta função remove entradas com date anterior a keep_days atrás.
--
-- Exemplo:  SELECT cleanup_habit_completions(180);  -- mantém últimos 6 meses
CREATE OR REPLACE FUNCTION cleanup_habit_completions(keep_days INT DEFAULT 180)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cutoff_str   TEXT := to_char(now() - (keep_days || ' days')::INTERVAL, 'YYYY-MM-DD');
  rows_updated INT := 0;
BEGIN
  UPDATE user_data
  SET data = jsonb_set(
    data,
    '{habitos,completions}',
    (
      SELECT COALESCE(jsonb_object_agg(habit_key, filtered_dates), '{}')
      FROM (
        SELECT
          habit_key,
          (
            SELECT COALESCE(jsonb_object_agg(date_key, val), '{}')
            FROM jsonb_each(habit_dates) AS d(date_key, val)
            WHERE date_key >= cutoff_str
          ) AS filtered_dates
        FROM jsonb_each(data->'habitos'->'completions') AS c(habit_key, habit_dates)
      ) AS sub
      WHERE filtered_dates != '{}'::jsonb
    )
  )
  WHERE data->'habitos'->'completions' IS NOT NULL;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated;
END;
$$;

-- ─── 7. Row Level Security ────────────────────────────────────────────────────
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_data' AND policyname = 'users_own_data'
  ) THEN
    CREATE POLICY "users_own_data" ON user_data
      FOR ALL
      USING  (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ─── 8. Trigger updated_at ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_data_updated_at ON user_data;
CREATE TRIGGER trg_user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ─── 9. Permissões das funções RPC ───────────────────────────────────────────
-- Funções de limpeza só podem ser chamadas por admins/cron, não pelo client
REVOKE ALL ON FUNCTION cleanup_price_history(INT)     FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION cleanup_habit_completions(INT) FROM PUBLIC, anon;

-- upsert_user_store é chamada pelo client autenticado
GRANT EXECUTE ON FUNCTION upsert_user_store(UUID, TEXT, JSONB) TO authenticated;

-- ─── 10. Stores suportados (documentação) ─────────────────────────────────────
-- Para adicionar novo store: inclua a key em lib/db.ts → StoreKey.
-- Nenhuma ALTER TABLE, nenhuma migração extra necessária.
--
--  Store key       | Dados salvos
-- ─────────────────┼────────────────────────────────────────────────────
--  financas        | transactions, goals, budget, savingsGoal
--  habitos         | habits, completions, counts, frequencyGoals,
--                  | habitNotes, workoutSchedule, annotations
--  notas           | notes, tags
--  defi            | tokens, snapshots, priceHistory, exchangeRate, pools
--  settings        | displayName, avatarColor, walletAddress, zerionApiKey,
--                  | height, theme, language
--  tarefas         | tasks
--  mood            | entries
--  corporal        | metrics
--  investimentos   | investments
-- ─────────────────┴────────────────────────────────────────────────────
