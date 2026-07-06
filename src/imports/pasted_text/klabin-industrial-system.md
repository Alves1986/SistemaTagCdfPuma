Você está redesenhando um sistema web industrial chamado **Sistema TAG — Caldeira de Força**, desenvolvido para a **Klabin S/A**. O sistema é usado por operadores em campo para localizar equipamentos industriais, registrar problemas e acompanhar notas de manutenção.


**Stack:** React + TypeScript + Supabase

**Plataforma:** Web responsiva (desktop e mobile)

**Usuários:** Operador II, Operador III, Operador Líder

**Prazo de produção:** 3 meses

**Piloto:** Caldeira de Força II (CDF II) e ETAC II — com expansão futura para outras áreas da planta


---


## IDENTIDADE VISUAL ATUAL (MANTER)


Não altere a identidade visual. O sistema já tem uma paleta consolidada que deve ser respeitada integralmente:


| Token | Hex | Uso |

|---|---|---|

| Primary (Azul Klabin) | `#003865` | Navbar, botões primários, elementos de destaque |

| Success (Verde Klabin) | `#00A551` | Status operacional, botões de confirmação, ícone de marca |

| Background | `#F4F5F7` | Fundo geral de todas as telas |

| Surface | `#FFFFFF` | Cards, modais, tabelas |

| Border | `#D1D5DB` | Bordas de inputs, cards |

| Text Primary | `#2D2D2D` | Títulos e textos principais |

| Text Secondary | `#5A5A5A` | Labels, textos auxiliares |

| Text Muted | `#9CA3AF` | Metadados, placeholders |


**Status de equipamento:**

- Operacional → fundo `#D1FAE5` / texto `#065F46` / dot `#00A551`

- Manutenção → fundo `#FEF3C7` / texto `#92400E` / dot `#D97706`

- Inativo → fundo `#FEE2E2` / texto `#991B1B` / dot `#DC2626`


**Prioridade de nota:**

- Urgente → `#DC2626` (fundo), `#fff` (texto)

- Alta → `#EA580C`

- Média → `#D97706`

- Baixa → `#003865`


**Ícone de marca:** chama de fogo (`Flame`) do Lucide, sobre fundo `#00A551`


---


## ESTRUTURA ATUAL DO SISTEMA (6 telas)


O sistema tem as seguintes telas implementadas:


1. **LoginPage** — Autenticação com Nome + PRN

2. **RegisterPage** — Cadastro de novo usuário

3. **SearchPage** — Busca de equipamentos por TAG ou nome

4. **TagDetailPage** — Detalhes completos de um equipamento

5. **AdminPage** — Painel de gestão de todos os TAGs

6. **Layout** — Header fixo com navegação + barra de alerta de manutenção


---


## PROBLEMAS A CORRIGIR (OBRIGATÓRIOS)


### PROBLEMA 1 — RegisterPage: Cargo livre sem controle


**Situação atual:**

Na tela de cadastro existe um `
Nenhum arquivo escolhido`


**Bloco 2 — Galeria (menor, secundário):**

- Texto: "Ou escolher da galeria"

- Botão outline: "Selecionar arquivo"

- Funciona via `Nenhum arquivo escolhido`


Após seleção da foto (de qualquer origem):

- Exibir **preview da imagem** no modal antes do envio (thumbnail quadrado 160×160px)

- Exibir nome do arquivo e tamanho abaixo do preview

- Campo de texto opcional: "Observações"

- Indicador de quem está enviando: `"Enviando como: [Nome do usuário]"`

- Botão de ação: "Enviar Foto"

- Botão de cancelar


**Estado de envio:**

- Barra de progresso linear abaixo do preview durante o upload

- Texto: "Enviando… [%]"

- Após sucesso: toast verde + fechar modal automaticamente


---


### PROBLEMA 3 — QR Code: botão sem função → fluxo completo


**Situação atual:**

O botão "Escanear QR Code" existe na SearchPage mas não faz nada.


