# Blueprint: Integração do Manual da Caldeira (Vault) ao Sistema TAG

## 1. Diagnóstico do que você já tem

**Vault** (`vault_caldeira_forca`): 118 fragmentos Markdown (frontmatter YAML + conteúdo), organizados em 13 pastas por fase/categoria (Introdução, Especificações, Preparação, Partida, Operação Normal, Desligamento, Troubleshooting, Manutenção, Química da Água, Intertravamentos SRS, Segurança, Análise de Riscos, Curvas). Dentro do texto existem **149 TAGs de instrumento reais** no padrão ISA (`[loop]-[prefixo][número]`, ex. `37221-FV-5015`), citados 1 a 6+ vezes cada, em contextos de partida, operação, intertravamento etc.

**Sistema TAG** (Supabase): tabela `tags` já modela exatamente esse tipo de ativo — `tag_completo` (obrigatoriamente terminado em 4 dígitos), `ultimos4`, `nome_equipamento`, `localizacao_texto`, `status`, `nota_manutencao` — mais `comentarios` e `fotos` ligados por `tag_id`. A área "Manutenção" já lista fisicamente **CDF I, CDF II, ETAC I, ETAC II** — ou seja, o próprio sistema já prevê a Caldeira de Força 2 como área operacional.

**A ponte natural:** os 4 últimos dígitos que o Sistema TAG já exige (`ultimos4`) são o mesmo número que aparece no sufixo dos TAGs de instrumento do manual (`FV-5015` → `5015`). Isso significa que, para os TAGs da área CDF2, é plausível casar automaticamente um `tags.tag_completo` do seu sistema com um TAG de instrumento do manual pelo número final + prefixo de função.

⚠️ Ressalva importante: TAGs de instrumento do manual (P&ID/loop, ex. `FV`, `TIC`, `XS`) e os TAGs físicos de ativos que os operadores cadastram no seu sistema podem não ser 100% o mesmo universo — o manual descreve malha de controle/processo, o sistema descreve ativos físicos etiquetados em campo. Antes de automatizar em massa, valide manualmente uma amostra (10–15 tags) comparando `tag_completo` real cadastrado no CDF2 com os TAGs do índice gerado.

---

## 2. Modelo de dados proposto (Supabase)

Duas tabelas novas + 1 tabela de vínculo, sem alterar o schema existente de `tags`:

```sql
-- 1. Fragmentos do manual (um registro por arquivo .md do vault)
CREATE TABLE manual_documentos (
  id BIGSERIAL PRIMARY KEY,
  documento_id TEXT UNIQUE NOT NULL,        -- frontmatter "id" (ex: cf_introducao_geral)
  categoria TEXT NOT NULL,                  -- frontmatter "categoria"
  pasta TEXT NOT NULL,                      -- ex: "04_Operacao_Normal"
  equipamento_foco TEXT,                    -- frontmatter "equipamento_foco"
  titulo TEXT NOT NULL,
  conteudo_md TEXT NOT NULL,                -- markdown completo do fragmento
  tags_frontmatter TEXT[],                  -- array "tags:" do frontmatter
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_manual_documentos_fts
  ON manual_documentos USING gin (to_tsvector('portuguese', titulo || ' ' || conteudo_md));
CREATE INDEX idx_manual_documentos_categoria ON manual_documentos (categoria);

-- 2. Cada menção de um TAG de instrumento dentro de um fragmento
CREATE TABLE manual_tag_mentions (
  id BIGSERIAL PRIMARY KEY,
  documento_id BIGINT REFERENCES manual_documentos(id) ON DELETE CASCADE,
  instrument_tag TEXT NOT NULL,             -- forma curta, ex: "FV-5015"
  loop_prefix TEXT,                         -- ex: "37221"
  full_tag TEXT,                            -- ex: "37221-FV-5015"
  prefixo_funcional TEXT,                   -- ex: "FV" (para agrupar por tipo)
  trecho TEXT NOT NULL,                     -- linha/parágrafo de contexto
  linha INT,
  criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mentions_instrument_tag ON manual_tag_mentions (instrument_tag);
CREATE INDEX idx_mentions_ultimos4 ON manual_tag_mentions ((right(instrument_tag, 4)));

-- 3. Vínculo entre o TAG físico do seu sistema e o(s) TAG(s) de instrumento do manual
CREATE TABLE tag_manual_vinculo (
  id BIGSERIAL PRIMARY KEY,
  tag_id BIGINT REFERENCES tags(id) ON DELETE CASCADE,
  instrument_tag TEXT NOT NULL,             -- FK lógica para manual_tag_mentions.instrument_tag
  origem TEXT NOT NULL DEFAULT 'auto' CHECK (origem IN ('auto','manual')),
  confianca TEXT DEFAULT 'sugerido' CHECK (confianca IN ('sugerido','confirmado')),
  vinculado_por TEXT,                       -- nome de quem confirmou (se manual)
  criado_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tag_id, instrument_tag)
);
```

