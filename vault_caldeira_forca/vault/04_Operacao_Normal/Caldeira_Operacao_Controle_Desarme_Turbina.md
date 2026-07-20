---
id: cf_operacao_controle_operacao_desarme_turbina
setor: caldeira_de_forca
categoria: operacao
equipamento_foco: geral
tags: [controle_operacao, inspecao_campo, desarme_turbina, valvula_partida, valvula_seguranca]
---

## Operação Normal — Controle de Operação e Desarme da Turbina

### Controle de Operação

Duas formas de observação:
1. Por instrumentação na sala de controle (**DCS**).
2. **Observações diretas em campo.**

Em uma planta moderna, a instrumentação DCS é mais abrangente, mas as observações do operador de campo são de **vital importância** para o sucesso da operação. Fontes de informação do DCS:

* Valores medidos e calculados nas telas do DCS.
* Curvas de tendência.
* Análises periódicas de laboratório: água da caldeira, vapor, condensado, água de alimentação, combustível sólido, cinzas, etc.
* Cálculo do fluxo de combustível e cálculo do ar.
* Alarmes de medições, ultrapassagem de limites, possíveis danos.

> **NOTA!** O operador deve verificar se as impressoras de processo e de alarme sempre funcionam corretamente.

Os dados de processo por ponto de carga estão nos fragmentos `Caldeira_Desempenho_*` (Capítulo 2); os limites de alarme e intervalos de gradiente estão na lista de alarmes.

**Inspeção de campo:** é muito importante verificar o funcionamento da caldeira regularmente — **pelo menos uma vez por turno**. O operador de campo faz inspeção completa da estrutura, do andar superior ao inferior:
* Observar ruídos estranhos e sinais de vazamentos.
* Comparar valores de medição locais com valores do DCS.
* Comunicar e relatar observações ao operador do DCS durante a inspeção.

### Desarme da Turbina

Durante o desarme da turbina, **nenhuma ação é necessária na caldeira**. A caldeira permanece em operação e o vapor é direcionado para outro destino (não a turbina).

* Se a pressão na caldeira aumentar: a **válvula de partida** abre primeiro. Capacidade da válvula de partida: **30%** da capacidade da caldeira.
* Se a pressão continuar aumentando: as **válvulas de segurança** da caldeira abrem. Capacidade das válvulas de segurança: **100%** da capacidade da caldeira.

## Notas
Fragmento derivado do Capítulo 5, seções 5.6 e 5.7, do Manual de Operação da Caldeira de Força.
