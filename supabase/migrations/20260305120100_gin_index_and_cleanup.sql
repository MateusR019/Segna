-- ============================================================
-- Migration 002 — GIN index + funções de limpeza de dados
-- Aplicada em: 2026-03-05
-- ============================================================

-- ─── Índices para escala ─────────────────────────────────────────────────────
-- GIN: acelera qualquer busca dentro do JSONB (@>, ?, jsonb_path_query etc.)
CREATE INDEX IF NOT EXISTS idx_user_data_gin     ON user_data USING GIN (data);

-- BTREE em updated_at: útil para sincronização e admin dashboard
CREATE INDEX IF NOT EXISTS idx_user_data_updated ON user_data (updated_at DESC);

-- ─── RPC: limpeza de priceHistory ────────────────────────────────────────────
-- Mantém apenas os últimos `keep_days` dias de histórico de preços (store defi).
-- Rode via Supabase pg_cron ou manualmente:
--   SELECT cleanup_price_history(365);
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

-- ─── RPC: limpeza de completions antigos ─────────────────────────────────────
-- Mantém completions de hábitos apenas dos últimos `keep_days` dias.
-- Rode via Supabase pg_cron ou manualmente:
--   SELECT cleanup_habit_completions(180);
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

-- ─── Permissões: funções de limpeza só para admins/cron ─────────────────────
REVOKE ALL ON FUNCTION cleanup_price_history(INT)     FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION cleanup_habit_completions(INT) FROM PUBLIC, anon;