Por que uma tabela de vínculo separada (e não uma FK direta em `tags`)? Porque um único ativo físico pode aparecer citado sob mais de um TAG de instrumento (ex. uma bomba de água de alimentação pode ter o `SIC-1040` do controlador de velocidade e o `FV-5015` da válvula associada), e porque o vínculo precisa nascer como **sugestão automática** e ser **confirmado por um humano** antes de virar verdade no sistema — evita mostrar documentação errada em campo.

---

## 3. Pipeline de ingestão (rodar uma vez, e sempre que o vault for atualizado)

Um script (Node/TS, no seu padrão de `supabase/functions` ou um script utilitário local) que:

1. Lê cada `.md` do vault, faz parse do frontmatter YAML (`id`, `setor`, `categoria`, `equipamento_foco`, `tags`).
2. Insere/atualiza em `manual_documentos` (upsert por `documento_id`).
3. Varre o corpo do texto com uma regex ISA (`/\b(?:(\d{2,6})-)?([A-Z]{2,5})-(\d{2,5}[A-Z]?)\b/g`, filtrando prefixos válidos: FV, FIC, FI, FT, TIC, TI, TV, TT, PIC, PI, PT, PV, LIC, LT, LI, LV, XS, XC, XI, ZSH, ZS, HV, HS, AI, AT, SIC, SI, SV, DIT) e grava cada ocorrência em `manual_tag_mentions`.
4. Gera automaticamente sugestões em `tag_manual_vinculo`: para cada linha de `tags` cuja `ultimos4` bate com o sufixo numérico de algum `instrument_tag`, cria um registro com `origem='auto'`, `confianca='sugerido'`.

*(O índice em `indice_tags_manual_caldeira.md`, que já gerei a partir do seu vault, é essencialmente o resultado desse passo 3 — pode ser usado como conferência/seed inicial, ou o script pode rodar direto sobre os arquivos.)*

---

## 4. API (Edge Function) — endpoints novos

Seguindo o padrão que você já usa (`db.tsx` + `index.tsx`):

| Endpoint | Ação |
|---|---|
| `GET /tags/:id/manual` | Retorna fragmentos vinculados (confirmados) + sugestões pendentes para aquele TAG |
| `GET /manual/search?q=` | Busca full-text (`to_tsvector('portuguese', ...)`) em `manual_documentos`, para quando não há vínculo automático |
| `POST /tags/:id/manual/vincular` | Confirma uma sugestão (`confianca='sugerido' → 'confirmado'`) ou cria vínculo manual novo |
| `DELETE /tags/:id/manual/:vinculoId` | Remove vínculo incorreto |

`db.tsx` ganha `getManualByTagId(tagId)`, `searchManual(query)`, `confirmarVinculo(...)`, `removerVinculo(...)` — mesmo estilo das funções que você já tem para `comentarios`/`fotos`.

---

## 5. UI — onde isso aparece para o operador

Na **ficha técnica do equipamento** (a mesma tela que hoje tem abas de Comentários e Fotos), uma nova aba **"Manual Técnico"**:

- Se houver vínculo confirmado: mostra o(s) TAG(s) de instrumento associados, com **badge do tipo** (ex. "FV — Válvula de Controle de Vazão"), e os trechos do manual agrupados por fase operacional (Partida / Operação Normal / Desligamento / Intertravamentos / Segurança / Troubleshooting) em accordions colapsáveis — o operador abre só a fase que precisa no momento.
- Se houver só sugestões automáticas (não confirmadas): mostra com um aviso "possível referência — confirmar", visível apenas para Gestor/Coordenador, com botão de confirmar/rejeitar (isso vira parte do fluxo de curadoria, não aparece pra Operação até ser validado).
- Se não houver nada: campo de busca que chama `GET /manual/search`, com opção de "vincular manualmente este resultado ao TAG".

Isso reaproveita exatamente os componentes de accordion/abas e o padrão de permissões por cargo (Coordenador vê, Operação não edita) que você já implementou em 1.3.x.

---

## 6. Fase futura (opcional): busca semântica / "pergunte sobre o equipamento"

Dado que você já mexe com Claude API/OpenRouter (Jarvis) e Supabase, o caminho natural depois da Fase 1–3 é trocar a busca full-text por **busca vetorial** (`pgvector` no Supabase, embeddings dos fragmentos) e um endpoint tipo `POST /tags/:id/manual/perguntar`, que monta um prompt com os fragmentos relevantes daquele TAG + a pergunta do operador e chama a API da Anthropic — um "explique este alarme" ou "o que fazer se XS-6227 não fechar" respondido a partir do próprio manual. Vale deixar para depois de validar que o vínculo automático (Fase 1–3) está confiável — é a parte que dá mais valor prático imediato com menos risco.

