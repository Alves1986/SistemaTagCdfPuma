# Sistema TAG KOS — App como Interface de Consulta da Base KOS

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o app `SistemaTagCdfPuma` na interface de consulta da base KOS — ao acessar um TAG, o app mostra **localização** (folha P&ID + sistema), **descrição** e **tudo relacionado** (equipamentos, fluxos, alarmes via wiki-links), com botões de navegação e um **agente de IA "bibliotecário"** que responde com base na base KOS. A base KOS (Obsidian, em OneDrive) é a **única fonte** de conhecimento (o vault manual em `vault_caldeira_forca` foi removido).

**Architecture:** Um script Python (`scripts/kos_to_supabase.py`) varre a base KOS (`C:/Users/Cassi/OneDrive/Documentos/Anderson/TAG KOS/KOS`) e gera dados para 3 tabelas do módulo Manual Técnico: `equipamentos_referencia` (1.065 equipamentos), `manual_documentos` (1.196 notas KOS como documentos pesquisáveis, `origem_tipo='kos_conhecimento'`), `manual_tag_mentions` (relacionamentos/wiki-links como trechos). O app React consome via Edge Function + fallback localStorage. A aba "Base KOS" no `TagDetailPage` renderiza localização/descrição/relacionados; um botão abre o agente bibliotecário (RAG simples: busca full-text nos `manual_documentos` + chama LLM com o contexto).

**Tech Stack:** React 19 + TS + Vite + Tailwind + MUI; Supabase (Postgres + Edge Functions Deno); Python/fitz para importar KOS; LLM via OpenRouter/Jarvis (conforme blueprint `integracao_manual_sistema_tag.md` cita).

**Estado atual (diagnosticado):**
- Base KOS: 1.196 itens em 16 pastas (1.065 equipamento, 44 linha, 24 conhecimento, 13 mapa, 12 sistema, 11 treinamento, 9 diagnostico, 7 fluxo, 3 alarme, 2 procedimento, 2 intertravamento, 2 bloqueio, 1 relatorio, 1 documento-fonte). Todos `status: revisao`. Estrutura: `KOS/<Sistema>/<Subpasta>/Equipamento-<TAG>.md`.
- `vault_caldeira_forca` **removido** pelo usuário (era manual/duplicado).
- `.env` vazio → app em localStorage fallback; Supabase ainda não configurado.
- Módulo Manual Técnico NUNCA aplicado: nenhuma migration cria as tabelas; `db.tsx` usa `manual_vinculos`, `api.ts` usa `tag_manual_vinculo` (divergem); `fetchManualForTag` retorna `vinculos: []` hardcoded; `ingestao_manual.ts` fora do schema.
- Fonte da verdade de schema: `UPGRADE TAG KLABIN/MANUAL TECNICO.SQL` (usa `tag_manual_vinculo`, campo `tag_referencia TEXT`).

**Decisão de nomenclatura (fonte da verdade = MANUAL TECNICO.SQL):** tabela de vínculo = **`tag_manual_vinculo`** (campos `tag_id`, `tag_referencia TEXT`, `origem`, `confianca TEXT`, `vinculado_por`). `db.tsx` e `api.ts` corrigidos para esse nome.

---

## Fase 0 — Unificar schema canônico (decisão documentada)

- [ ] **Step 1: Editar `README.md`** adicionando seção "Módulo Manual Técnico — Schema Canônico" documentando as 4 tabelas e que `tag_referencia` é TEXT (não `tag_referencia_id`); confiança é TEXT ('sugerido'/'confirmado').

---

## Fase 1 — Migration SQL canônica

**Files:** Create `supabase/migrations/20260721_manual_tecnico.sql`

- [ ] **Step 1: Criar migration** com conteúdo exato (4 tabelas + índices + RLS + trigger de sugestão automática por `tag_completo`/`ultimos4`):

