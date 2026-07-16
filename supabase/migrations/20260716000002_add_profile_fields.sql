-- Remover a restrição de cargos antigos (se existir) para permitir cargos de Gestão
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_cargo_check;

-- Adicionar os novos campos de foto de perfil e whatsapp
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- Adicionar nova restrição de cargos cobrindo Gestão e Operadores
ALTER TABLE profiles ADD CONSTRAINT profiles_cargo_check 
  CHECK (cargo IN (
    'Operador Lider', 
    'Operador III', 
    'Operador II',
    'Aprendiz', 
    'Coordenador', 
    'Especialista', 
    'Engenheiro(a)', 
    'Assistente Tecnico'
  ));
