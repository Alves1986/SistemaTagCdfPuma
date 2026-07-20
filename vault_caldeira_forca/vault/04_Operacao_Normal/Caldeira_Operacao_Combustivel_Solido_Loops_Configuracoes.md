---
id: cf_operacao_combustivel_solido_loops_configuracoes
setor: caldeira_de_forca
categoria: operacao
equipamento_foco: rosca_alimentacao_combustivel
tags: [loops_controle, configuracoes_dcs, rosca_alimentacao, silo_combustivel, fator_qualidade]
---

## Operação Normal — Sistema de Alimentação de Combustível Sólido: Loops de Controle e Configurações DCS

Equipamento mostrado nas telas DCS "Alimentação de combustível" (Figura 9) e "Cálculo da rosca de combustível" (Figura 10) do documento original.

### Tabela 7 — Loops de Controle no Sistema de Alimentação de Combustível

| Código (tag) | Loop | Modo | Controles de saída |
|---|---|---|---|
| **37228-LC-5457** | Controle da capacidade do silo de combustível | A (interno) | SP para alimentação de combustível externa |
| **37228-LIC-5471** | Nível da caixa de balanceamento 1 | A (interno) | Transportador de arraste, combustível fragmentado 37228-M-5659 |
| **37228-LIC-5529** | Nível da caixa de balanceamento 2 | A (interno) | Transportador de arraste, combustível fragmentado 37228-M-5660 |

### Tabela 8 — Configurações do DCS no Sistema de Alimentação de Combustível

| Ponto na tela do DCS | Instrução |
|---|---|
| Controle de balanceamento do nível do silo de combustível | Seleção da linha de combustível sólido: linha 1 enche o silo 1; linha 2 enche o silo 2; ambas selecionadas → seleção automática de qual silo abastecer |
| Fator de qualidade de combustível sólido | Em modo REMOTO, calculado no DCS; em modo AUTO, o operador seleciona o valor (**0,7…1,3**) |
| Fator de carga/descarga da caldeira | Fator de carga (3 MW/bar/min) corrigindo a influência do gradiente de pressão do tubulão |
| Diferença de SP para controle de concentração de O2 | Adição (**0 a 1,0%**) ao SP de controle de suporte de O2 ao combustível sólido (37224-XC-5432) |
| Controle de proporção das linhas 1 e 2 de alimentação | Fator (**0,5…1,5**) para rosca de alimentação 1 — altera o equilíbrio entre as linhas 1 e 2 |
| Taxa de velocidade da rosca principal do silo 1 | Correlação (**0,7…1,5**) para rosca recuperadora de silo 1 — tag **37228-SIC-5472** |
| Taxa de velocidade do transportador de combustível 1 | Correlação (**1,0…1,3**) — tag **37228-SIC-5470** |
| Taxa de velocidade da rosca principal do silo 2 | Correlação (**0,7…1,5**) para rosca recuperadora de silo 2 — tag **37228-SIC-5523** |
| Taxa de velocidade do transportador de combustível 2 | Correlação (**1,0…1,3**) — tag **37228-SIC-5528** |
| Correlação de velocidade da rosca de alimentação 1 | **0,8…1,2** — tag **37228-SIC-5480** |
| Correlação de velocidade da rosca de alimentação 2 | **0,8…1,2** — tag **37228-SIC-5482** |
| Correlação de velocidade da rosca de alimentação 3 | **0,8…1,2** — tag **37228-SIC-5476** |
| Correlação de velocidade da rosca de alimentação 4 | **0,8…1,2** — tag **37228-SIC-5438** |
| Correlação de velocidade da rosca de alimentação 5 | **0,8…1,2** — tag **37228-SIC-5540** |
| Correlação de velocidade da rosca de alimentação 6 | **0,8…1,2** — tag **37228-SIC-5533** |

## Notas
Fragmento derivado do Capítulo 5, seção 5.16 (Tabelas 7 e 8), do Manual de Operação da Caldeira de Força. Continua em `Caldeira_Operacao_Combustivel_Solido_Ajuste_Vapor_Extincao`.