```sql
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

CREATE INDEX idx_manual_documentos_fts ON manual_documentos USING gin (to_tsvector('portuguese', titulo || ' ' || conteudo_md));
CREATE INDEX idx_manual_documentos_sistema ON manual_documentos (sistema);

CREATE TABLE IF NOT EXISTS manual_tag_mentions (
  id BIGSERIAL PRIMARY KEY,
  documento_id BIGINT REFERENCES manual_documentos(id) ON DELETE CASCADE,
  tag_completo TEXT NOT NULL REFERENCES equipamentos_referencia(tag_completo),
  trecho TEXT NOT NULL,
  linha INT,
  criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mentions_tag ON manual_tag_mentions (tag_completo);

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

CREATE INDEX idx_vinculo_tag_id ON tag_manual_vinculo (tag_id);

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
    VALUES (NEW.id, ref_tag, 'auto', 'sugerido') ON CONFLICT (tag_id, tag_referencia) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_gerar_sugestao_vinculo_manual
  AFTER INSERT OR UPDATE OF tag_completo, ultimos4 ON tags
  FOR EACH ROW EXECUTE FUNCTION gerar_sugestao_vinculo_manual();
```

- [ ] **Step 2: Commit** `git add supabase/migrations/20260721_manual_tecnico.sql README.md && git commit -m "feat(db): migration canônica módulo Manual Técnico (Sistema TAG KOS)"`

---

## Fase 2 — Backend `db.tsx` (schema canônico)

**Files:** Modify `supabase/functions/server/db.tsx:197-279`

- [ ] **Step 1: Substituir as 4 funções de manual** por versão canônica (usa `tag_manual_vinculo`, `tag_referencia`, retorna vínculos reais):

```ts
export const getManualByTagId = async (tagId: string) => {
  const supabase = client();
  const { data: tag, error: tagError } = await supabase.from("tags").select("tag_completo").eq("id", tagId).single();
  if (tagError) throw new Error(tagError.message);
  const { data: vinculos, error: vinculoError } = await supabase.from("tag_manual_vinculo").select(`
    id, tag_referencia, origem, confianca, vinculado_por, criado_em,
    equipamentos_referencia (tag_completo, prefixo, tipo_instrumento, descricao, localizacao, sistema, origem)
  `).eq("tag_id", tagId);
  if (vinculoError) throw new Error(vinculoError.message);
  const tagsCompletos = (vinculos || []).map((v: any) => (v.equipamentos_referencia as any)?.tag_completo).filter(Boolean) as string[];
  if (tagsCompletos.length === 0) tagsCompletos.push(tag.tag_completo);
  const { data: mentions, error: mentionsError } = await supabase.from("manual_tag_mentions").select(`
    id, tag_completo, trecho, linha, manual_documentos (id, documento_id, titulo, sistema, origem_tipo, pasta)
  `).in("tag_completo", tagsCompletos);
  if (mentionsError) throw new Error(mentionsError.message);
  return { vinculos: vinculos || [], mentions: mentions || [] };
};

export const searchManual = async (query: string) => {
  const supabase = client();
  const { data, error } = await supabase.from("manual_documentos")
    .select("id, documento_id, titulo, sistema, origem_tipo, pasta")
    .textSearch("conteudo_md", query);
  if (error) throw new Error(error.message);
  return data;
};

export const criarVinculoManual = async (tagId: string, tagRefId: string, confianca: string, usuario: string) => {
  const supabase = client();
  const { data, error } = await supabase.from("tag_manual_vinculo").insert({
    tag_id: tagId, tag_referencia: tagRefId, origem: 'manual', confianca: confianca || 'confirmado', vinculado_por: usuario
  }).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const desvincularManual = async (vinculoId: string) => {
  const supabase = client();
  const { error } = await supabase.from("tag_manual_vinculo").delete().eq("id", vinculoId);
  if (error) throw new Error(error.message);
  return true;
};
```

- [ ] **Step 2: Commit** `git add supabase/functions/server/db.tsx && git commit -m "fix(backend): db.tsx usa schema canônico tag_manual_vinculo"`

---

## Fase 3 — Frontend `api.ts`

**Files:** Modify `src/app/services/api.ts:691-771`

- [ ] **Step 1: `fetchManualForTag`** buscar vínculos reais (igual lógica do db.tsx, via `supabase` client do app) e retornar `vinculos` + `mentions`.
- [ ] **Step 2: `vincularManual`/`desvincularManual`** usar `tag_manual_vinculo` + `tag_referencia`.
- [ ] **Step 3: Adicionar fallback local** (`localStorage` `tag_manual_vinculo`) para quando `.env` vazio.
- [ ] **Step 4: Commit**

