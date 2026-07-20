---
id: cf_operacao_combustivel_auxiliar_controle_queimador
setor: caldeira_de_forca
categoria: operacao
equipamento_foco: queimador_partida
tags: [combustivel_auxiliar, queimador_partida, bpf, diesel, loops_controle, sinterizacao, srs]
---

## Operação Normal — Sistema de Combustível Auxiliar e Controle do Queimador

Equipamento mostrado nas telas DCS "Óleo para queimadores" (Figura 16) e "Permissão e falhas do queimador de partida do SRS" (Figura 17) do documento original.

### Tabela 10 — Loops de Controle no Sistema de Combustível Auxiliar

| Código (tag) | Loop | Modo | Controles de saída |
|---|---|---|---|
| **37222-FIC-5892** | Controle de fluxo, óleo diesel para queimadores de partida | A (interno) | Válvula 37222-FV-5892 |
| **37222-FIC-5886** | Controle de fluxo, óleo combustível pesado (BPF) para queimadores de partida | A (interno) | SP para controle de pressão 37222-PIC-5884 |
| **37222-FIC-5885** | Controle de fluxo, BPF para queimadores de partida | A (interno) | Válvula 37222-FV-5885 |
| **37222-PIC-5884** | Controle da pressão de BPF | R (externo; também interno) | Válvula 37222-PV-5884 |
| **37222-PIC-5877** | Vapor MP para atomização de BPF | A (interno) | Válvula 37222-PV-5877 |

### Controle do Queimador

O queimador de partida é usado **apenas para aumentar a temperatura do leito durante a partida**.

* Quando a temperatura do leito for **> 800 °C**, o queimador de partida deve ser desligado devido à **sinterização do leito**.
* Os queimadores de partida podem ser usados para queima suplementar por curto período se a temperatura do leito **cair < 650 °C** ao usar combustível sólido de baixo valor calorífico. Recomenda-se aumentar a remoção de cinza do fundo nessa situação.
* Verificar se as sequências de partida e desligamento do queimador funcionam normalmente.

### Tabela 11 — Configurações do DCS no Sistema de Combustível Auxiliar

| Ponto | Instrução |
|---|---|
| Carga SP dos queimadores de partida | Óleo SP do queimador (MW) |
| Fluxo de retorno de BPF | 0…2160 kg/h |
| Pressão de vapor de atomização de BPF | Pressão de vapor de atomização de HFO |
| Óleo diesel para os queimadores de partida | 0…2160 kg/h |

### Verificações com Queima de Combustível Auxiliar Ligada

* Formato e cor da chama normais; a chama **não atinge a caneta do queimador** (equipada com refratário).
* Nenhum vazamento no sistema.
* Queimadores recebem ar de resfriamento suficiente enquanto fora de operação.
* Ler atentamente as instruções operacionais do fabricante do queimador.

### Limites de SRS para Iniciar Alimentação de Combustível Sólido

* Temperatura do leito **> 600 °C**, OU
* Temperatura do leito **> 350 °C** e o fogo de partida na fornalha está **LIGADO**.

Após a temperatura do leito **> 650 °C**, os queimadores de partida podem ser desligados — reduzir a potência lentamente até o mínimo antes de desligar.

> **NOTA!** Quando a temperatura do leito for **> 800 °C**, o queimador de partida deve ser desligado devido à sinterização do leito.

Durante operação normal da caldeira BFB, **o combustível auxiliar não é usado**. A queima de combustível auxiliar é desligada pela sequência de desligamento; após o desligamento, verificar se o ignitor do queimador está **fora da fornalha**.

## Notas
Fragmento derivado do Capítulo 5, seções 5.22 e 5.22.1, do Manual de Operação da Caldeira de Força. Este é o último fragmento do Capítulo 5 (Operação Normal).
