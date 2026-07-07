-- Tabela de perfis de usuários (vinculada ao Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  prn TEXT NOT NULL,
  cargo TEXT NOT NULL CHECK (cargo IN ('Operador Lider', 'Operador III', 'Operador II')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ler todos os perfis
CREATE POLICY "Perfis visíveis para autenticados"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Usuário pode atualizar o próprio perfil
CREATE POLICY "Usuário atualiza próprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger: cria perfil automaticamente a partir dos metadados do auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, prn, cargo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Operador'),
    COALESCE(NEW.raw_user_meta_data->>'prn', '0000'),
    COALESCE(NEW.raw_user_meta_data->>'cargo', 'Operador II')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
