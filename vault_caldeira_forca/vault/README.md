# Vault RAG — Caldeira de Força (Klabin Puma II / Andritz)

Este vault contém a fragmentação completa do **Manual de Operação da Caldeira de Força 2** (Klabin S.A., Ortigueira-PR — fornecedor Andritz), gerada a partir do arquivo `Manual_da_Caldeira_em_Portugue_s.zip`, para uso em sistema RAG integrado ao Obsidian.

## Estrutura

| Pasta | Capítulo do Manual Original | Nº de Fragmentos |
|---|---|---|
| `00_Introducao` | Cap. 1 + Glossário transversal | 2 |
| `01_Especificacoes_Tecnicas` | Cap. 2 — Dados de Projeto e Desempenho | 12 |
| `02_Preparacao_Partida` | Cap. 3 — Preparativos para Partida | 9 |
| `03_Partida` | Cap. 4 — Partida | 15 |
| `04_Operacao_Normal` | Cap. 5 — Operação Normal | 18 |
| `05_Desligamento` | Cap. 6 — Desligamento Normal | 9 |
| `06_Resolucao_Problemas` | Cap. 7 — Resolução de Problemas | 10 |
| `07_Manutencao_Inspecao` | Cap. 8 — Inspeções Durante o Desligamento Anual | 9 |
| `08_Quimica_Agua` | Cap. 9 — Química da Água e Análise da Amostra | 7 |
| `09_Intertravamentos_SRS` | Cap. 10 — Descrição de SRS (lógicas de intertravamento) | 3 |
| `10_Seguranca` | Cap. 11 — Segurança | 13 |
| `11_Analise_Riscos` | Cap. 12 — Instruções de Análise de Perigos e Riscos | 9 |
| `12_Curvas_Referencia` | Cap. 13 — Curvas de Partida | 1 |
| **Total** | | **117 fragmentos** |

## Convenções

- Cada arquivo `.md` segue o padrão `Caldeira_<Categoria>_<Assunto>.md`.
- Frontmatter YAML padronizado em todos os fragmentos: `id`, `setor` (sempre `caldeira_de_forca`), `categoria`, `equipamento_foco`, `tags`.
- O glossário de abreviaturas (repetido no documento original no início de quase todo capítulo) foi consolidado em um único fragmento — `00_Introducao/Caldeira_Glossario_Abreviaturas.md` — para evitar duplicação massiva no vault.
- Números de tag de instrumentos/equipamentos (ex.: `37221-FV-5015`) foram preservados fielmente onde apareciam no texto fonte.
- Conteúdo gráfico (curvas, diagramas de queima) é referenciado, não inventado — os fragmentos apontam para a página/figura do PDF fonte quando o dado não é extraível como texto.

## Pendente (fora do escopo desta rodada)

Dois outros conjuntos de documentos foram enviados junto com o manual, mas ainda **não foram fragmentados**:

1. **`Sistema_CDF2.zip`** — 20 PDFs, aparentemente um volume complementar de "Descrição de Sistemas" (Introdução, Leito Fluidizado Borbulhante, Combustão, ~16 subsistemas 5.1–5.16, Operação Klabin).
2. **`Docs_CDF2.zip`** — 6 documentos Word com procedimentos específicos do site (partida a frio, partida do desaerador, teste hidrostático, bloqueio de vapor para pré-aquecedores, plano de contingência, alinhamento de água desmi).

Posso processá-los no mesmo padrão em uma próxima rodada, se desejar.
