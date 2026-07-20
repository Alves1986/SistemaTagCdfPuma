---
id: cf_partida_combustivel_auxiliar_queimadores
setor: caldeira_de_forca
categoria: partida
equipamento_foco: queimador_partida
tags: [queimador_partida, combustivel_auxiliar, oleo_bpf, diesel, ignicao, srs, temperatura_leito]
---

## Partida: Sistema Auxiliar de Combustível e Queimadores de Partida

### Identificação dos Queimadores de Partida (tags DCS)

| Queimador | Sequência de Partida | Controle fluxo HFO/pressão BPF | Controle fluxo Diesel | Controle fluxo ar de combustão |
|---|---|---|---|---|
| Queimador de Partida 1 | 37222-XS-5939 | — | 37222-FIC-5892 | 37224-FIC-5376 |
| Queimador de Partida 2 | 37222-XS-5984 | 37222-FIC-5886 / 37222-PIC-5884 | NA | 37224-FIC-5373 |
| Queimador de Partida 3 | 37222-XS-6029 | — | 37222-FIC-5892 | 37224-FIC-5377 |
| Queimador de Partida 4 | 37222-XS-6074 | — | NA | 37224-FIC-5374 |

Os queimadores de partida elevam a temperatura do material do leito até que a alimentação de combustível sólido possa ser iniciada. Ao queimar apenas com os queimadores de partida (sem combustão em leito fluidizado), o leito deve ser resfriado com ar primário suficiente para permanecer fluidizado o tempo todo.

> **AVISO!** Antes de iniciar qualquer queimador de partida, o leito de fluidização deve estar abastecido com material de leito adequado. O material do leito protege o **grid** da caldeira e, especialmente, os **bocais de ar primário** contra o calor da chama do queimador de partida.

### Procedimento de Ignição

Os queimadores partem conforme as instruções do fabricante do queimador, localmente (painel local) ou pela sala de controle (sequência de ignição). **Recomenda-se iniciar localmente na primeira vez**, e também após cada desligamento para manutenção.

**Checklist antes da ignição:**
* Gás de ignição disponível.
* Circulação de BPF iniciada.
* Ar de atomização e de resfriamento fornecido aos queimadores (a falta de ar de atomização/resfriamento pode **danificar a lança do queimador ou o bocal**).
* Ignição na posição e cabos conectados.

### Precondições de Segurança (SRS)

O SRS verifica as precondições antes que qualquer queimador de inicialização possa partir; se alguma não estiver em boas condições, **um desarme é acionado**. A precondição é que **"37220-XS-6227 Proteção principal, desarme dos queimadores"** esteja em boas condições.

* Quando o SRS autorizar, ajustar a permissão DCS do queimador de inicialização para **LIGADO**.
* Iniciar o queimador de partida com a sequência de partida para potência mínima.
* O efeito do queimador é controlado pelo ponto de ajuste de fluxo de BPF ou Diesel.

**Após a partida do queimador:**
* Acompanhar forma e cor da chama — a chama deve encher a abertura do queimador e **não atingir o cone do queimador**.
* Verificar ausência de vazamentos no nível do queimador.

### Elevação da Temperatura do Leito

* A carga dos queimadores de partida aumenta seguindo as restrições da **curva de aumento de pressão da caldeira**.
* Garantir fluxo de ar de fluidização suficiente o tempo todo, para que a chama não derreta a superfície do leito de areia.
* O pré-aquecedor de ar da bobina de vapor de ar primário entra em capacidade total assim que possível — **no máximo 1 hora antes** de iniciar a alimentação de combustível sólido — ajustando o controle de temperatura para **REMOTO**. Temperatura de saída do gás de combustão: **mínimo 125-130 °C**.

> Durante as primeiras partidas, os refratários da fornalha também devem ser monitorados; a cura refratária segue as instruções do fornecedor de refratários.

## Notas
Fragmento derivado do Capítulo 4, seção 4.9, do Manual de Operação da Caldeira de Força. Para a sequência de transição para combustível sólido, ver `Caldeira_Partida_Alimentacao_Combustivel_Solido`.
