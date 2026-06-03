-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: users
-- Armazena usuários do sistema
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  prn TEXT NOT NULL,
  cargo TEXT NOT NULL CHECK (cargo IN ('Operador Lider', 'Operador III', 'Operador II')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(nome)
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_nome ON users(nome);
CREATE INDEX IF NOT EXISTS idx_users_prn ON users(prn);

-- ============================================
-- TABELA: tags
-- Armazena equipamentos/TAGs do sistema
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id BIGSERIAL PRIMARY KEY,
  tag_completo TEXT NOT NULL UNIQUE,
  ultimos4 TEXT NOT NULL,
  nome_equipamento TEXT NOT NULL,
  localizacao_texto TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('operacional', 'manutenção', 'inativo')),
  foto_url TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_por TEXT,

  -- Nota de manutenção (embedded como JSONB para simplicidade)
  nota_manutencao JSONB
);

-- Índices para tags
CREATE INDEX IF NOT EXISTS idx_tags_ultimos4 ON tags(ultimos4);
CREATE INDEX IF NOT EXISTS idx_tags_nome_equipamento ON tags USING gin(to_tsvector('portuguese', nome_equipamento));
CREATE INDEX IF NOT EXISTS idx_tags_tag_completo ON tags USING gin(to_tsvector('portuguese', tag_completo));
CREATE INDEX IF NOT EXISTS idx_tags_status ON tags(status);
CREATE INDEX IF NOT EXISTS idx_tags_nota_manutencao ON tags USING gin(nota_manutencao) WHERE nota_manutencao IS NOT NULL;

