# Regras Globais do Projeto (Klabin TAG System)

## Deve Sempre
- Escrever código legível, em componentes pequenos e focados.
- Testar a responsividade de todos os botões e inputs no mobile (Klabin OP usa mobile no chão de fábrica).
- Utilizar a paleta oficial em `theme.css`.

## Nunca Deve
- Inserir credenciais, tokens Supabase reais em código versionado (usar `.env`).
- Usar Tailwind arbitrary values complexos (ex: `bg-[#123456]`) se existir uma variável semântica (ex: `bg-primary`).
- Quebrar o build do Vite com importações de arquivos inexistentes.
