-- =====================================================================
-- Migration: Módulo "Manual Técnico" — Sistema TAG (Klabin CDF2)
-- Não altera tabelas existentes (tags, comentarios, fotos, users).
-- =====================================================================

-- 1. Catálogo de equipamentos/instrumentos de referência (seed a partir
--    de tags_caldeira_catalogo_v2.csv)
CREATE TABLE equipamentos_referencia (
  id BIGSERIAL PRIMARY KEY,
  tag_completo TEXT UNIQUE NOT NULL,
  prefixo TEXT,
  tipo_instrumento TEXT,
  descricao TEXT NOT NULL,
  origem TEXT NOT NULL, -- 'PDF+Vault' | 'PDF (sem contexto no vault)' | 'Manual completo (sem lista oficial)' etc.
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- 2. Documentos-fonte do manual (capítulos completos + fragmentos do vault)
CREATE TABLE manual_documentos (
  id BIGSERIAL PRIMARY KEY,
  documento_id TEXT UNIQUE NOT NULL,     -- slug único (nome do arquivo/capítulo)
  origem_tipo TEXT NOT NULL CHECK (origem_tipo IN ('manual_completo','vault_fragmento')),
  sistema TEXT,                          -- ex: "5.7 - Sistema de Alimentação de Combustível" (manual_completo)
  pasta TEXT,                            -- ex: "04_Operacao_Normal" (vault_fragmento)
  titulo TEXT NOT NULL,
  conteudo_md TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_manual_documentos_fts
  ON manual_documentos USING gin (to_tsvector('portuguese', titulo || ' ' || conteudo_md));
CREATE INDEX idx_manual_documentos_sistema ON manual_documentos (sistema);
CREATE INDEX idx_manual_documentos_pasta ON manual_documentos (pasta);

-- 3. Cada menção textual de um TAG dentro de um documento-fonte
CREATE TABLE manual_tag_mentions (
  id BIGSERIAL PRIMARY KEY,
  documento_id BIGINT REFERENCES manual_documentos(id) ON DELETE CASCADE,
  tag_completo TEXT NOT NULL REFERENCES equipamentos_referencia(tag_completo),
  trecho TEXT NOT NULL,
  linha INT,
  criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mentions_tag ON manual_tag_mentions (tag_completo);
CREATE INDEX idx_mentions_documento ON manual_tag_mentions (documento_id);

-- 4. Vínculo entre o ativo físico cadastrado (tags.id) e o TAG de
--    referência do manual (equipamentos_referencia.tag_completo)
CREATE TABLE tag_manual_vinculo (
  id BIGSERIAL PRIMARY KEY,
  tag_id BIGINT REFERENCES tags(id) ON DELETE CASCADE,
  tag_referencia TEXT REFERENCES equipamentos_referencia(tag_completo),
  origem TEXT NOT NULL DEFAULT 'auto' CHECK (origem IN ('auto','manual')),
  confianca TEXT NOT NULL DEFAULT 'sugerido' CHECK (confianca IN ('sugerido','confirmado')),
  vinculado_por TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tag_id, tag_referencia)
);

CREATE INDEX idx_vinculo_tag_id ON tag_manual_vinculo (tag_id);
CREATE INDEX idx_vinculo_confianca ON tag_manual_vinculo (confianca);

-- =====================================================================
-- RLS (segue o mesmo padrão público já usado nas tabelas existentes —
-- ajustar depois se for necessário restringir por cargo/gerência)
-- =====================================================================
ALTER TABLE equipamentos_referencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_tag_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_manual_vinculo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acesso público a equipamentos_referencia"
  ON equipamentos_referencia FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso público a manual_documentos"
  ON manual_documentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso público a manual_tag_mentions"
  ON manual_tag_mentions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso público a tag_manual_vinculo"
  ON tag_manual_vinculo FOR ALL USING (true) WITH CHECK (true);

-- =====================================================================
-- Função + trigger: gera sugestão automática de vínculo sempre que um
-- TAG físico é criado/atualizado em `tags`, casando por tag_completo
-- exato e, na ausência de match exato, pelos últimos 4 dígitos.
-- Nunca marca como 'confirmado' automaticamente.
-- =====================================================================
CREATE OR REPLACE FUNCTION gerar_sugestao_vinculo_manual()
RETURNS TRIGGER AS $$
DECLARE
  ref_tag TEXT;
BEGIN
  -- 1) tentativa por igualdade exata
  SELECT tag_completo INTO ref_tag
  FROM equipamentos_referencia
  WHERE tag_completo = NEW.tag_completo
  LIMIT 1;

  -- 2) fallback por últimos 4 dígitos, se não achou exato
  IF ref_tag IS NULL AND NEW.ultimos4 IS NOT NULL THEN
    SELECT tag_completo INTO ref_tag
    FROM equipamentos_referencia
    WHERE right(tag_completo, 4) = NEW.ultimos4
    LIMIT 1;
  END IF;

  IF ref_tag IS NOT NULL THEN
    INSERT INTO tag_manual_vinculo (tag_id, tag_referencia, origem, confianca)
    VALUES (NEW.id, ref_tag, 'auto', 'sugerido')
    ON CONFLICT (tag_id, tag_referencia) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_gerar_sugestao_vinculo_manual
  AFTER INSERT OR UPDATE OF tag_completo, ultimos4 ON tags
  FOR EACH ROW
  EXECUTE FUNCTION gerar_sugestao_vinculo_manual();

-- =====================================================================
-- Backfill: roda a mesma lógica para os TAGs que já existem em `tags`
-- antes desta migration (executar uma vez, após o seed de
-- equipamentos_referencia estar populado).
-- =====================================================================
INSERT INTO tag_manual_vinculo (tag_id, tag_referencia, origem, confianca)
SELECT t.id, er.tag_completo, 'auto', 'sugerido'
FROM tags t
JOIN equipamentos_referencia er ON er.tag_completo = t.tag_completo
ON CONFLICT (tag_id, tag_referencia) DO NOTHING;

INSERT INTO tag_manual_vinculo (tag_id, tag_referencia, origem, confianca)
SELECT t.id, er.tag_completo, 'auto', 'sugerido'
FROM tags t
JOIN equipamentos_referencia er ON right(er.tag_completo, 4) = t.ultimos4
WHERE NOT EXISTS (
  SELECT 1 FROM tag_manual_vinculo v
  WHERE v.tag_id = t.id AND v.tag_referencia = er.tag_completo
)
ON CONFLICT (tag_id, tag_referencia) DO NOTHING;