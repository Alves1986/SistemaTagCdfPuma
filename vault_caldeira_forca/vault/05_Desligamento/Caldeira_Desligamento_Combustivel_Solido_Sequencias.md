---
id: cf_desligamento_combustivel_solido_sequencias
setor: caldeira_de_forca
categoria: desligamento
equipamento_foco: rosca_alimentacao_combustivel
tags: [desligamento, combustivel_solido, sequencia_desligamento, valvula_rotativa, resfriamento_leito]
---

## Desligamento: Sistema de Combustível Sólido — Sequências de Parada (37228-XS-5552 / 37228-XS-5556)

### Desligamento por Sequência Automática

Quando os níveis do silo estiverem baixos, iniciar a sequência de desligamento na tela do DCS. Há sequências separadas para as linhas 1 e 2.

**Sequência de desligamento da linha 1 (37228-XS-5552 — "Alimentação de Combustível-1-Sequência, Desligamento"):**
* Desligamento do descarregamento de combustível do silo 1.
* Desligamento do transportador de combustível 1.
* Desligamento das roscas de alimentação de combustível **1, 2 e 3**.

**Sequência de desligamento da linha 2 (37228-XS-5556 — "Alimentação de Combustível-2-Sequência, Desligamento"):**
* Desligamento do descarregamento de combustível do silo 2.
* Desligamento do transportador de combustível 2.
* Desligamento das roscas de alimentação de combustível **4, 5 e 6**.

**Após a sequência:**
* Ajustar equipamentos de descarregamento do silo, transportadores e roscas de alimentação para modo **MANUAL**.
* Ajustar os controles de nível da caixa de balanceamento **37228-LIC-5471** e **37228-LIC-5529** para modo **MANUAL**.
* Desligar as sequências (37228-XS-5552, 37228-XS-5556) — **NÃO desligar as válvulas rotativas**: 37228-M-5669 (1), 37228-M-5671 (2), 37228-M-5673 (3), 37228-M-5670 (4), 37228-M-5672 (5), 37228-M-5674 (6).
* Iniciar o(s) queimador(es) de partida conforme o fluxo de combustível sólido diminui, para suporte de queima durante o desligamento.
* Desligar a alimentação automática de material do leito; ajustar a rosca **37229-M-5772** para **MANUAL**. O material do leito é resfriado a **pelo menos 50 °C** usando ar primário (a caldeira esfria mais rápido se a areia for retirada do leito).
* Manter o fluxo de vapor nos superaquecedores. Os alimentadores rotativos permanecem em operação.
* Verificar se as calhas de alimentação de combustível sólido estão **vazias** — após desligar a alimentação, a carga da caldeira cai rapidamente.
* Queimar o leito vazio mantendo o **ventilador de ar primário** em operação, pelo menos com fluxo mínimo.
* Recomenda-se operar as válvulas rotativas até a temperatura do leito ficar **abaixo de 300 °C**. Depois, desligar as válvulas rotativas e ajustar para manual após a ventilação da fornalha.

### 6.2.3.1 — Desligamento do Combustível Sólido Manualmente

Se o desligamento não for feito por automação:

1. Verificar se a alimentação de combustível para os silos foi desligada.
2. Desligar a rosca principal do silo 1 (**37228-M-5657-M1**) e acionamentos giratórios (**37228-M-5657-M2/M3**) quando o nível do silo 1 estiver baixo; idem para o silo 2 (**37228-M-5658-M1**, **37228-M-5658-M2/M3**).
3. Iniciar o(s) queimador(es) de partida conforme o fluxo de combustível diminui.
4. Desligar os transportadores de arraste **37228-M-5659** e **37228-M-5660** (dos silos para os mini-silos).
5. Desligar a alimentação automática de material do leito; resfriar a pelo menos **50 °C** com ar primário.
6. Manter o fluxo de vapor nos superaquecedores.
7. Quando o nível do mini-silo for **0%** e a alimentação ao leito concluída, desligar as roscas de alimentação: **37228-M-5665, 37228-M-5667, 37228-M-5661, 37228-M-5666, 37228-M-5668, 37228-M-5662**. As válvulas rotativas permanecem em operação.
8. Verificar se as calhas estão vazias; queimar o leito vazio com ventilador de ar primário em fluxo mínimo.
9. Operar as válvulas rotativas até temperatura do leito **< 300 °C**, então desligá-las (37228-M-5669, 5670, 5671, 5672, 5673, 5674) e ajustar para manual após a ventilação da fornalha.

## Notas
Fragmento derivado do Capítulo 6, seções 6.2.3 e 6.2.3.1, do Manual de Operação da Caldeira de Força.
