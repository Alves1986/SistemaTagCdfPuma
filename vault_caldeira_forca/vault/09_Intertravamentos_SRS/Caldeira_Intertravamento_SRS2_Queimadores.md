---
id: cf_intertravamento_srs2_queimadores
setor: caldeira_de_forca
categoria: intertravamento
equipamento_foco: queimador_partida
tags: [srs, intertravamento, desarme, queimador_partida, ar_overfire, oxigenio, dncg]
---

## Descrição de SRS — Nível de SRS 2: Desarme para os Queimadores (37220-XS-6227)

### Condições para o Desarme NÃO Estar Ativo (permitir queimadores)

A proteção "Desarme para os queimadores" **não está ativa** — permissão disponível — somente se todos os sinais abaixo forem válidos:

| Sinal | Condição |
|---|---|
| Proteção principal: Desarme para ventiladores de ar | **37220-XS-6225 = 1** |
| Pressão do ar overfire (2oo2) | **37224-XS-6006 > 12 mbar** |
| Ventilador de ar overfire em operação | **= 1** |

**A condição "ventilador de ar overfire em operação" é atendida quando:**
* Ventilador de ar overfire em operação (2oo2) — **37224-M-5324**, **E**
* Fluxo de sucção de ar overfire — **37224-FI-5360 > 5,1 nm³/seg**

Quando todas as condições acima forem atendidas, a permissão "Desarme para os queimadores" está **LIGADA**, permitindo iniciar os queimadores de partida — desde que a **fornalha esteja pronta para a partida do queimador** (purgada) e as **permissões específicas de combustível e do queimador** sejam válidas (detalhadas na Descrição do Processo do sistema de HFO).

### Verificação de Nível Mínimo de Oxigênio (parte da lógica do queimador)

* Medição de O2 **37224-AI-5404**: mínimo **> 1%** (medição em bom estado).
* Medição de O2 **37224-AI-5405**: mínimo **> 1%** (medição em bom estado).
* **Atraso de 60 segundos.**
* Lógica **2oo2**: se as duas medições estiverem em estado "ruim", o desarme é acionado.

### Equipamento Afetado pelo Desarme (SRS Nível 2)

Se o desarme for acionado:
* Queimadores de partida 1, 2, 3 e 4 (**37222-M-5141, 37222-M-5142, 37222-M-5143, 37222-M-5144**): **desligados**.
* Permissão de queima de DNCG: **OFF**.
* Desarme para combustível sólido: **ON** (o nível 3 é automaticamente acionado).

## Notas
Fragmento derivado do Capítulo 10, seção 10.2.2, do Manual de Operação da Caldeira de Força. O Nível 2 depende do Nível 1 estar liberado (ver `Caldeira_Intertravamento_SRS1_Ventiladores`) e é pré-condição para o Nível 3 (ver `Caldeira_Intertravamento_SRS3_Combustivel_Solido`).
