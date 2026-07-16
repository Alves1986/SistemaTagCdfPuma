-- Executar este comando para copiar contas antigas (existentes no auth.users) para a tabela de profiles
INSERT INTO public.profiles (id, nome, prn, cargo, gerencia, area)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'nome', 'Administrador'),
  COALESCE(raw_user_meta_data->>'prn', '0000'),
  COALESCE(raw_user_meta_data->>'cargo', 'Operador Lider'),
  raw_user_meta_data->>'gerencia',
  raw_user_meta_data->>'area'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
