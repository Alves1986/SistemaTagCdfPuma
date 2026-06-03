# Deploy do Backend Supabase

## Status Atual

O sistema está funcionando em **modo local** com fallback automático. Todos os dados são salvos no localStorage do navegador.

## Como fazer Deploy da API

Para ativar a API real do Supabase, siga os passos:

### 1. Obter Access Token

Acesse o [Supabase Dashboard](https://supabase.com/dashboard/account/tokens) e gere um novo access token.

### 2. Fazer Login no Supabase CLI

```bash
pnpm dlx supabase login
```

Cole o access token quando solicitado.

### 3. Deploy da Edge Function

```bash
pnpm dlx supabase functions deploy server --project-ref isrexzwqeqvwqithndwk
```

### 4. Verificar Deploy

Após o deploy, a API estará disponível em:
```
https://isrexzwqeqvwqithndwk.supabase.co/functions/v1/make-server-e7ada368
```

## Como o Sistema Funciona

- **Com API**: O sistema tenta se conectar à API do Supabase primeiro
- **Sem API**: Se a API não estiver disponível, usa localStorage automaticamente
- **Transparente**: O usuário não percebe a diferença, tudo funciona normalmente

## Endpoints da API

### Autenticação
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Login

### TAGs
- `GET /tags` - Listar todos
- `GET /tags/:id` - Buscar por ID
- `GET /tags/search/:query` - Buscar por query
- `POST /tags` - Criar novo
- `PUT /tags/:id` - Atualizar
- `POST /tags/:id/nota` - Gerenciar nota de manutenção

### Comentários
- `GET /tags/:id/comentarios` - Listar comentários
- `POST /tags/:id/comentarios` - Adicionar comentário

### Fotos
- `GET /tags/:id/fotos` - Listar fotos
- `POST /tags/:id/fotos` - Adicionar foto

## Vantagens do Modo Local

- ✅ Funciona offline
- ✅ Sem latência de rede
- ✅ Sem custos de API
- ✅ Dados persistem no navegador
- ✅ Perfeito para desenvolvimento e testes

## Vantagens da API Real

- ✅ Dados compartilhados entre usuários
- ✅ Backup automático
- ✅ Acesso de múltiplos dispositivos
- ✅ Escalabilidade