---

## Fase 4 — Script de importação da base KOS (`kos_to_supabase.py`)

**Files:** Create `scripts/kos_to_supabase.py`

Este script é o coração da "fonte KOS". Ele varre a base KOS e gera 3 CSVs de import.

- [ ] **Step 1: Escrever o script** (lógica completa):

```python
import pathlib, re, csv, json
KOS = pathlib.Path(r'C:/Users/Cassi/OneDrive/Documentos/Anderson/TAG KOS/KOS')
OUT = pathlib.Path(r'UPGRADE TAG KLABIN/kos_import')
OUT.mkdir(parents=True, exist_ok=True)

def fm(txt, key):
    m = re.search(rf'^{key}:\s*(.+)', txt, re.M)
    return m.group(1).strip() if m else ''

ref_rows, doc_rows, mention_rows = [], [], []
for p in KOS.rglob('*.md'):
    txt = p.read_text(encoding='utf-8', errors='ignore')
    if not txt.startswith('---'): continue
    tag = fm(txt, 'tag')
    tipo = fm(txt, 'tipo')
    sistema = fm(txt, 'sistema')
    local = fm(txt, 'localizacao_pid')
    # título = primeira linha # ou tag
    title_m = re.search(r'^# (.+)', txt, re.M)
    titulo = title_m.group(1).strip() if title_m else (tag or p.stem)
    # descrição = seção "O que é" ou "Como Funciona"
    desc = ''
    for sec in ['O que é', 'Como Funciona', 'Finalidade']:
        m = re.search(rf'## {sec}\s*\n(.*?)(?=\n## |\Z)', txt, re.S)
        if m:
            desc = m.group(1).strip()[:300]
            if desc: break
    doc_id = 'kos-' + p.stem
    doc_rows.append({
        'documento_id': doc_id,
        'origem_tipo': 'kos_conhecimento',
        'sistema': sistema,
        'pasta': str(p.parent.relative_to(KOS)).replace('\\','/'),
        'titulo': titulo,
        'conteudo_md': txt
    })
    if tipo == 'equipamento' and tag:
        ref_rows.append({
            'tag_completo': tag,
            'prefixo': tag.split('-')[1] if '-' in tag else '',
            'tipo_instrumento': fm(txt, 'funcao_isa'),
            'descricao': desc or titulo,
            'localizacao': (local + ' | ' if local else '') + ('Sistema: ' + sistema if sistema else ''),
            'sistema': sistema,
            'origem': 'Base KOS'
        })
        # related = wiki-links nas seções "Equipamentos/Fluxos/Alarmes Relacionados"
        for sec in ['Equipamentos Relacionados','Fluxos Relacionados','Alarmes Relacionados','Intertravamentos Relacionados']:
            m = re.search(rf'## {sec}\s*\n(.*?)(?=\n## |\Z)', txt, re.S)
            if m:
                for link in re.findall(r'\[\[([^\]]+)\]\]', m.group(1)):
                    mention_rows.append({'tag_completo': tag, 'trecho': f'{sec}: [[{link}]]', 'documento_id_doc': doc_id})
    # todos os wiki-links viram mention do próprio doc
    for link in set(re.findall(r'\[\[([^\]]+)\]\]', txt)):
        mention_rows.append({'tag_completo': tag or p.stem, 'trecho': f'Link: [[{link}]]', 'documento_id_doc': doc_id})

# Escrever CSVs
def write_csv(name, rows, fields):
    if not rows: return
    with open(OUT / name, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=fields); w.writeheader()
        for r in rows: w.writerow({k: r.get(k,'') for k in fields})

write_csv('equipamentos_referencia.csv', ref_rows, ['tag_completo','prefixo','tipo_instrumento','descricao','localizacao','sistema','origem'])
write_csv('manual_documentos.csv', doc_rows, ['documento_id','origem_tipo','sistema','pasta','titulo','conteudo_md'])
write_csv('manual_tag_mentions.csv', mention_rows, ['tag_completo','trecho','documento_id_doc'])
print(f'equipamentos={len(ref_rows)} documentos={len(doc_rows)} mentions={len(mention_rows)}')
```

