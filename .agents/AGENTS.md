# Klabin TAG System - Agent Instructions

Esta é uma versão customizada das regras do "Agents-Claude-Code" e "claude-mem" adaptada para as necessidades de desenvolvimento e design da Klabin.

## Princípios Core
1. **Segurança Primeiro** — Nunca crie códigos vulneráveis. Valide todos os inputs.
2. **Imutabilidade** — Prefira métodos imutáveis em React (cópia de estados em vez de mutação).
3. **Design Pro Max** — Mantenha o sistema UI/UX sempre refinado (sombras, micro-animações, contrastes).
4. **Padrão de Cores Klabin** — Não introduza cores arbitrárias. Use as variáveis em `theme.css`.

## Padrões de Qualidade
- Evite criar funções gigantes (> 100 linhas).
- Utilize TypeScript rigorosamente.
- Tratamento de erro é obrigatório, e deve avisar o usuário usando alertas amigáveis ou toasts.

## Design System
- Utilize as diretrizes de "Glassmorphism" sutil. Modais devem usar `backdrop-blur-sm`.
- Cartões iterativos devem usar `hover:scale-[1.02] transition-transform shadow-md hover:shadow-lg`.
- Modo escuro (`.dark`) deve usar tons profundos (`#001f3f` a `#1a1a2e`), nunca `#000000` absoluto.
