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
