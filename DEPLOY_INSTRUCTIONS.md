# 🚀 Instruções Completas de Deploy - Sistema TAG Caldeira

## 📋 Status Atual

✅ **Backend criado**: Edge Functions prontas  
✅ **Migrations SQL**: Estrutura completa do banco de dados  
✅ **Frontend configurado**: Com fallback local automático

## 🗄️ Passo 1: Criar Banco de Dados

### Opção A: Via Dashboard Supabase (Recomendado)

1. Acesse: https://supabase.com/dashboard/project/isrexzwqeqvwqithndwk/sql/new
2. Cole o conteúdo do arquivo: `/supabase/migrations/20260501000000_initial_schema.sql`
3. Clique em **Run** ou **Execute**

### Opção B: Via Supabase CLI

```bash
# Fazer login no Supabase
pnpm dlx supabase login

# Aplicar a migração
pnpm dlx supabase db push --project-ref isrexzwqeqvwqithndwk
```

## 🚀 Passo 2: Deploy da Edge Function

```bash
# Fazer login (se ainda não fez)
pnpm dlx supabase login

# Fazer deploy da função server
pnpm dlx supabase functions deploy server --project-ref isrexzwqeqvwqithndwk
```

## ✅ Passo 3: Verificar Deploy

### Testar Health Check

Abra no navegador ou use curl:
```bash
curl https://isrexzwqeqvwqithndwk.supabase.co/functions/v1/make-server-e7ada368/health
```

**Resposta esperada:**
```json
{"status":"ok"}
```

### Testar Endpoints

```bash
# Buscar todos os TAGs
curl https://isrexzwqeqvwqithndwk.supabase.co/functions/v1/make-server-e7ada368/tags

# Buscar TAG por ID
curl https://isrexzwqeqvwqithndwk.supabase.co/functions/v1/make-server-e7ada368/tags/1

# Buscar por últimos 4 dígitos
curl https://isrexzwqeqvwqithndwk.supabase.co/functions/v1/make-server-e7ada368/tags/search/0001
```

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas

1. **users** - Usuários do sistema
   - `id` (UUID, Primary Key)
   - `nome` (TEXT, UNIQUE)
   - `prn` (TEXT)
   - `cargo` (TEXT - Operador Lider, Operador III, Operador II)

2. **tags** - Equipamentos
   - `id` (BIGSERIAL, Primary Key)
   - `tag_completo` (TEXT, UNIQUE)
   - `ultimos4` (TEXT)
   - `nome_equipamento` (TEXT)
   - `localizacao_texto` (TEXT)
   - `status` (TEXT - operacional, manutenção, inativo)
   - `foto_url` (TEXT)
   - `nota_manutencao` (JSONB)

3. **comentarios** - Comentários dos operadores
   - `id` (BIGSERIAL, Primary Key)
   - `tag_id` (BIGINT, Foreign Key)
   - `autor` (TEXT)
   - `texto` (TEXT)

4. **fotos** - Histórico de fotos
   - `id` (BIGSERIAL, Primary Key)
   - `tag_id` (BIGINT, Foreign Key)
   - `uploader` (TEXT)
   - `file_path` (TEXT)
   - `notes` (TEXT)

### Dados Iniciais

✅ 10 TAGs de exemplo já inseridos  
✅ 5 comentários pré-cadastrados  
✅ 6 fotos de exemplo

## 🔧 Troubleshooting

### Erro: "Access token not provided"
```bash
# Gerar novo token
# 1. Acesse: https://supabase.com/dashboard/account/tokens
# 2. Crie um novo token
# 3. Execute:
pnpm dlx supabase login
```

### Erro: "Could not connect to database"
- Verifique se o projeto existe
- Confirme o project-ref: `isrexzwqeqvwqithndwk`
- Verifique a conexão com internet

### Erro: "Function already exists"
```bash
# Atualizar função existente
pnpm dlx supabase functions deploy server --project-ref isrexzwqeqvwqithndwk --no-verify-jwt
```

### API ainda usa localStorage
1. Limpe o cache do navegador
2. Força refresh: Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)
3. Verifique console do navegador para ver se a API está respondendo

## 📝 Endpoints Disponíveis

### Autenticação
```
POST /make-server-e7ada368/auth/register
POST /make-server-e7ada368/auth/login
```

### TAGs
```
GET    /make-server-e7ada368/tags
GET    /make-server-e7ada368/tags/:id
GET    /make-server-e7ada368/tags/search/:query
POST   /make-server-e7ada368/tags
PUT    /make-server-e7ada368/tags/:id
POST   /make-server-e7ada368/tags/:id/nota
```

### Comentários
```
GET    /make-server-e7ada368/tags/:id/comentarios
POST   /make-server-e7ada368/tags/:id/comentarios
```

### Fotos
```
GET    /make-server-e7ada368/tags/:id/fotos
POST   /make-server-e7ada368/tags/:id/fotos
```

## 🎯 Próximos Passos

1. ✅ Criar banco de dados
2. ✅ Fazer deploy da Edge Function
3. ✅ Testar endpoints
4. 🔄 Frontend detectará API automaticamente
5. 🎉 Sistema funcionando em produção!

## 💡 Dicas

- A API tem **fallback automático** para localStorage se não estiver disponível
- Dados mockados são carregados automaticamente na primeira vez
- Não precisa configurar nada no frontend, é automático
- Row Level Security (RLS) está configurado para permitir acesso público via Edge Function

## 🔒 Segurança

- ✅ RLS habilitado em todas as tabelas
- ✅ Políticas configuradas para acesso via service_role
- ✅ Triggers para atualização automática de timestamps
- ✅ Validações no backend e banco de dados
- ✅ Índices para performance otimizada

---

**Precisa de ajuda?** Verifique os logs em:
https://supabase.com/dashboard/project/isrexzwqeqvwqithndwk/logs/edge-functions