- [ ] **Step 2: Rodar e conferir**

```bash
python scripts/kos_to_supabase.py
```

Expected: `equipamentos=1065 documentos=1196 mentions=NNNN`.

- [ ] **Step 3: Commit** `git add scripts/kos_to_supabase.py "UPGRADE TAG KLABIN/kos_import" && git commit -m "feat(kos): script de importação da base KOS para o módulo"`

---

## Fase 5 — UI: Aba "Base KOS" no `TagDetailPage`

**Files:** Modify `src/app/components/TagDetailPage.tsx` + `ManualTecnicoTab.tsx`

- [ ] **Step 1: Renomear aba "Manual Técnico" → "Base KOS"** e renderizar:
  - **Localização**: `vinculos[].equipamentos_referencia.localizacao` (ex: "P&ID folha 13 | Sistema: vapor")
  - **Descrição**: `vinculos[].equipamentos_referencia.descricao`
  - **Botões "Ver relacionados"**: para cada `mention` de tipo `Equipamentos/Fluxos/Alarmes Relacionados`, um botão que abre o documento correspondente (busca em `manual_documentos` por título contendo o link)
  - **Badge "Origem: KOS"**
- [ ] **Step 2: Tratar `mentions` agrupados por sistema** (já existe em `ManualTecnicoTab`)
- [ ] **Step 3: Commit**

---

## Fase 6 — Agente Bibliotecário (IA "bibliotecário")

**Files:** Create `src/app/components/BibliotecarioTab.tsx`; Modify `src/app/services/api.ts` (função `perguntarBibliotecario`)

- [ ] **Step 1: Backend `db.tsx`** adicionar `getContextoPorTag(tagCompleto)` que retorna os `manual_documentos` + `mentions` relacionados (contexto para o LLM).
- [ ] **Step 2: `api.ts`** adicionar `perguntarBibliotecario(tagCompleto, pergunta)` que:
  1. Busca contexto (full-text nos `manual_documentos` do sistema/tag)
  2. Chama a API LLM (OpenRouter/Jarvis — chave em `.env` `VITE_LLM_KEY` ou similar) com prompt: "Você é o bibliotecário da base KOS da Caldeira de Força 2. Responda com base SOMENTE no contexto: {contexto}. Pergunta: {pergunta}"
  3. Retorna a resposta
- [ ] **Step 3: `BibliotecarioTab.tsx`** — textarea de pergunta + botão "Perguntar ao Bibliotecário" + exibição da resposta, com fallback local (se sem chave LLM, faz busca full-text e mostra os trechos encontrados como "resposta").
- [ ] **Step 4: Type-check + build** `npx tsc --noEmit && npm run build`
- [ ] **Step 5: Commit**

---

## Fase 7 — Validação ponta-a-ponta (localStorage fallback)

- [ ] **Step 1:** `npm run dev`
- [ ] **Step 2:** Criar TAG `37221-SSH-5862` (da base KOS) → aba "Base KOS" mostra localização (folha 13), descrição, botões de relacionados.
- [ ] **Step 3:** Testar agente bibliotecário (com/sem chave LLM).
- [ ] **Step 4:** Documentar no README o status e como aplicar a migration + importar KOS no Supabase.

---

## Self-Review

1. **Spec coverage:** Localização ✓ (Fase 5), Descrição ✓, Relacionados ✓ (botões + mentions), Agente IA ✓ (Fase 6), KOS como fonte única ✓ (Fase 4, vault removido). Dashboard/versionamento/anexos/permissões ficam para Fase 2 (já existem notas/fotos/cargos no app).
2. **Placeholder scan:** Códigos reais em todos os steps. Sem TBD.
3. **Type consistency:** `tag_manual_vinculo` + `tag_referencia` consistentes em Fase 1-3. `localizacao` adicionado em `equipamentos_referencia` (Fase 1) e consumido em Fase 5.

**Fora de escopo (Fase 2):** RAG com pgvector (busca full-text já cobre), dashboard de cobertura, versionamento de documentos.