**O que adicionar no design:**


**Na SearchPage — Fluxo de escaneamento:**


Ao clicar em "Escanear QR Code", abrir um **modal de câmera** com:

- Área de visualização da câmera (quadrada, bordas arredondadas) com uma sobreposição de guia de escaneamento (4 cantos destacados como mira)

- Texto de instrução embaixo: "Aponte para o QR Code do equipamento"

- Botão de fechar ("X") no canto superior direito

- Após leitura bem-sucedida: fechar modal e navegar automaticamente para `/tag/:id`

- Em caso de falha: exibir mensagem inline "QR Code não reconhecido. Tente novamente."


**Na AdminPage — Geração de QR:**


O botão "QR Codes" existente deve abrir um **modal de gerenciamento de QR**:

- Lista paginada de todos os TAGs com nome e código

- Checkbox ao lado de cada TAG para seleção múltipla

- Botão "Gerar QR Selecionados" → gera folha de etiquetas para impressão

- Botão "Imprimir Todos" → abre janela de impressão com grade de QR Codes

- Cada etiqueta QR tem: QR Code + TAG completo + nome do equipamento + área


---


### PROBLEMA 4 — Multi-área: campo de área faltando


**Situação atual:**

O sistema não tem noção de "área". Todos os TAGs são de todas as áreas misturados. Quando entrar CDF II, ETAC II e futuras áreas, tudo vai se misturar.


**O que adicionar no design:**


**No Header (Layout) — Seletor de área:**

- Após o logo e antes dos links de navegação, adicionar um componente de seleção de área

- Aparência: pill/badge clicável com o nome da área atual + ícone de chevron-down

- Exemplo: `[ CDF II ▾ ]`

- Ao clicar: dropdown com as áreas disponíveis para o usuário

- A área selecionada filtra todos os dados visíveis no sistema


**No formulário de criação de TAG (AdminPage — modal "Criar TAG"):**

- Adicionar campo obrigatório: "Área" — select com as áreas disponíveis

- Pré-selecionar a área ativa no header


**Na tela de Gestão de Usuários (novo — ver Problema 1):**

- Cada usuário deve ter vínculo com uma ou mais áreas

- Operador Líder pode associar usuários a áreas


---


### PROBLEMA 5 — Segurança de rota: AdminPage acessível a qualquer cargo


**Situação atual:**

A rota `/admin` não tem proteção de cargo. Qualquer usuário logado pode acessar a URL diretamente e ver todos os controles.


**O que corrigir no design:**


Na AdminPage, para usuários com cargo **Operador II**, exibir uma tela de acesso restrito:

- Ícone de cadeado (`Lock`) centralizado

- Título: "Acesso restrito"

- Texto: "Esta área é reservada para Operadores III e Líderes."

- Botão: "Voltar para a busca"

- Não renderizar nenhum dado de TAGs ou controles para esse cargo


---


## MELHORIAS ADICIONAIS (RECOMENDADAS)


### MELHORIA A — Histórico de alterações (Audit Log)


Na TagDetailPage, adicionar uma quarta seção após "Histórico de Fotos":


**Seção: "Histórico de Alterações"**

- Timeline vertical com itens cronológicos (do mais recente ao mais antigo)

- Cada item contém: ícone da ação + texto descritivo + autor + data/hora

- Tipos de evento com ícone e cor correspondentes:


| Tipo | Ícone | Cor do marcador |

|---|---|---|

| Nota aberta | `AlertTriangle` | `#DC2626` (vermelho) |

| Nota fechada | `CheckCircle` | `#00A551` (verde) |

| Status alterado | `Activity` | `#003865` (azul) |

| Foto adicionada | `Camera` | `#7C3AED` (roxo) |

| Dados editados | `Edit` | `#D97706` (amarelo) |


---


### MELHORIA B — SearchPage: busca com mínimo 1 caractere e melhor estado vazio


**Situação atual:**

