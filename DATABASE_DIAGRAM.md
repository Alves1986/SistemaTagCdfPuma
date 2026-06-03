# 🗺️ Diagrama do Banco de Dados - Sistema TAG Caldeira

## 📐 Diagrama de Relacionamento (ERD)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BANCO DE DADOS                               │
│                     Sistema TAG - Caldeira                           │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐
│         USERS                │
├──────────────────────────────┤
│ PK  id (UUID)                │
│ UQ  nome (TEXT)              │
│     prn (TEXT)               │
│     cargo (TEXT)             │   ┌──────────── CHECK: Operador Lider,
│     criado_em (TIMESTAMPTZ)  │   │             Operador III, Operador II
│     atualizado_em (TSTZ)     │   └─────────────────────────────────────
└──────────────────────────────┘
        │
        │ (referência informal via nome)
        │
        ▼

┌──────────────────────────────────────────────────────────────────────┐
│                            TAGS                                       │
├──────────────────────────────────────────────────────────────────────┤
│ PK  id (BIGSERIAL)                                                   │
│ UQ  tag_completo (TEXT)                                              │
│     ultimos4 (TEXT)                                                  │
│     nome_equipamento (TEXT)                                          │
│     localizacao_texto (TEXT)                                         │
│     status (TEXT)             ┌──── CHECK: operacional, manutenção,  │
│     foto_url (TEXT)           │     inativo                          │
│     criado_em (TIMESTAMPTZ)   └──────────────────────────────────────│
│     atualizado_em (TSTZ)                                             │
│     atualizado_por (TEXT)                                            │
│     nota_manutencao (JSONB)   ┌──── {numero_nota, data_abertura,    │
│                               │      descricao, prioridade,          │
│                               └──── aberta_por}                      │
└──────────────────────────────────────────────────────────────────────┘
        │                            │
        │                            │
        ├────────────────────────────┴──────────────────────────────┐
        │                                                            │
        │                                                            │
        ▼                                                            ▼

┌──────────────────────────────┐              ┌──────────────────────────────┐
│       COMENTARIOS            │              │          FOTOS               │
├──────────────────────────────┤              ├──────────────────────────────┤
│ PK  id (BIGSERIAL)           │              │ PK  id (BIGSERIAL)           │
│ FK  tag_id (BIGINT)          │──┐           │ FK  tag_id (BIGINT)          │──┐
│     autor (TEXT)             │  │           │     uploader (TEXT)          │  │
│     texto (TEXT)             │  │           │     file_path (TEXT)         │  │
│     criado_em (TIMESTAMPTZ)  │  │           │     notes (TEXT)             │  │
└──────────────────────────────┘  │           │     criado_em (TIMESTAMPTZ)  │  │
                                  │           └──────────────────────────────┘  │
                                  │                                             │
                      ┌───────────┴──────────┐                                 │
                      │  ON DELETE CASCADE   │                                 │
                      │  REFERENCES tags(id) │                                 │
                      └──────────────────────┘                                 │
                                                                                │
                                                    ┌───────────────────────────┘
                                                    │  ON DELETE CASCADE
                                                    │  REFERENCES tags(id)
                                                    └───────────────────────────
```

## 📊 Cardinalidade

```
users  (1) ─────────── (0..N) tags
  │                              │
  │                              │
  └── atualizado_por (informal) │
                                 │
                        ┌────────┴────────┐
                        │                 │
                        │                 │
                    (1..N)            (1..N)
                        │                 │
                    comentarios        fotos
```

## 🔑 Índices por Tabela

### USERS (2 índices)
```
idx_users_nome     [B-tree] → nome
idx_users_prn      [B-tree] → prn
```

### TAGS (5 índices)
```
idx_tags_ultimos4           [B-tree] → ultimos4
idx_tags_nome_equipamento   [GIN]    → to_tsvector('portuguese', nome_equipamento)
idx_tags_tag_completo       [GIN]    → to_tsvector('portuguese', tag_completo)
idx_tags_status             [B-tree] → status
idx_tags_nota_manutencao    [GIN]    → nota_manutencao (WHERE IS NOT NULL)
```

### COMENTARIOS (2 índices)
```
idx_comentarios_tag_id     [B-tree] → tag_id
idx_comentarios_criado_em  [B-tree] → criado_em DESC
```

### FOTOS (2 índices)
```
idx_fotos_tag_id     [B-tree] → tag_id
idx_fotos_criado_em  [B-tree] → criado_em DESC
```

## 🎯 Fluxo de Dados

### 1️⃣ Autenticação
```
┌──────────────┐
│   FRONTEND   │
└──────┬───────┘
       │
       ▼ POST /auth/register
