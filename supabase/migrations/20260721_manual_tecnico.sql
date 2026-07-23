-- =====================================================================
-- Migration: Módulo "Manual Técnico" — Sistema TAG KOS (Caldeira de Força 2)
-- Fonte da verdade: UPGRADE TAG KLABIN/MANUAL TECNICO.SQL
-- Não altera tabelas existentes (tags, comentarios, fotos, users).
-- Objetivo: app consome a Base KOS (Obsidian) como fonte de conhecimento.
-- =====================================================================

CREATE TABLE IF NOT EXISTS equipamentos_referencia (
  id BIGSERIAL PRIMARY KEY,
  tag_completo TEXT UNIQUE NOT NULL,
  prefixo TEXT,
  tipo_instrumento TEXT,
  descricao TEXT NOT NULL,
  localizacao TEXT,
  sistema TEXT,
  origem TEXT NOT NULL DEFAULT 'Base KOS',
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS manual_documentos (
  id BIGSERIAL PRIMARY KEY,
  documento_id TEXT UNIQUE NOT NULL,
  origem_tipo TEXT NOT NULL CHECK (origem_tipo IN ('manual_completo','vault_fragmento','kos_conhecimento')),
  sistema TEXT,
  pasta TEXT,
  titulo TEXT NOT NULL,
  conteudo_md TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_manual_documentos_fts
  ON manual_documentos USING gin (to_tsvector('portuguese', titulo || ' ' || conteudo_md));
CREATE INDEX IF NOT EXISTS idx_manual_documentos_sistema ON manual_documentos (sistema);
CREATE INDEX IF NOT EXISTS idx_manual_documentos_pasta ON manual_documentos (pasta);

CREATE TABLE IF NOT EXISTS manual_tag_mentions (
  id BIGSERIAL PRIMARY KEY,
  documento_id BIGINT REFERENCES manual_documentos(id) ON DELETE CASCADE,
  tag_completo TEXT NOT NULL REFERENCES equipamentos_referencia(tag_completo),
  trecho TEXT NOT NULL,
  linha INT,
  criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mentions_tag ON manual_tag_mentions (tag_completo);
CREATE INDEX IF NOT EXISTS idx_mentions_documento ON manual_tag_mentions (documento_id);

CREATE TABLE IF NOT EXISTS tag_manual_vinculo (
  id BIGSERIAL PRIMARY KEY,
  tag_id BIGINT REFERENCES tags(id) ON DELETE CASCADE,
  tag_referencia TEXT REFERENCES equipamentos_referencia(tag_completo),
  origem TEXT NOT NULL DEFAULT 'auto' CHECK (origem IN ('auto','manual','kos')),
  confianca TEXT NOT NULL DEFAULT 'sugerido' CHECK (confianca IN ('sugerido','confirmado')),
  vinculado_por TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tag_id, tag_referencia)
);

CREATE INDEX IF NOT EXISTS idx_vinculo_tag_id ON tag_manual_vinculo (tag_id);
CREATE INDEX IF NOT EXISTS idx_vinculo_confianca ON tag_manual_vinculo (confianca);

ALTER TABLE equipamentos_referencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_tag_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_manual_vinculo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_equipamentos_referencia" ON equipamentos_referencia FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_manual_documentos" ON manual_documentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_manual_tag_mentions" ON manual_tag_mentions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_tag_manual_vinculo" ON tag_manual_vinculo FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION gerar_sugestao_vinculo_manual()
RETURNS TRIGGER AS $$
DECLARE ref_tag TEXT;
BEGIN
  SELECT tag_completo INTO ref_tag FROM equipamentos_referencia WHERE tag_completo = NEW.tag_completo LIMIT 1;
  IF ref_tag IS NULL AND NEW.ultimos4 IS NOT NULL THEN
    SELECT tag_completo INTO ref_tag FROM equipamentos_referencia WHERE right(tag_completo, 4) = NEW.ultimos4 LIMIT 1;
  END IF;
  IF ref_tag IS NOT NULL THEN
    INSERT INTO tag_manual_vinculo (tag_id, tag_referencia, origem, confianca)
    VALUES (NEW.id, ref_tag, 'auto', 'sugerido')
    ON CONFLICT (tag_id, tag_referencia) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_gerar_sugestao_vinculo_manual
  AFTER INSERT OR UPDATE OF tag_completo, ultimos4 ON tags
  FOR EACH ROW EXECUTE FUNCTION gerar_sugestao_vinculo_manual();
