-- Cria o bucket 'fotos' para armazenar as fotos de perfil e também fotos das TAGs no ato da criação
INSERT INTO storage.buckets (id, name, public) 
VALUES ('fotos', 'fotos', true)
ON CONFLICT (id) DO NOTHING;

-- Habilita políticas públicas para a tabela de objetos do storage, caso não estejam ativas
-- (Isso garante que todos os usuários possam ler e gravar fotos sem erros de permissão)

-- 1. Qualquer pessoa pode visualizar as fotos (Select)
CREATE POLICY "Leitura pública de fotos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'fotos');

-- 2. Qualquer usuário logado pode fazer upload de uma foto (Insert)
CREATE POLICY "Upload de fotos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'fotos');

-- 3. Qualquer usuário logado pode atualizar uma foto (Update/Upsert)
CREATE POLICY "Atualização de fotos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'fotos');
