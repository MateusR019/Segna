-- ============================================================
-- SEGNA — Schema do Supabase
-- Cole este conteúdo no SQL Editor do Supabase Dashboard
-- É seguro rodar múltiplas vezes (IF NOT EXISTS em tudo)
-- ============================================================

-- Tabela principal: guarda todo o estado do app por usuário
CREATE TABLE IF NOT EXISTS user_data (
  user_id    UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  financas   JSONB NOT NULL DEFAULT '{}',
  habitos    JSONB NOT NULL DEFAULT '{}',
  notas      JSONB NOT NULL DEFAULT '{}',
  defi       JSONB NOT NULL DEFAULT '{}',
  settings   JSONB NOT NULL DEFAULT '{}',
  tarefas    JSONB NOT NULL DEFAULT '{}',
  mood       JSONB NOT NULL DEFAULT '{}',
  corporal   JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adiciona colunas novas caso a tabela já exista (safe to re-run)
ALTER TABLE user_data
  ADD COLUMN IF NOT EXISTS tarefas  JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS mood     JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS corporal JSONB NOT NULL DEFAULT '{}';

-- Row Level Security — cada usuário só acessa seus próprios dados
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Cria policy apenas se ainda não existir
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

-- Função que atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger (remove e recria para evitar duplicata)
DROP TRIGGER IF EXISTS trg_user_data_updated_at ON user_data;
CREATE TRIGGER trg_user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