---

## 6.1 Atualização: agora você tem a lista oficial Klabin

Com o PDF `Tags_e_Descricoes_Caldeira_2.pdf` (documento Klabin `37220-P-MNT-00035-0001`), a Fase 1 do pipeline muda de "só extrair TAGs do texto do manual" para "importar a lista oficial como verdade, e usar o vault só para trazer contexto operacional":

- `tags_caldeira_catalogo.csv` (gerado) já é o **seed pronto** para popular uma tabela `equipamentos_referencia` (ou os próprios `manual_documentos`/`manual_tag_mentions`, adaptando): 352 TAGs oficiais + 25 TAGs vistos no vault sem descrição oficial, com colunas `tag_completo`, `prefixo`, `tipo_instrumento`, `descricao_oficial`, `fases_manual_vault`, `trecho_manual_exemplo`, `origem`.
- Isso resolve a ressalva da seção 1: agora você não depende de casar `ultimos4` por adivinhação — a lista oficial já traz o `tag_completo` real da Klabin, então o vínculo com `tags.tag_completo` do seu sistema pode (e deve) ser por **igualdade exata de string**, não por sufixo numérico. Só recorra ao matching por `ultimos4` como fallback, para os casos em que o operador cadastrou o TAG sem o prefixo de loop completo.
- Dos 352 TAGs oficiais, 124 já têm trecho do manual vinculado automaticamente; os outros 228 entram no sistema com a descrição oficial preenchida e o campo de contexto do manual **em branco, mas com o vínculo pronto para receber conteúdo** assim que você mapear mais fragmentos do manual (ou completar o vault).
- `catalogo_tags_caldeira.md` é a versão legível do mesmo dado, organizada por tipo de instrumento (prefixo), útil para conferência humana antes de rodar a importação.

## 6.2 Atualização: manual completo por sistema (20 capítulos Andritz)

Com `Sistema_CDF2.zip` você me deu o manual original completo — os mesmos capítulos que provavelmente geraram os 118 fragmentos do vault, só que na íntegra e organizados por **sistema físico** (Introdução, Leito Fluidizado, e os 16 subsistemas 5.1 a 5.16: Água e Vapor, Sopradores de Fuligem, Ar, Gases de Combustão, Alimentação de Combustível, Manuseio de Cinza, Dosagem Química, Amostragem, Água de Resfriamento, Água de Incêndio, Óleo etc., mais o capítulo de Operação Klabin) em vez de por fase operacional.

Isso muda a cobertura de forma significativa: dos 352 TAGs oficiais, **286 agora têm pelo menos um trecho do manual associado** (contra 124 usando só o vault) — o manual completo tinha o texto que os fragmentos resumidos tinham cortado. Restam **66 TAGs genuinamente sem nenhuma menção textual** nas fontes disponíveis (a maioria são equipamentos mecânicos simples — motores, calhas, gavetas — citados só na lista oficial, sem uma seção dedicada no manual).

Para o modelo de dados da seção 2, isso sugere um ajuste: `manual_documentos` ganha uma segunda dimensão de categorização, além de `pasta` (fase, vinda do vault):

```sql
ALTER TABLE manual_documentos ADD COLUMN sistema TEXT;
-- ex: "5.7 - Sistema de Alimentação de Combustível"
```

Assim, na aba "Manual Técnico" da ficha do equipamento, dá pra mostrar dois agrupamentos complementares: **por sistema** (de onde ele é fisicamente, útil pra entender o processo) e **por fase** (quando ele aparece — partida, operação, intertravamento — útil pra troubleshooting em campo). Ingerir os 20 capítulos como documentos adicionais em `manual_documentos` (com `pasta = NULL` e `sistema` preenchido) resolve isso sem mudar a estrutura da tabela.

`catalogo_tags_caldeira_v2.md` e `tags_caldeira_catalogo_v2.csv` já refletem essa fonte combinada — use a v2 no lugar da v1 para o seed inicial.

## 7. Ordem de implementação sugerida

1. **Ingestão** — script que popula `manual_documentos` + `manual_tag_mentions` (posso gerar esse script agora, em TS, se quiser).
2. **Vínculo automático** — gerar sugestões via `ultimos4`, validar manualmente uma amostra antes de confiar no matching em massa.
3. **Migration SQL** — as 3 tabelas acima, seguindo o mesmo padrão de migrations numeradas (`2026MMDDHHMMSS_manual_tecnico.sql`) que você já usa.
4. **Backend** — 4 endpoints + funções `db.tsx`.
5. **Frontend** — aba "Manual Técnico" na ficha do equipamento + busca full-text de fallback.
6. **(Opcional)** — RAG com pgvector + API Anthropic para Q&A sobre o equipamento.

Posso gerar agora o script de ingestão (Node/TS) e a migration SQL completa, prontos para colar no seu projeto — quer que eu já monte isso?
