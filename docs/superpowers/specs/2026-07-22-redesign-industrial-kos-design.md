# Spec — Redesign Industrial do Sistema TAG KOS (Fase 1)

**Data:** 2026-07-22
**Autor:** Hermes Agent (orquestrador) + Anderson Alves
**Escopo:** Reestruturação de shell/navegação + tema duplo + fluxos CONSULTA e BASE KOS redesenhados + plugar motion/animate.css. (Fase 2: Bibliotecário IA + Telemetria.)

## 1. Decisões de direção (aprovadas pelo usuário)

- **Tema híbrido por tela:**
  - Telas de **consulta KOS** → *Swiss Industrial (claro)*: fundo blueprint `#F4F5F7`, navy `#003865` como estrutura, green `#00A551` como acento, vermelho hazard `#E61919` só para alertas críticos.
  - Telas de **telemetria/dashboards** → *Tactical (escuro)*: fundo `#0A1A2A`, mono, scanlines sutis, green Klabin como "terminal green", vermelho só para crítico. (Fase 2)
- **Shell:** Rail de comando escuro à esquerda (fixo) + topbar de contexto. 4 fluxos: CONSULTA · BASE KOS · BIBLIOTECÁRIO · TELEMETRIA.
- **Animações:** `motion` (já instalado, v12.23) para transições de página/tab (spring, bounce 0, 0.2–0.4s); `animate.css` (clonado em `hermes/repos/animate.css`) para entrada de modais/toasts. **Zero gradientes/sombras suaves** nos componentes industriais (exceto tela de Login que mantém identidade própria).
- **Paleta Klabin mantida:** navy `#003865`, green `#00A551`, dark `#2D2D2D`, mid `#5A5A5A`, light `#E8E8E8`, fundo `#F4F5F7`.

## 2. Arquitetura de navegação (nova)

`ProtectedRoute` → `CommandShell` (rail escuro + topbar) → `Outlet`.

Rotas (Fase 1):
- `/` → `ConsultaPage` (busca TAG/equipamento; reutiliza `SearchPage` redesenhado) — tema CLARO
- `/tag/:id` → `TagDetailPage` (tabs: Ficha · Fotos · Notas · QR · Co-localização · **Base KOS** · **Bibliotecário**) — tema CLARO
- `/base-kos` → `BaseKosPage` (navegação em árvore Sistema→Equip/Fluxo/Instrução; reutiliza `ManualTecnicoTab` + busca global) — tema CLARO
- `/bibliotecario` → `BibliotecarioPage` (placeholder Fase 2, mas rota criada) — tema CLARO
- `/admin`, `/admin/team`, `/admin/dashboard`, `/admin/manutencao`, `/profile` → mantidas (Gestão); topbar mostra breadcrumb. Telemetria ocupa `/admin/dashboard` e `/admin/manutencao` (Tactical, Fase 2 de tema).

Rail items (Fase 1 visíveis): CONSULTA, BASE KOS, BIBLIOTECÁRIO (em breve), e grupo GESTÃO (expande admin/dashboard/manutencao/team/perfil). TELEMETRIA aparece como entrada mas aponta para `/admin/dashboard` (Fase 2 full).

## 3. Componentes base (design system)

Criar `src/app/components/ui/` industriais reutilizáveis:
- `CommandRail.tsx` — rail escuro fixo (w-60), logo Klabin topo, nav items com ícone+label mono, estado ativo (green left-bar), badge de notas abertas.
- `TopBar.tsx` — topbar de contexto (claro): título da seção + filtros gerência/área (reutiliza lógica do Layout atual) + perfil/sair.
- `Panel.tsx` — wrapper `.panel` (borda 2px, sombra dura, cantos retos, header opcional com label mono).
- `TechLabel.tsx` — rótulo mono uppercase (`TAG //`, `SYS //`, `REV 2.6`).
- `ThemeToggle` — não necessário (por tela); o tema é definido por rota via wrapper `ThemeClaro`/`ThemeEscuro` que seta `data-theme` no container.

