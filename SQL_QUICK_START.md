# 🗄️ SQL Quick Start - Criar Banco de Dados

## 🎯 Objetivo

Criar todas as tabelas, índices, triggers e dados iniciais do Sistema TAG - Caldeira.

## ⚡ Execução Rápida

### Via Dashboard Supabase (RECOMENDADO)

1. **Acesse o SQL Editor:**
   ```
   https://supabase.com/dashboard/project/isrexzwqeqvwqithndwk/sql/new
   ```

2. **Cole o conteúdo do arquivo:**
   ```
   supabase/migrations/20260501000000_initial_schema.sql
   ```

3. **Execute:**
   - Clique no botão **"Run"** ou pressione `Ctrl+Enter`
   - Aguarde a confirmação de sucesso

4. **Verifique:**
   - Vá em: Tables → Você deve ver 4 tabelas:
     - ✅ users
     - ✅ tags
     - ✅ comentarios
     - ✅ fotos

## 📊 O que será criado?

### Extensões
- ✅ `uuid-ossp` (para gerar UUIDs)

### Tabelas (4)
1. **users** - Usuários do sistema
2. **tags** - Equipamentos/TAGs
3. **comentarios** - Comentários dos operadores
4. **fotos** - Histórico de fotos

### Índices (13)
- Índices em colunas de busca frequente
- Índices full-text search em português
- Índices JSONB para notas de manutenção

### Triggers (2)
- Auto-atualização de `atualizado_em`
- Em users e tags

### Políticas RLS (4)
- Acesso público via service_role
- Uma para cada tabela

### Funções (1)
- `buscar_tags(query_text)` - Busca inteligente

### Dados Iniciais
- ✅ 10 TAGs de exemplo
- ✅ 5 Comentários
- ✅ 6 Fotos

## 🔍 Verificar se funcionou

Execute no SQL Editor:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar dados inseridos
SELECT COUNT(*) as total_tags FROM tags;
SELECT COUNT(*) as total_comentarios FROM comentarios;
SELECT COUNT(*) as total_fotos FROM fotos;

-- Testar função de busca
SELECT * FROM buscar_tags('0001');
```

**Resultado esperado:**
- 4 tabelas listadas
- 10 TAGs
- 5 comentários
- 6 fotos
- 1 TAG retornado na busca

## 🚨 Troubleshooting

### Erro: "relation already exists"
Não tem problema! Significa que já foi executado antes.

### Erro: "permission denied"
Verifique se você tem permissões de admin no projeto.

### Nenhum dado inserido
Os dados são inseridos com `ON CONFLICT DO NOTHING`, então se já existirem não serão duplicados.

### Quer limpar tudo e recomeçar?

```sql
-- CUIDADO: Isso remove TUDO!
DROP TABLE IF EXISTS fotos CASCADE;
DROP TABLE IF EXISTS comentarios CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS buscar_tags(TEXT);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Depois execute o script completo novamente
```

## ✅ Próximo Passo

Depois que o SQL for executado com sucesso:

```bash
# Fazer deploy da Edge Function
./deploy.sh
```

Ou veja: `DEPLOY_INSTRUCTIONS.md`

---

**Tempo estimado:** ~30 segundos  
**Complexidade:** Baixa  
**Requer:** Acesso admin ao projeto Supabase
