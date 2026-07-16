-- Adicionar novos campos de gerencia e area
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gerencia TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS area TEXT;

-- Atualizar o Trigger que cria o perfil automaticamente para inserir gerencia e area
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, prn, cargo, gerencia, area)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Operador'),
    COALESCE(NEW.raw_user_meta_data->>'prn', '0000'),
    COALESCE(NEW.raw_user_meta_data->>'cargo', 'Operador II'),
    NEW.raw_user_meta_data->>'gerencia',
    NEW.raw_user_meta_data->>'area'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
