# PROMPT MESTRE — Implementação do Módulo "Manual Técnico" no Sistema TAG (Klabin CDF2)

Você vai atuar como desenvolvedor full-stack sênior implementando uma nova funcionalidade em um sistema React (TypeScript) + Tailwind + Supabase já existente e em produção. Leia todo o contexto antes de gerar qualquer código.

**A migration SQL já está pronta em anexo (`20260720000000_manual_tecnico.sql`). Aplique-a como está — não a reescreva nem a regenere. Seu trabalho começa a partir do schema que ela cria.**

---

## 1. CONTEXTO DO SISTEMA EXISTENTE (não recriar — estender)

O **Sistema TAG** é um sistema de gestão de equipamentos industriais da Klabin, usado hoje na área CDF2 (Caldeira de Força 2) e em expansão para outras gerências (Manutenção, Fibras, Produção de Papéis, Produção de Celulose, Recuperação e Utilidades). Stack: React + TypeScript + Tailwind CSS + Lucide-React + Supabase (Postgres + Auth + Storage + Edge Functions).

### Schema atual (não alterar — só estender):

```
users (id UUID PK, nome TEXT UNIQUE, prn TEXT, cargo TEXT, gerencia TEXT, area TEXT,
       areas_coordenadas TEXT[], criado_em, atualizado_em)

tags (id BIGSERIAL PK, tag_completo TEXT UNIQUE, ultimos4 TEXT, nome_equipamento TEXT,
      localizacao_texto TEXT, status TEXT, foto_url TEXT, nota_manutencao JSONB,
      criado_em, atualizado_em, atualizado_por)
      -- tag_completo DEVE terminar em 4 dígitos numéricos (regra já existente no cadastro)

comentarios (id, tag_id FK → tags(id) ON DELETE CASCADE, autor, texto, criado_em)
fotos (id, tag_id FK → tags(id) ON DELETE CASCADE, uploader, file_path, notes, criado_em)
```

Índices GIN de full-text search em português já existem em `tags.nome_equipamento` e `tags.tag_completo`. RLS habilitado em todas as tabelas, policies públicas hoje, mas o app já controla acesso por `cargo`/`gerencia`/`area` na camada de aplicação (Coordenador só vê sua equipe, Gestão de Manutenção não vê botões operacionais, etc.).

A ficha técnica de cada TAG (`TagDetailPage` ou equivalente) já tem abas para **Comentários** e **Fotos** — é nessa mesma tela que a nova aba entra.

---

## 2. SCHEMA NOVO CRIADO PELA MIGRATION (referência — não recriar)

A migration `20260720000000_manual_tecnico.sql` já cria, nesta ordem:

1. `equipamentos_referencia` — catálogo de TAGs de instrumento/equipamento com descrição oficial (seed a partir de `tags_caldeira_catalogo_v2.csv`).
2. `manual_documentos` — documentos-fonte (capítulos completos do manual Andritz + fragmentos do vault Obsidian), com full-text search em português já indexado.
3. `manual_tag_mentions` — cada menção textual de um TAG dentro de um documento.
4. `tag_manual_vinculo` — vínculo entre `tags.id` (ativo físico cadastrado) e `equipamentos_referencia.tag_completo`, com `origem` ('auto'/'manual') e `confianca` ('sugerido'/'confirmado').
5. Trigger `trg_gerar_sugestao_vinculo_manual` — já gera sugestão automática (`confianca='sugerido'`) toda vez que um TAG é criado/editado em `tags`, casando por `tag_completo` exato e, na ausência, por `ultimos4`. Nunca confirma sozinho.
6. Backfill dos TAGs que já existiam em `tags` antes desta migration.

Você **não precisa** reimplementar essa lógica de matching — ela já roda no banco via trigger. Seu trabalho é consumir essas tabelas.

---

## 3. DADOS DE SEED DISPONÍVEIS

- `tags_caldeira_catalogo_v2.csv` — 355 linhas, colunas: `tag_completo, prefixo, tipo_instrumento, descricao, sistemas_manual, fases_vault, qtd_mencoes_manual, trecho_exemplo, fonte_trecho, origem`. Usar para popular `equipamentos_referencia` (e, a partir de `trecho_exemplo`/`fonte_trecho`, ajudar a montar `manual_tag_mentions`).
- 20 capítulos completos do manual Andritz em texto (Introdução, Leito Fluidizado, subsistemas 5.1–5.16, Operação Klabin) — fonte para `manual_documentos` com `origem_tipo='manual_completo'`.
- 118 fragmentos do vault Obsidian, organizados por fase operacional — fonte para `manual_documentos` com `origem_tipo='vault_fragmento'`.

