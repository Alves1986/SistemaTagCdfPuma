---
id: cf_analise_riscos_ar_fluidizacao_combustao
setor: caldeira_de_forca
categoria: analise_riscos
equipamento_foco: sistema_ar_gas_combustao
tags: [analise_riscos, ar_fluidizacao, ar_combustao, oxigenio, sinterizacao, explosao_fornalha]
---

## Instruções de Análise de Perigos e Riscos — Fluxo e Temperatura do Ar de Fluidização/Combustão

### Fluxo de Gás de Fluidização Insuficiente (12.5.3)

**Consequências:** combustão incompleta; perturbação da combustão / **perigo de explosão da fornalha**.

**Preparativos:**
* Se o fluxo de gás de fluidização (**088-3-11-058**) for insuficiente: verificar medições de O2 (**37224-AI-5404, 5405, 5406**), fluxo de ar primário (**37224-FI-5316**) e fluxo de gás de recirculação (**37224-FI-5329**). Comparar valores.
* Verificar dutos de ar/gás de recirculação — em caso de vazamento no duto, as medições de fluxo podem não ser confiáveis, mas as **medições de O2 continuam válidas**.
* Verificar temperatura do duto de ar (**37224-TI-5315**) e do gás de recirculação (**37224-TI-5327**) — usadas para compensação de fluxo.
* Seguir o cálculo de velocidade do gás de fluidização no DCS; aumentar a correção do ar primário na tela "Cálculo de controle de ar", se necessário.
* Verificar e seguir a medição de CO na chaminé.
* Se persistir, diminuir a carga ao mínimo; se não for corrigível durante a operação, **desligar a caldeira**.

### Fluxo de Ar de Combustão Muito Pequeno (12.5.4)

**Consequências:** combustão incompleta; perturbação da combustão / **perigo de explosão da fornalha**.

**Preparativos:**
* Se o fluxo de ar de combustão (**37224-FI-5360**) for insuficiente: verificar medições de O2 (**37224-AI-5404, 5405, 5406**), dutos de ar (vazamento — O2 continua válido mesmo com fluxo não confiável), temperatura do duto de ar (**37224-TI-5315**), pressões de ar (**37224-PI-5368, 37224-PI-5370**) e CO na chaminé.
* O sistema de controle limita o efeito do combustível sólido a partir do fluxo de ar total calculado para a fornalha.
* Se persistir, diminuir a carga ao mínimo; se não for corrigível, **desligar a caldeira**.

### Alta Temperatura do Ar Primário e Gás de Recirculação (12.5.5)

**Consequências:** **sinterização do leito**; desligamento.

**Preparativos:** proteção de alta temperatura do leito desliga as roscas alimentadoras (a partir da medição de controle da temperatura do leito); verificar condições do leito, remover material do leito se necessário e adicionar material fresco.

### Baixa Temperatura do Ar Primário e Gás de Recirculação (12.5.6)

**Consequências:** temperatura do leito em queda; ignição lenta do combustível; formação de combustíveis não queimados e gases explosivos; **risco de explosão da fornalha**.

**Preparativos:** o controle de temperatura do leito é parte do SRS — temperatura **> 350 °C com pelo menos um queimador funcionando**, ou **> 600 °C**, para permissão de queima de combustível sólido. Queimadores de partida podem ser usados para aumentar a temperatura do leito.

## Notas
Fragmento derivado do Capítulo 12, seções 12.5.3, 12.5.4, 12.5.5 e 12.5.6, do Manual de Operação da Caldeira de Força — últimos fragmentos da seção "Sistema de Vapor" (12.5), cujo conteúdo trata na verdade do sistema de ar de combustão.
