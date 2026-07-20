---
id: cf_operacao_drenagem_dosagem_amostragem
setor: caldeira_de_forca
categoria: operacao
equipamento_foco: sistema_amostragem
tags: [drenagem, purga, dosagem_quimica, fosfato, amostragem, qualidade_agua]
---

## Operação Normal — Sistema de Drenagem/Purga, Dosagem Química e Amostragem

### Sistema de Drenagem e Purga

Equipamento mostrado na tela DCS "Sistema de purga" (Figura 7 do documento original).

| Código (tag) | Loop | Modo | Ponto de ajuste | Controles de saída |
|---|---|---|---|---|
| **35228-TIC-1494** | Temperatura de drenagem do tanque de purga | A (interno) | **60 °C** | Válvula 35228-TV-1494 |

> **AVISO!** Evitar se aproximar do tubo de transbordo do tanque de purga durante a operação da caldeira — em caso de problema, água quente pode vazar.

### Sistema de Dosagem Química — Controle da Qualidade da Água

O ar é removido do tanque de água de alimentação usando **vapor de baixa pressão** e injetando **produtos químicos de remoção de oxigênio** na água de alimentação.

* O controle de qualidade baseia-se na amostragem e no ajuste da alimentação química e da purga contínua.
* O produto químico da água de alimentação é adicionado ao **tanque de água de alimentação**.
* A solução de **fosfato** é adicionada à água de alimentação **antes dos economizadores**, com objetivo de **alcalinizar a água da caldeira**.

> Consultar `Caldeira_Especificacao_Qualidade_Agua_Material_Leito` (Capítulo 2) para os requisitos de qualidade da água, e os fragmentos de `Caldeira_Quimica_Agua_*` (Capítulo 9) para a química da água e análise de amostras.

### Sistema de Amostragem

O sistema de amostragem e suas análises devem estar operacionais durante toda a operação da caldeira, para acompanhar a qualidade da água e do vapor.

* Uma **sonda de batida** para amostragem é instalada no tubo de vapor saturado e principal — um tubo perfurado que coleta amostra representativa do perfil de fluxo.
* O vapor é conduzido a um **refrigerador de amostra**, condensado e resfriado a aproximadamente **20-30 °C**. Amostras do condensado são retiradas para análise laboratorial.
* Outros pontos de amostragem: **água de alimentação** e **água da caldeira**.
* As amostras devem fluir **continuamente** do resfriador. Se interrompido, o fluxo é reiniciado e **as amostras para análise não devem ser coletadas antes de 1 hora após o reinício**.

**Checklist de rotina:**
* Verificar o fluxo de água de resfriamento.
* Verificar os fluxos de amostra.
* Ajustar a purga contínua e a dosagem química com base nas análises.

## Notas
Fragmento derivado do Capítulo 5, seções 5.12, 5.13, 5.13.1 e 5.14, do Manual de Operação da Caldeira de Força.