┌──────────────┐
│  EDGE FUNC   │ ──→ db.createUser()
└──────┬───────┘
       │
       ▼ INSERT INTO users
┌──────────────┐
│  POSTGRES    │
└──────────────┘
```

### 2️⃣ Busca de TAG
```
┌──────────────┐
│   FRONTEND   │
└──────┬───────┘
       │
       ▼ GET /tags/search/0001
┌──────────────┐
│  EDGE FUNC   │ ──→ db.searchTags()
└──────┬───────┘
       │
       ▼ SELECT * FROM buscar_tags('0001')
┌──────────────┐
│  POSTGRES    │ ──→ Função SQL inteligente
└──────────────┘       (4 dígitos OU nome)
```

### 3️⃣ Adicionar Comentário
```
┌──────────────┐
│   FRONTEND   │
└──────┬───────┘
       │
       ▼ POST /tags/:id/comentarios
┌──────────────┐
│  EDGE FUNC   │ ──→ db.createComentario()
└──────┬───────┘
       │
       ▼ INSERT INTO comentarios
┌──────────────┐     (tag_id, autor, texto)
│  POSTGRES    │
└──────────────┘
```

### 4️⃣ Nota de Manutenção
```
┌──────────────┐
│   FRONTEND   │
└──────┬───────┘
       │
       ▼ POST /tags/:id/nota
┌──────────────┐
│  EDGE FUNC   │ ──→ db.addNotaManutencao()
└──────┬───────┘
       │
       ▼ UPDATE tags SET nota_manutencao = {...}
┌──────────────┐     WHERE id = :id
│  POSTGRES    │
└──────────────┘
```

## 🔐 Segurança (RLS)

```
┌────────────────────────────────────────────────┐
│          ROW LEVEL SECURITY                    │
├────────────────────────────────────────────────┤
│                                                │
│  ┌──────────────────────────────────────┐     │
│  │  SERVICE_ROLE_KEY (Backend)          │     │
│  │  ✅ Acesso TOTAL via Edge Function   │     │
│  └──────────────────────────────────────┘     │
│                                                │
│  ┌──────────────────────────────────────┐     │
│  │  ANON_KEY (Frontend Direto)          │     │
│  │  ✅ Acesso via Policies              │     │
│  └──────────────────────────────────────┘     │
│                                                │
│  Policies configuradas em todas as tabelas:   │
│  - users                                       │
│  - tags                                        │
│  - comentarios                                 │
│  - fotos                                       │
│                                                │
└────────────────────────────────────────────────┘
```

## ⚡ Performance

### Full-Text Search
```sql
-- Busca em português otimizada
SELECT * FROM tags
WHERE 
  to_tsvector('portuguese', nome_equipamento) @@ 
  to_tsquery('portuguese', 'válvula')
```

### Índice Parcial
```sql
-- Apenas TAGs com nota de manutenção
CREATE INDEX idx_tags_nota_manutencao 
ON tags USING gin(nota_manutencao) 
WHERE nota_manutencao IS NOT NULL;
```

### Cascade Delete
```sql
-- Remover TAG remove automaticamente comentários e fotos
DELETE FROM tags WHERE id = 1;
-- Cascade: comentarios e fotos também são removidos
```

## 📦 Tamanho Estimado

Com dados iniciais:
- Users: ~0 KB (vazio, usuários criados via app)
- Tags: ~1 KB (10 registros)
- Comentarios: ~0.5 KB (5 registros)
- Fotos: ~0.5 KB (6 registros)

**Total**: ~2 KB de dados + índices

## 🎨 Tipos de Dados Especiais

### JSONB (nota_manutencao)
```json
{
  "numero_nota": "MNT-2024-045",
  "data_abertura": "2024-04-08T09:00:00Z",
  "descricao": "Calibração do medidor...",
  "prioridade": "média",
  "aberta_por": "Maria Santos"
}
```

### UUID (users.id)
```
550e8400-e29b-41d4-a716-446655440000
```

### TIMESTAMPTZ
```
2024-04-08T09:00:00Z
2024-04-08T09:00:00-03:00 (BRT)
```

---

**Legenda:**
- PK = Primary Key
- FK = Foreign Key
- UQ = Unique Constraint
- TSTZ = TIMESTAMPTZ
