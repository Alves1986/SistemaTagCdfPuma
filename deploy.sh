#!/bin/bash

# Script de Deploy - Sistema TAG Caldeira
# Execute este script para fazer deploy completo

set -e

PROJECT_REF="isrexzwqeqvwqithndwk"

echo "🚀 Iniciando deploy do Sistema TAG - Caldeira..."
echo ""

# Verificar se está logado
echo "📝 Verificando login no Supabase..."
if ! pnpm dlx supabase projects list > /dev/null 2>&1; then
    echo "❌ Você não está logado no Supabase."
    echo "Por favor, execute: pnpm dlx supabase login"
    exit 1
fi

echo "✅ Login verificado!"
echo ""

# Deploy da Edge Function
echo "🔧 Fazendo deploy da Edge Function..."
pnpm dlx supabase functions deploy server --project-ref $PROJECT_REF

echo ""
echo "✅ Edge Function deployada com sucesso!"
echo ""

# Testar health check
echo "🏥 Testando health check..."
HEALTH_URL="https://$PROJECT_REF.supabase.co/functions/v1/make-server-e7ada368/health"

if curl -s $HEALTH_URL | grep -q "ok"; then
    echo "✅ API está respondendo!"
else
    echo "⚠️  API não está respondendo. Verifique os logs."
fi

echo ""
echo "================================================"
echo "✅ Deploy concluído com sucesso!"
echo "================================================"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Criar banco de dados:"
echo "   - Acesse: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo "   - Cole o conteúdo de: supabase/migrations/20260501000000_initial_schema.sql"
echo "   - Clique em 'Run'"
echo ""
echo "2. Testar a API:"
echo "   curl $HEALTH_URL"
echo ""
echo "3. O frontend detectará a API automaticamente!"
echo ""
echo "📚 Documentação completa em: DEPLOY_INSTRUCTIONS.md"
echo ""
