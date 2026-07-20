---
id: cf_operacao_leito_fluidizado_fundamentos_temperatura
setor: caldeira_de_forca
categoria: operacao
equipamento_foco: leito_fluidizado
tags: [leito_fluidizado, temperatura_leito, gas_recirculacao, ar_primario, intertravamento, sinterizacao, corte_energia]
---

## Operação Normal — Controle de Leito Fluidizado: Fundamentos e Controle de Temperatura

### Geral

O leito fluidizado é constituído por **areia natural peneirada (0,5-1,2 mm)**, através da qual o gás fluidizante (ar primário + gás de recirculação) é soprado. No processo, o leito tritura, seca e inflama o combustível; a combustão é estabilizada pela grande capacidade de calor do leito. Devido à mistura completa e boa transferência de calor, a **temperatura do leito é praticamente constante** em diferentes partes dele.

* A temperatura do leito — fator mais importante da operação — se estabiliza em **700-900 °C** sem medidas especiais, se o combustível estiver dentro da faixa de projeto.
* A temperatura tende a subir quanto maior o valor de aquecimento, o tamanho de partícula e a densidade do combustível. **Se a temperatura permanecer abaixo de 850-900 °C em regime, resfriamento não é necessário.**
* **Intertravamento de limite superior: alimentação de combustível interrompida se a temperatura do leito subir acima de 935 °C.** A interrupção reduz a temperatura rapidamente.
* O combustível deve estar livre de impurezas (pedras, metais, objetos inertes); pequenos objetos ocasionais são tolerados.

### Controle de Temperatura do Leito com Gás de Recirculação

A **diminuição** da temperatura do leito é feita por recirculação do gás de combustão: parte do ar primário é substituída por gás inerte, reduzindo a temperatura. Simultaneamente, o ar primário diminui e o ar secundário aumenta para manter constante o fluxo total de fluidização.

* O ventilador de recirculação inicia **automaticamente** se o desvio do controle de temperatura do leito for **< 5 °C**, ou **< 10 °C por 2 minutos** (modo automático da sequência de partida).
* Com o ventilador funcionando, o damper **37224-FV-5329** abre automaticamente conforme o SP de temperatura do leito; ar primário diminui e ar secundário aumenta na mesma proporção.
* O ventilador desliga automaticamente quando a temperatura do leito diminui.

> **NOTA!** Se o valor de processo do controlador de temperatura do leito (média das 9 medições mais altas) exceder **935 °C**, as roscas de alimentação de combustível são **desligadas pelo DCS**.

> **NOTA!** Se o ventilador de gás de recirculação desligar por problema, o operador deve **diminuir imediatamente o fluxo de combustível sólido**, evitando acúmulo local de combustível no leito — o que elevaria a temperatura e causaria **sinterização da areia**.

### Controle da Temperatura do Leito com Ar Primário

Pode-se diminuir a temperatura do leito **reduzindo o fluxo de ar primário**, o que diminui a combustão dentro do leito de areia (relação ar primário/ar de combustão).

### Controle de Temperatura do Leito com Alimentação de Combustível

A alimentação deve ser a mais uniforme possível — variações na densidade do combustível costumam causar problemas.

* Fluxo irregular detectável por: diferenças de temperatura do leito entre lado esquerdo/direito (lado mais frio = alimentação mais intensa nesse lado → reduzir alimentação nele), ou por observação visual pelos visores de vidro (lado mais escuro = alimentação mais intensa).
* Controle via velocidade das roscas de alimentação sob a caixa de balanceamento. **Leva cerca de 10 minutos** para a mudança aparecer na temperatura do leito.
* Também é possível reduzir a temperatura diminuindo resíduos secos de alto poder calorífico, ou piorando a qualidade do combustível (umedecimento) e reduzindo o tamanho de partícula.
* **Acima de 935 °C:** o intertravamento desliga a alimentação. Em seguida, levar o controle de ar de fluidização para **manual** e garantir quantidade suficiente de gás de fluidização, mantendo até a temperatura cair **abaixo de 850 °C** — evitando acúmulo de combustível e areia sinterizada.

### Controle de Temperatura do Leito Durante Cortes de Energia e Queima Somente a Óleo

Durante parada não intencional da alimentação de combustível, manter a temperatura do leito **o mais alta possível** para reinício rápido assim que o problema for corrigido.

* Quando o leito é queimado "vazio" e a temperatura começa a cair (**< 800 °C**), o **ventilador de ar primário é desligado** para evitar resfriamento desnecessário; o ar secundário também é reduzido.
* Se a produção de vapor continuar, os queimadores devem ser acesos para compensar a ausência de combustível sólido.
* Se a queima continuar apenas com queimadores de partida, o leito deve ser resfriado (ar primário através do leito, mantendo-o fluidizado o tempo todo) para evitar sinterização da superfície superior. A demanda de resfriamento depende da radiação incidente (capacidade e distância do queimador ao leito).

## Notas
Fragmento derivado do Capítulo 5, seções 5.17 (introdução), 5.17.1, 5.17.2, 5.17.3, 5.17.4 e 5.17.5, do Manual de Operação da Caldeira de Força. Continua em `Caldeira_Operacao_Leito_Fluidizado_Uma_Linha_Monitoramento_Troubleshooting`.
