---
id: cf_operacao_agua_vapor_loops_controle
setor: caldeira_de_forca
categoria: operacao
equipamento_foco: superaquecedores
tags: [loops_controle, tubulao, temperatura_vapor, superaquecedor, atemperacao, carga_minima]
---

## Operação Normal — Sistema de Água e Vapor da Caldeira: Loops de Controle

O equipamento do sistema de vapor e água da caldeira é mostrado na tela do DCS "Superaquecedores e linha de vapor principal" (Figura 4 do documento original).

### Loops de Controle — Sistema de Água e Vapor da Caldeira

| Código (tag) | Loop | Modo | Ponto de ajuste | Controles de saída | Notas |
|---|---|---|---|---|---|
| **37221-LIC-5071** | Controle de nível do tubulão | A (interno); também modo R | **0 mm** | Corrige SP de 52-FIC-2080 | Como função da pressão do tubulão |
| **37221-TIC-5092** | Temp. do vapor antes de SH2, esquerda | R (externo) | Saída escalonada de 37221-TIC-5094 | Válvula 37221-TV-5092 | — |
| **37221-TIC-5093** | Temp. do vapor antes de SH2, direita | R (externo) | Saída escalonada de 37221-TIC-5095 | Válvula 37221-TV-5093 | — |
| **37221-TIC-5094** | Temp. do vapor após SH2, esquerda | R (externo) | Função da carga da caldeira | SP remoto p/ 37221-TIC-5092 | RSP Tendência +5…-10°C |
| **37221-TIC-5095** | Temp. do vapor após SH2, direita | R (externo) | Função da carga da caldeira | SP remoto p/ 37221-TIC-5093 | RSP Tendência +5…-10°C |
| **37221-TIC-5096** | Temp. do vapor antes de SH3, esquerda | R (externo) | Saída escalonada de 37221-TIC-5098 | Válvula 37221-TV-5096 | — |
| **37221-TIC-5097** | Temp. do vapor antes de SH3, direita | R (externo) | Saída escalonada de 37221-TIC-5098 | Válvula 37221-TV-5097 | — |
| **37221-TIC-5098** | Temp. do vapor antes de SH2 [saída final], esquerda | R (externo) | Função da carga da caldeira | SP remoto p/ 37221-TIC-5096 | RSP Tendência +5…-10°C |
| **37221-TIC-5099** | Temp. do vapor antes de SH2 [saída final], direita | R (externo); também modo A | Função da carga da caldeira | SP remoto p/ 37221-TIC-5097 | RSP Tendência +5…-10°C; SP ajustado pelo Operador quando em modo A |
| **37221-FIC-5160** | Controle de carga, combustível sólido | A (interno) | 18,3-67,2 kg/s | Corrige o controle de alimentação de combustível sólido | Modo A/R se a turbina estiver em controle de pressão frontal |
| **37221-PIC-5136** | Controle de pressão de vapor principal, combustível sólido | A (interno) | 104 bar(g) | Corrige o controle de alimentação de combustível sólido | — |
| **37221-PIC-5147** | Controle de pressão máxima do vapor | R (externo) | Saída do controlador 37221-FIC-5339 | 37221-HV-5145 | — |
| **37221-FIC-5339** | Controle de carga mínima da caldeira | A (interno) | 20,3 kg/s | SP de 37221-PIC-5147 | — |

## Notas
Fragmento derivado do Capítulo 5, seção 5.10 (tabela de loops de controle), do Manual de Operação da Caldeira de Força. Continua em `Caldeira_Operacao_Agua_Vapor_Monitoramento_Seguranca` (subseções 5.10.1 a 5.10.4).
