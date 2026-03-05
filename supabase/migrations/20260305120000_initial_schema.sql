-- ============================================================
-- Migration 001 — Schema inicial do Segna
-- Aplicada em: 2026-03-05
-- ============================================================

-- ─── Tabela principal ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_data (
  user_id    UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  data       JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_data
  ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}';

-- ─── Migração de colunas legadas → data JSONB ────────────────────────────────
-- Usa SQL dinâmico para só referenciar colunas que de fato existem.
-- `investimentos` sempre foi JSONB — nunca foi coluna separada, por isso não está na lista.
DO $$
DECLARE
  col      TEXT;
  col_list TEXT[] := ARRAY['financas','habitos','notas','defi','settings','tarefas','mood','corporal'];
  build_json TEXT := '';
  sep        TEXT := '';
  found_any  BOOLEAN := FALSE;
BEGIN
  -- Sai cedo se o esquema antigo já não existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_data' AND column_name = 'financas'
  ) THEN
    RETURN;
  END IF;

  -- Constrói jsonb_build_object apenas com colunas que existem
  FOREACH col IN ARRAY col_list LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'user_data' AND column_name = col
    ) THEN
      build_json := build_json || sep
        || quote_literal(col) || ', COALESCE('
        || quote_ident(col)   || ', ''{}''::jsonb)';
      sep       := ', ';
      found_any := TRUE;
    END IF;
  END LOOP;

  -- Faz UPDATE apenas se encontrou colunas legadas
  IF found_any THEN
    EXECUTE 'UPDATE user_data SET data = jsonb_build_object('
      || build_json
      || ') WHERE data = ''{}''::jsonb';
  END IF;

  -- Remove colunas legadas (IF EXISTS garante idempotência)
  FOREACH col IN ARRAY col_list LOOP
    EXECUTE 'ALTER TABLE user_data DROP COLUMN IF EXISTS ' || quote_ident(col);
  END LOOP;
END $$;

-- ─── RPC: upsert atômico por store ───────────────────────────────────────────
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

-- ─── Row Level Security ───────────────────────────────────────────────────────
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

-- ─── Trigger updated_at ───────────────────────────────────────────────────────
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

-- ─── Permissões ───────────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION upsert_user_store(UUID, TEXT, JSONB) TO authenticated;