A busca só é disparada a partir de 2 caracteres. A tela vazia inicial mostra um card de "Como usar".


**O que ajustar:**

- Manter mínimo de 2 caracteres para busca (OK)

- Melhorar o estado vazio inicial: mostrar os **últimos 5 TAGs acessados** pelo usuário (histórico local)

- Título da seção: "Acessados recentemente"

- Cada item como um link compacto: código do TAG + nome + status badge

- Se não houver histórico, manter o card "Como usar" atual


---


### MELHORIA C — TagDetailPage: indicador de cargo do autor nos comentários


**Situação atual:**

Comentários mostram apenas o nome do autor.


**O que adicionar:**

- Ao lado do nome do autor, adicionar um badge pequeno com o cargo

- Operador Líder → badge azul escuro `#003865`

- Operador III → badge teal `#0D9488`

- Operador II → badge cinza `#5A5A5A`


---


### MELHORIA D — AdminPage: exportação real


**Situação atual:**

O botão "Exportar" existe mas não tem implementação.


**O que adicionar no design:**


Ao clicar em "Exportar", abrir um modal pequeno com opções:


**Formato:**

- `( ) Excel (.xlsx)`

- `( ) CSV`

- `( ) PDF — Relatório de manutenção`


**Filtro de dados a exportar:**

- `[ ] Apenas TAGs com nota aberta`

- `[ ] Todos os TAGs`


Botão de confirmação: "Gerar arquivo"

Após geração: link de download automático + toast de sucesso


---


### MELHORIA E — Header: contador de notas com link direto


**Situação atual:**

A barra vermelha de alerta no header diz "X equipamentos com nota de manutenção aberta" mas não é clicável.


**O que ajustar:**

- Tornar a barra de alerta clicável

- Ao clicar, navegar para `/admin` com o filtro "Com Nota" pré-selecionado

- Adicionar um ícone de seta (`→`) no final da barra para indicar que é navegável

- No badge de notificação do ícone "Gestão" no header, mostrar o número exato (não limitar a "9+", mostrar o número real até 99)


---


## TELAS A PROJETAR (CHECKLIST COMPLETO)


| # | Tela | Prioridade | Tipo |

|---|---|---|---|

| 1 | LoginPage | Manter (sem alterações) | Existente |

| 2 | RegisterPage — sem campo de cargo | 🔴 Crítico | Correção |

| 3 | SearchPage — com QR scanner modal | 🔴 Crítico | Correção |

| 4 | SearchPage — com histórico recente | 🟡 Recomendado | Melhoria |

| 5 | TagDetailPage — modal foto com câmera | 🔴 Crítico | Correção |

| 6 | TagDetailPage — seção de audit log | 🟡 Recomendado | Melhoria |

| 7 | TagDetailPage — badge de cargo em comentários | 🟢 Opcional | Melhoria |

| 8 | AdminPage — tela de acesso restrito (Operador II) | 🔴 Crítico | Correção |

| 9 | AdminPage — modal de QR Codes | 🔴 Crítico | Correção |

| 10 | AdminPage — modal de exportação | 🟡 Recomendado | Melhoria |

| 11 | AdminPage — Gestão de Usuários | 🔴 Crítico | Nova tela |

| 12 | Layout — seletor de área no header | 🔴 Crítico | Nova funcionalidade |

| 13 | Layout — barra de alerta clicável | 🟡 Recomendado | Melhoria |

| 14 | Modal de QR escaneamento (câmera) | 🔴 Crítico | Nova tela |


---


## ESPECIFICAÇÕES DE COMPONENTES


### Inputs

- Border radius: `4px`

- Border color padrão: `#D1D5DB`

- Border color focus: `#003865` com box-shadow `0 0 0 3px rgba(0,56,101,0.1)`

- Background: `#F9FAFB`

- Altura: `42px` (py-2.5)

- Font size: `14px`


### Botões

- Primary: background `#003865`, texto branco, hover `#002850`