Destes 355 TAGs, 286 já têm trecho de manual associado no CSV; os demais têm só a descrição preenchida — **não invente trecho ou descrição para os que estão em branco**, deixe pendente no banco até haver fonte real.

---

## 4. OBJETIVO FUNCIONAL

Aba **"Manual Técnico"** na ficha de cada equipamento, mostrando:
- Descrição oficial do equipamento/instrumento vinculado.
- Trechos do manual que o citam, agrupados por **sistema físico** (ex: "Sistema de Água e Vapor") e por **fase operacional** (ex: "Partida", "Intertravamentos").
- Sugestões de vínculo pendentes de confirmação (só visíveis para Coordenador/Gestão).
- Busca full-text no manual como fallback, quando não há vínculo.

---

## 5. TAREFAS

### 5.1 Ingestão (script único, documentar como re-rodar)
Script Node/TS que:
1. Lê `tags_caldeira_catalogo_v2.csv` e faz upsert em `equipamentos_referencia`.
2. Lê os 20 capítulos + 118 fragmentos e faz upsert em `manual_documentos`.
3. Para cada linha do CSV com `trecho_exemplo`/`fonte_trecho` preenchidos, cria o registro em `manual_tag_mentions`, resolvendo `documento_id` pelo arquivo-fonte.
4. Loga um resumo: quantos TAGs de referência, documentos, menções inseridos, e quantos vínculos automáticos a trigger já gerou (consulta simples em `tag_manual_vinculo`).

### 5.2 Backend (Edge Function, padrão `db.tsx` / `index.tsx` já existente)
Funções em `db.tsx`:
- `getManualByTagId(tagId)` — vínculos confirmados + sugestões pendentes daquele TAG.
- `searchManual(query: string)` — full-text search em `manual_documentos`.
- `confirmarVinculo(vinculoId, vinculadoPor)` — `confianca → 'confirmado'`.
- `criarVinculoManual(tagId, tagReferencia, vinculadoPor)` — `origem='manual'`, `confianca='confirmado'` direto.
- `removerVinculo(vinculoId)`.

Endpoints em `index.tsx`:
```
GET    /tags/:id/manual
GET    /manual/search?q=
POST   /tags/:id/manual/vincular
DELETE /tags/:id/manual/:vinculoId
```

### 5.3 Frontend
Nova aba "Manual Técnico" no mesmo componente de abas de Comentários/Fotos:
- **Vínculo confirmado:** card com `tag_completo`, `tipo_instrumento` como badge, `descricao`; accordions com trechos agrupados por sistema e por fase.
- **Sugestão pendente** (só Coordenador/Gestão, mesma lógica de permissão por `cargo` já usada no resto do sistema): lista compacta com Confirmar/Rejeitar.
- **Sem vínculo:** busca (`GET /manual/search`) + botão "vincular este resultado ao TAG".
- Reaproveitar os componentes visuais já existentes (accordion, badges, permissão condicional por cargo) — não criar um novo design system.

---

## 6. RESTRIÇÕES

- Não alterar `tags`, `comentarios`, `fotos`, `users`.
- Não expor sugestão não confirmada para a Operação — só Coordenador/Gestão.
- Não inventar descrição/trecho para os TAGs marcados como pendentes.
- TypeScript strict mode, sem `any`.
- RLS das tabelas novas já vem como policy pública (igual ao resto do sistema); se identificar risco de exposição indevida, sinalizar antes de mudar sozinho.

---

## 7. ENTREGÁVEIS

1. Confirmação de que a migration em anexo foi aplicada sem erros.
2. Script de ingestão + instruções de execução.
3. Funções `db.tsx` + endpoints `index.tsx`.
4. Componente(s) de frontend da aba "Manual Técnico".
5. Resumo final: o que foi criado, quantos vínculos automáticos existem, quantos TAGs seguem sem nenhum vínculo (decisão humana pendente).

Comece pelo script de ingestão — a migration já está pronta e deve ser aplicada primeiro, sem alterações.