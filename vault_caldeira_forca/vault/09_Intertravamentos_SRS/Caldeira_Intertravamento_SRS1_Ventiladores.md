---
id: cf_intertravamento_srs1_ventiladores
setor: caldeira_de_forca
categoria: intertravamento
equipamento_foco: ventilador_de_tiragem
tags: [srs, intertravamento, desarme, ventilador_ar_primario, ventilador_ar_overfire, ventilador_gas_recirculacao, esd, first_out]
---

## Descrição de SRS — Visão Geral e Nível de SRS 1: Desarme para os Ventiladores de Ar (37220-XS-6225)

Este manual de processo pertence à **Caldeira de Força** e apresenta as instruções de SRS (Sistema Relacionado à Segurança) que cobrem a proteção durante a operação e a paralisação. **SRS** = Sistema Relacionado à Segurança (ex.: proteção da caldeira).

### Visão Geral da Proteção Principal de SRS

O objetivo do SRS é garantir a **combustão segura dos combustíveis na caldeira de biomassa** e proteger o equipamento e o pessoal. A proteção principal do SRS tem **três níveis**:

1. **Desarme para ventiladores de ar** — tag **37220-XS-6225** (este fragmento)
2. **Desarme para queimadores** — tag **37220-XS-6227** (ver `Caldeira_Intertravamento_SRS2_Queimadores`)
3. **Desarme para combustível sólido** — tag **37220-XS-6228** (ver `Caldeira_Intertravamento_SRS3_Combustivel_Solido`)

O SRS da caldeira é baseado na construção Andritz; informações mais precisas estão no **Plano Funcional do Sistema Relacionado à Segurança (doc. nº 37220-A-DIT-00031-0001)**. Nos P&IDs, o equipamento SRS é identificado pelo índice superior **"SRS"**.

### Nível de SRS 1 — Condições para o Desarme NÃO Estar Ativo (permitir ventiladores)

A proteção "Desarme para os ventiladores de ar" **não está ativa** — ou seja, a permissão está disponível — somente se **todos** os sinais abaixo forem válidos:

| Sinal | Condição |
|---|---|
| Desligamento de emergência (3 unidades) não ativado — Sala de controle ESD (52-HZ-2018), Nível do queimador de partida de ESD, Saída principal de ESD | = 1 |
| Nível do tubulão | **37221-XS-5310 > -200 mm** |
| Pressão da fornalha abaixo do máximo (2oo3) | **37224-XS-5434 < 25 mbar** |
| Pressão do ar do instrumento | **37220-XS-6135 > 4 bar(g)** |
| Rota do gás de combustão aberta | **37224-XS-5435 = 1** |

**A condição "rota do gás de combustão aberta" é atendida quando:**
* Ventilador de gás de combustão em operação (**37224-M-5333**), **E**
* Controle de pressão do gás de combustão antes do ventilador **37224-PICZ-2399 < -2,5 mbar**, **E**
* Gás de combustão antes da rota ESP — limite aberto 2 de 3 (**37224-ZSH-5441, 37224-ZSH-5442, 37224-ZSH-5443**), **E**
* Gás de combustão após ESP — limite aberto 2 de 3 (**37224-ZSH-5445, 37224-ZSH-5446, 37224-ZSH-5447**)

Quando **todas** as condições acima são atendidas, a permissão "Desarme para os ventiladores de ar" está **ATIVADA**, permitindo iniciar os ventiladores de ar.

### Equipamento Afetado pelo Desarme (SRS Nível 1)

Se o desarme for acionado (condições não atendidas), os seguintes equipamentos são desligados:
* Ventilador de ar primário **37224-M-5313**
* Ventilador de gás de recirculação **37224-M-5320**
* Ventilador de ar overfire **37M-5324** (37224-M-5324)
* Permissão de queima de DNCG: **OFF**

## Notas
Fragmento derivado do Capítulo 10, seções 10 (introdução), 10.1 (referência), 10.2 e 10.2.1, do Manual de Operação da Caldeira de Força. Abreviaturas completas: ver `Caldeira_Glossario_Abreviaturas`. Este é o nível mais básico do SRS — é pré-condição para os níveis 2 e 3.
