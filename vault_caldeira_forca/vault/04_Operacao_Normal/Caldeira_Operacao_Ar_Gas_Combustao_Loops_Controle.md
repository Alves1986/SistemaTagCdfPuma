---
id: cf_operacao_ar_gas_combustao_loops_controle
setor: caldeira_de_forca
categoria: operacao
equipamento_foco: sistema_ar_gas_combustao
tags: [loops_controle, ar_primario, ar_overfire, ar_secundario, ar_terciario, gas_recirculacao, pressao_fornalha, oxigenio]
---

## Operação Normal — Sistemas de Ar e Gás de Combustão: Loops de Controle

O equipamento é mostrado nas telas DCS "Sistemas de ar e gás de combustão" e "Cálculo de ar" (Figuras 8 e 9 do documento original).

### Tabela 5 — Loops de Controle no Sistema de Ar

| Código (tag) | Loop | Modo | Ponto de ajuste | Saída/Controles | 
|---|---|---|---|---|
| **37224-FIC-5317** | Controle de fluxo de ar primário | R (externo) | A partir do controle de ar | Ventilador de ar primário 37224-M-5313 |
| **37224-TIC-5320** | Controle de temperatura de ar primário | R (externo) | Máximo entre saída de controle de temp. do gás de combustão ou temp. de superfície do pré-aquecedor | Válvula 37224-TV-5320 |
| **37224-PIC-5369** | Controle de pressão do ar overfire | R (externo) | — | Ventilador de ar overfire 37224-M-5324 |
| **37224-TIC-5362** | Controle de temperatura do ar overfire | R (externo) | Máximo entre saída de controle de temp. do gás de combustão ou temp. de superfície do pré-aquecedor | 37224-TV-5362 |
| **37224-FIC-5376** | Fluxo de ar overfire, queimador 1 | R (externo) | — | Damper 37224-FV-5376 |
| **37224-FIC-5373** | Fluxo de ar overfire, queimador 2 | R (externo) | — | Damper 37224-FV-5373 |
| **37224-FIC-5377** | Fluxo de ar overfire, queimador 3 | R (externo) | — | Damper 37224-FV-5377 |
| **37224-FIC-5374** | Fluxo de ar overfire, queimador 4 | R (externo) | — | Damper 37224-FV-5374 |
| **37224-FIC-5372** | Ar overfire → ar secundário inferior, parede dianteira | R (externo) | — | Damper 37224-FV-5372 |
| **37224-FIC-5375** | Ar overfire → ar secundário inferior, parede traseira | R (externo) | — | Damper 37224-FV-5375 |
| **37224-FIC-5379** | Ar overfire → ar secundário superior, parede dianteira | R (externo) | — | Damper 37224-FV-5379 |
| **37224-FIC-5378** | Ar overfire → ar secundário superior, parede traseira | R (externo) | — | Damper 37224-FV-5378 |
| **37224-FIC-5381** | Ar overfire → ar terciário, parede dianteira | R (externo) | — | Damper 37224-FV-5381 |
| **37224-FIC-5380** | Ar overfire → ar terciário, parede traseira | R (externo) | — | Damper 37224-FV-5380 |
| **37224-TIC-5333** | Controle da temperatura do leito | A (interno) | — | SP de 37224-FIC-5329 |
| **37224-FIC-5329** | Controle do fluxo de gás de recirculação | R (externo) | — | Damper 37224-FV-5329 |
| **37224-PDIC-5330** | Controle dP sobre damper de gás de recirculação | A (interno) | **5…15 mbar** | Ventilador de recirculação de gás de combustão 37224-M-5320 |

### Tabela 6 — Loops de Controle no Sistema de Gás de Combustão

| Código (tag) | Loop | Modo | Controles de saída |
|---|---|---|---|
| **37224-PIC-5400** | Controle da pressão da fornalha | R (externo) | Ventilador de gás de combustão 37224-M-5333 |
| **37224-PIC-5420** | Controle de pressão do gás de combustão antes do ventilador | A (interno) | Cálculo de efeito de combustível sólido |
| **37224-AIC-5406** | Controle de oxigênio do gás de combustão | R (externo) | Corrige o cálculo estequiométrico do ar |
| **37224-TIC-5415** | Controle da temperatura da saída de gás de combustão | A (interno) | RSP para temperatura do ar primário (37224-TIC-5320) e do ar overfire (37224-TIC-5362) |
| **37224-XC-5432** | Teor de oxigênio do gás de combustão para combustível sólido | R (externo) | Corrige o cálculo de combustível sólido 37224-XC-5579 |

## Notas
Fragmento derivado do Capítulo 5, seção 5.15 (Tabelas 5 e 6), do Manual de Operação da Caldeira de Força. Continua em `Caldeira_Operacao_Ar_Gas_Combustao_Monitoramento_Ajuste` (subseções 5.15.1 a 5.15.4).
