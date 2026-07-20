---
id: cf_operacao_ar_instrumento_agua_alimentacao
setor: caldeira_de_forca
categoria: operacao
equipamento_foco: sistema_agua_alimentacao
tags: [ar_instrumento, agua_alimentacao, loops_controle, monitoramento_diario, bomba_alimentacao]
---

## Operação Normal — Ar de Instrumento/Processo e Sistema de Água de Alimentação

### Sistema de Ar de Instrumento e de Ar de Processo

Acompanhar o sistema de ar comprimido da planta para a caldeira e verificar se a pressão está normal:
* Pressão do ar de instrumento monitorada em SRS: **37220-PI-6125, 37220-PI-6126, 37220-PI-6127**.
* Pressão de ar comprimido: **37220-PI-6129**.

### Sistema de Água de Alimentação — Loops de Controle

| Código (tag) | Loop | Modo | Ponto de ajuste | Controles de saída | Notas |
|---|---|---|---|---|---|
| **37221-PIC-5018** | Controle de pressão da água de alimentação | R (externo) | 3 bar | Bombas de água de alimentação 35221-P-1119 e 35221-P-1121 | SP = dp sobre válvula de água de alimentação |
| **37221-FIC-5015** | Controle do fluxo de água de alimentação | R (externo) | — | Válvula 37221-FV-5015 | — |
| **37221-HC-5125** | Controle da posição da válvula de pulverização de água | A (interno) | — | Corrige SP de 37221-PIC-5018 | — |
| **37221-LIC-5002** | Nível do pré-aquecedor de água de alimentação | A (interno) | — | Válvula 37221-LV-5002 | — |

> O documento original inclui a "Figura 3 — Tela do DCS Água de alimentação para caldeira" ilustrando este equipamento; consultar o PDF fonte para a imagem.

### Monitoramento Diário do Sistema de Água de Alimentação

Acompanhar a operação a partir das medições e no campo. Itens mais importantes:
* Pressão do tanque de água de alimentação.
* Nível do tanque de água de alimentação.
* Medições de nível do tubulão e indicadores de nível local.
* Fluxo de água de alimentação.
* Pressão da água de alimentação.

> Consultar a Descrição do Processo "Sistema de Vapor e Água de Alimentação" para mais detalhes.

## Notas
Fragmento derivado do Capítulo 5, seções 5.8, 5.9 e 5.9.1, do Manual de Operação da Caldeira de Força.
