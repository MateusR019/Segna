-- ============================================================
-- SEGNA — Schema do Supabase
-- Cole este conteúdo no SQL Editor do Supabase Dashboard
-- ============================================================

-- Tabela principal: guarda todo o estado do app por usuário
CREATE TABLE IF NOT EXISTS user_data (
  user_id    UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  financas   JSONB NOT NULL DEFAULT '{}',
  habitos    JSONB NOT NULL DEFAULT '{}',
  notas      JSONB NOT NULL DEFAULT '{}',
  defi       JSONB NOT NULL DEFAULT '{}',
  settings   JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security — cada usuário só acessa seus próprios dados
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_data" ON user_data
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
