---
id: cf_intertravamento_srs3_combustivel_solido
setor: caldeira_de_forca
categoria: intertravamento
equipamento_foco: leito_fluidizado
tags: [srs, intertravamento, desarme, combustivel_solido, temperatura_leito, ar_primario, fornalha_purgada]
---

## Descrição de SRS — Nível de SRS 3: Desarme para Combustível Sólido (37220-XS-6228)

### Condições para o Desarme NÃO Estar Ativo (permitir alimentação de combustível sólido)

A proteção "Desarme para combustível sólido" **não está ativa** — permissão disponível — somente se todos os sinais abaixo forem válidos:

| Sinal | Condição |
|---|---|
| Proteção principal: Desarme para queimadores | **37220-XS-6227 = 1** |
| Ventilador de ar primário em operação | **37224-XS-6001**: VFD = 1 e fluxo > 5,4 nm³/seg |
| Fluxo de gás de fluidização | **37224-XS-6002 > 18,4 nm³/s** |
| Pressão do ar primário | **37224-XS-6003 > 60 mbar** |
| Temperatura do leito | **37220-XS-6230 > mín** (*) |
| Fornalha purgada ou fogo estável | **= 1** |

**(\*) Critério de temperatura mínima do leito:**
* Se pelo menos **um queimador de partida estiver LIGADO**: temperatura do leito **> 350 °C**.
* Se **nenhum** queimador de partida estiver em operação: temperatura do leito (**9 de 12 medições**) **> 600 °C**.

Quando todas as condições acima forem atendidas, a permissão "Desarme para combustível sólido" está **ativada**, permitindo iniciar a alimentação de combustível sólido para a fornalha.

### Equipamento Afetado pelo Desarme (SRS Nível 3)

Se o desarme for acionado, as seguintes roscas de alimentação de combustível são **desligadas**:
* Rosca de alimentação de combustível 1 — **37228-M-5665**
* Rosca de alimentação de combustível 2 — **37228-M-5667**
* Rosca de alimentação de combustível 3 — **37228-M-5661**
* Rosca de alimentação de combustível 4 — **37228-M-5666**
* Rosca de alimentação de combustível 5 — **37228-M-5668**
* Rosca de alimentação de combustível 6 — **37228-M-5662**
* Permissão de queima de DNCG: **OFF**.

## Notas
Fragmento derivado do Capítulo 10, seção 10.2.3, do Manual de Operação da Caldeira de Força — último fragmento do Capítulo 10 (Descrição de SRS). O Nível 3 depende do Nível 2 estar liberado (ver `Caldeira_Intertravamento_SRS2_Queimadores`). Este é o nível de proteção mais diretamente ligado à combustão em leito fluidizado (ver também `Caldeira_Operacao_Leito_Fluidizado_Fundamentos_Temperatura`, que menciona o limite superior de 935°C para desarme por superaquecimento do leito).