Tokens em `theme.css` (já existe, estender):
- `.mono` (JetBrains Mono), `.panel`, `.tech-label`, `.scanlines` (já existem).
- Adicionar `.tactical` (fundo escuro, verde-terminal) para uso em Fase 2.
- `motion` + `animate.css` importados em `main.tsx`.

## 4. Fluxo CONSULTA (redesign)

- `SearchPage` redesenhado: hero compacto "CONSULTA // SISTEMA TAG", input mono grande (cantos retos, borda navy), atalhos de filtro (gerência/área), resultados em `Panel` cards com TAG em mono + status dot. Transição de entrada com `motion` (fadeInUp, spring bounce 0).
- `TagDetailPage`: header do TAG em `Panel` com `TechLabel TAG // COMPLETO`, botões de ação retos; tabs em estilo "segmented industrial" (borda, ativo green). Tab **Base KOS** reutiliza `ManualTecnicoTab`; tab **Bibliotecário** reutiliza `BibliotecarioTab`.

## 5. Fluxo BASE KOS (redesign)

- `BaseKosPage` nova: barra de busca global na Base + navegação em árvore por **Sistema** (acordeão) → dentro, lista de equipamentos/instruções vinculados. Reutiliza `fetchManualForTag`/`searchManual` de `api.ts`. Cada item abre drawer/panel com trechos (como `ManualTecnicoTab`).
- Mantém `ManualTecnicoTab` como componente (usado tanto na tab do TAG quanto na página Base KOS via prop `tagCompleto` opcional).

## 6. Integração de skills (repositórios pedidos)

- **motion**: `import { motion, AnimatePresence } from 'motion/react'` para transições de página (wrapper em `CommandShell` com `AnimatePresence` por rota) e entrada de cards. Spring `{ bounce: 0, duration: 0.3 }`.
- **animate.css**: copiar `animate.min.css` → `src/styles/animate.css`, importar em `main.tsx`; usar `animate__animated animate__fadeIn` em modais/toasts.
- **claude-directory**: referência de templates para componentes (usar `components-ui`/`landing-pages` como inspiração ao construir `CommandRail`/`Panel`); não copiar cegamente — re-mapear cores Klabin.

## 7. Arquivos afetados (Fase 1)

- `src/styles/theme.css` — estender tokens (tactical, scanlines já ok).
- `src/main.tsx` — importar `motion` (já dep) + `animate.css`.
- `src/app/routes.tsx` — novas rotas (`/base-kos`, `/bibliotecario`).
- `src/app/components/CommandShell.tsx` — NOVO (rail + topbar + Outlet + AnimatePresence).
- `src/app/components/CommandRail.tsx` — NOVO.
- `src/app/components/TopBar.tsx` — NOVO (extraído do Layout).
- `src/app/components/ui/Panel.tsx` — NOVO.
- `src/app/components/ui/TechLabel.tsx` — NOVO.
- `src/app/components/SearchPage.tsx` — redesign.
- `src/app/components/TagDetailPage.tsx` — tabs industriais + motion.
- `src/app/components/BaseKosPage.tsx` — NOVO (reutiliza ManualTecnicoTab).
- `src/app/components/ManualTecnicoTab.tsx` — manter (já industrial), aceitar prop opcional.
- `src/app/components/Layout.tsx` — substituído por `CommandShell` (ou mantido como fallback Gestão). Decisão: `CommandShell` vira o Layout protegido; `Layout.tsx` pode ser removido após migração.

## 8. Testes / Verificação

- `npm run build` deve passar (EXIT=0) — critério de aceitação primário.
- Dev server sobe; screenshot da tela CONSULTA (claro) e BASE KOS (claro) mostrando rail escuro + topbar + panels.
- Login necessário para visualizar (Supabase) — usuário fornece credencial ou `.env`.

## 9. Não-objetivo (Fase 1)

- Fase 2: Bibliotecário IA funcional (OpenRouter/Jarvis), Telemetria Tactical completa, mapa de calor.
- Mudança de backend/Supabase schema.
- Tradução/refactor de lógica de negócio existente (apenas UI/UX).