- Success: background `#00A551`, hover `#008A43`

- Danger: background `#EA580C`, hover `#C2410C`

- Outline: border `#D1D5DB`, texto `#5A5A5A`, hover background `#F4F5F7`

- Border radius: `4px`

- Font size: `14px`, font-weight: `500`


### Cards / Superfícies

- Background: `#FFFFFF`

- Border: `1px solid #D1D5DB`

- Border radius: `6px` (rounded)

- Shadow: `0 1px 2px rgba(0,0,0,0.05)` (shadow-sm)


### Modais

- Overlay: `rgba(0,0,0,0.5)`

- Largura máxima: `448px` (max-w-md)

- Border radius: `6px`

- Header com border-bottom `#E8E8E8`

- Botão de fechar (X) no canto superior direito


### Header

- Background: `#003865`

- Altura: `64px`

- Logo: ícone chama `#00A551` (40×40px, border radius 4px) + texto "KLABIN · SISTEMA TAG"

- Links ativos: background `#00A551`, texto branco

- Links inativos: texto `#93C5FD`, hover `rgba(255,255,255,0.1)`


### Tabela (AdminPage)

- Header da tabela: background `#F4F5F7`, texto `#5A5A5A`, uppercase, 12px

- Linhas alternadas: branco / `#FAFAFA`

- Linhas com nota: background `#FFF5F5`

- Border entre linhas: `#E8E8E8`


---


## FLUXOS DE NAVEGAÇÃO


```

[Não autenticado]

│

▼

/login ──── "Criar conta" ──→ Estado de cadastro (mesmo card)

│

│ Login bem-sucedido

▼

/ (SearchPage) ◄──────────────────────────────────────────────┐

│ │

├── Digite TAG / nome ──→ Lista de resultados ──→ /tag/:id │

│ │ │

├── "Escanear QR" ──→ Modal câmera ──────────────────┘ │

│ │

└── Header: "Gestão" ──→ /admin ──────────────────────────┘

│

├── [Operador II] → Tela de acesso restrito

│

└── [Op. III / Líder] → Painel completo

│

├── "Criar TAG" → Modal

├── "QR Codes" → Modal geração

├── "Exportar" → Modal exportação

└── [Líder] "Usuários" → Gestão de usuários

```


---


## RESTRIÇÕES DE DESIGN


1. **Não use Tailwind dark mode** — o sistema é exclusivamente claro

2. **Não use fontes externas** — use apenas a stack padrão do sistema (`Inter`, `system-ui`, `sans-serif`)

3. **Ícones:** exclusivamente biblioteca Lucide (já instalada)

4. **Border radius máximo:** `8px` em qualquer elemento — o design é funcional/industrial, não arredondado

5. **Sem gradientes decorativos** — apenas backgrounds sólidos

6. **Sem animações excessivas** — transitions de `150ms` apenas em hover/focus

7. **Mobile-first para TagDetailPage e SearchPage** — operadores usam celular em campo

8. **Desktop-first para AdminPage** — gestores usam computador

9. **Tabela da AdminPage não deve quebrar em mobile** — use scroll horizontal (`overflow-x: auto`)


---


## ENTREGÁVEIS ESPERADOS


Para cada tela listada no checklist:

1. Frame desktop (1440px de largura)

2. Frame mobile (390px de largura) — obrigatório para SearchPage, TagDetailPage e modais

3. Estados interativos onde aplicável: default, hover, focus, loading, empty state, error state

4. Anotações de comportamento em componentes novos (especialmente QR scanner e upload de foto)


---


## OBSERVAÇÃO FINAL


Este sistema vai para produção em 3 meses e posteriormente será expandido para outras áreas da Klabin. Priorize clareza e funcionalidade acima de estética. O operador precisa encontrar a informação que busca com no máximo 3 toques. Cada tela nova deve poder ser construída por um desenvolvedor React diretamente a partir do design, sem ambiguidades.