-- ============================================
-- TABELA: comentarios
-- Armazena comentários dos operadores
-- ============================================
CREATE TABLE IF NOT EXISTS comentarios (
  id BIGSERIAL PRIMARY KEY,
  tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  autor TEXT NOT NULL,
  texto TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para comentarios
CREATE INDEX IF NOT EXISTS idx_comentarios_tag_id ON comentarios(tag_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_criado_em ON comentarios(criado_em DESC);

-- ============================================
-- TABELA: fotos
-- Armazena histórico de fotos dos equipamentos
-- ============================================
CREATE TABLE IF NOT EXISTS fotos (
  id BIGSERIAL PRIMARY KEY,
  tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  uploader TEXT NOT NULL,
  file_path TEXT NOT NULL,
  notes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para fotos
CREATE INDEX IF NOT EXISTS idx_fotos_tag_id ON fotos(tag_id);
CREATE INDEX IF NOT EXISTS idx_fotos_criado_em ON fotos(criado_em DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para atualizar atualizado_em automaticamente em users
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar atualizado_em automaticamente em tags
CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso público (via service_role na Edge Function)
-- Importante: A autenticação é feita na camada da aplicação

-- Policy para users
CREATE POLICY "Permitir acesso público a users" ON users
  FOR ALL USING (true);

-- Policy para tags
CREATE POLICY "Permitir acesso público a tags" ON tags
  FOR ALL USING (true);

-- Policy para comentarios
CREATE POLICY "Permitir acesso público a comentarios" ON comentarios
  FOR ALL USING (true);

-- Policy para fotos
CREATE POLICY "Permitir acesso público a fotos" ON fotos
  FOR ALL USING (true);

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para buscar TAGs por query (últimos 4 dígitos ou nome)
CREATE OR REPLACE FUNCTION buscar_tags(query_text TEXT)
RETURNS SETOF tags AS $$
DECLARE
  is_numeric BOOLEAN;
BEGIN
  -- Verificar se query tem exatamente 4 dígitos
  is_numeric := query_text ~ '^\d{4}$';

  IF is_numeric THEN
    -- Buscar por últimos 4 dígitos
    RETURN QUERY
    SELECT * FROM tags
    WHERE ultimos4 = query_text
    ORDER BY id DESC;
  ELSE
    -- Buscar por nome do equipamento ou TAG completo
    RETURN QUERY
    SELECT * FROM tags
    WHERE
      nome_equipamento ILIKE '%' || query_text || '%'
      OR tag_completo ILIKE '%' || query_text || '%'
    ORDER BY id DESC;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DADOS INICIAIS (SEED)
-- ============================================

-- Inserir TAGs de exemplo
INSERT INTO tags (tag_completo, ultimos4, nome_equipamento, localizacao_texto, status, foto_url, atualizado_por, nota_manutencao) VALUES
  ('CAL-BOI-0001', '0001', 'Válvula de Alívio B01', 'Casa de Máquinas - Tubulação 3', 'operacional', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800', 'João Silva', NULL),
  ('CAL-TUB-0002', '0002', 'Medidor de Pressão P02', 'Área Externa - Linha Principal', 'operacional', 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800', NULL, '{"numero_nota": "MNT-2024-045", "data_abertura": "2024-04-08T09:00:00Z", "descricao": "Calibração do medidor de pressão - leitura imprecisa", "prioridade": "média", "aberta_por": "Maria Santos"}'),
  ('CAL-MOT-0003', '0003', 'Motor de Alimentação M03', 'Sala de Bombas - Setor A', 'manutenção', 'https://images.unsplash.com/photo-1621905252472-b5f8b9134ce2?w=800', 'Pedro Costa', '{"numero_nota": "MNT-2024-052", "data_abertura": "2024-04-05T08:30:00Z", "descricao": "Substituição de rolamentos - vibração excessiva", "prioridade": "alta", "aberta_por": "Pedro Costa"}'),
  ('CAL-SEN-0004', '0004', 'Sensor de Temperatura ST04', 'Tubulação de Vapor - Nível 2', 'operacional', 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800', NULL, NULL),
  ('CAL-VAL-2001', '2001', 'Válvula de Controle V2001', 'Caldeira Principal - Entrada', 'operacional', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800', 'Ana Oliveira', '{"numero_nota": "MNT-2024-061", "data_abertura": "2024-04-09T14:20:00Z", "descricao": "Vazamento detectado na gaxeta - necessário reaperto", "prioridade": "urgente", "aberta_por": "Ana Oliveira"}'),
  ('CAL-BOM-2002', '2002', 'Bomba Centrífuga BC2002', 'Sala de Bombas - Setor B', 'operacional', 'https://images.unsplash.com/photo-1581092583537-20d51b4b4f1b?w=800', NULL, NULL),
  ('CAL-FLT-0005', '0005', 'Filtro de Água FA05', 'Tratamento de Água - Entrada', 'operacional', 'https://images.unsplash.com/photo-1581092162384-8987c1d64926?w=800', NULL, NULL),
  ('CAL-TRO-0006', '0006', 'Trocador de Calor TC06', 'Área de Processo - Nível 1', 'inativo', 'https://images.unsplash.com/photo-1581092583537-20d51b4b4f1b?w=800', NULL, NULL),
  ('CAL-MAN-1001', '1001', 'Manômetro Digital MD1001', 'Painel de Controle - Sala Central', 'operacional', 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800', NULL, NULL),
  ('CAL-QUE-1002', '1002', 'Queimador Principal QP1002', 'Fornalha - Caldeira 1', 'operacional', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800', NULL, NULL)
ON CONFLICT (tag_completo) DO NOTHING;

-- Inserir comentários de exemplo
INSERT INTO comentarios (tag_id, autor, texto, criado_em) VALUES
  (1, 'João Silva', 'Válvula funcionando corretamente após calibração.', '2024-04-01T10:30:00Z'),
  (2, 'Maria Santos', 'Detectada leitura imprecisa. Necessário calibração urgente.', '2024-04-08T09:00:00Z'),
  (3, 'Pedro Costa', 'Motor apresentando vibração anormal. Iniciado processo de manutenção.', '2024-04-05T08:30:00Z'),
  (3, 'Ana Oliveira', 'Aguardando peças de reposição para concluir reparo.', '2024-04-06T14:15:00Z'),
  (5, 'Ana Oliveira', 'Identificado vazamento na gaxeta. Abertura de nota de manutenção urgente.', '2024-04-09T14:20:00Z')
ON CONFLICT DO NOTHING;

-- Inserir fotos de exemplo
INSERT INTO fotos (tag_id, uploader, file_path, notes, criado_em) VALUES
  (1, 'João Silva', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800', 'Foto após manutenção preventiva', '2024-04-05T14:30:00Z'),
  (1, 'Maria Santos', 'https://images.unsplash.com/photo-1581092583537-20d51b4b4f1b?w=800', 'Ângulo lateral da válvula', '2024-04-04T10:15:00Z'),
  (2, 'Pedro Costa', 'https://images.unsplash.com/photo-1581092162384-8987c1d64926?w=800', 'Verificação de leitura de pressão', '2024-04-06T08:45:00Z'),
  (3, 'Ana Oliveira', 'https://images.unsplash.com/photo-1621905252472-b5f8b9134ce2?w=800', 'Motor em manutenção', '2024-04-05T16:20:00Z'),
  (4, 'Carlos Ferreira', 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800', 'Sensor funcionando normalmente', '2024-04-03T11:30:00Z'),
  (5, 'Luiza Mendes', 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800', 'Válvula após ajuste', '2024-04-06T09:00:00Z')
ON CONFLICT DO NOTHING;

-- ============================================
-- COMENTÁRIOS FINAIS
-- ============================================
COMMENT ON TABLE users IS 'Tabela de usuários do sistema TAG - Caldeira';
COMMENT ON TABLE tags IS 'Tabela de equipamentos/TAGs da caldeira';
COMMENT ON TABLE comentarios IS 'Comentários dos operadores sobre equipamentos';
COMMENT ON TABLE fotos IS 'Histórico de fotos dos equipamentos';

COMMENT ON COLUMN tags.nota_manutencao IS 'Nota de manutenção em formato JSON: {numero_nota, data_abertura, descricao, prioridade, aberta_por}';
