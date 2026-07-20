---
id: cf_partida_alimentacao_combustivel_solido
setor: caldeira_de_forca
categoria: partida
equipamento_foco: leito_fluidizado
tags: [combustivel_solido, leito_fluidizado, temperatura_leito, srs, queimador_partida, transicao_combustivel]
---

## Partida: Sistema de Alimentação de Combustível Sólido e Transição para Combustão em Leito Fluidizado

Durante a partida, é recomendado usar combustível sólido relativamente **seco (teor de umidade de 40-45%)**. Combustível seco inflama mais facilmente, eleva a temperatura do leito com mais eficiência, e ajuda a minimizar carbono não queimado nas cinzas durante a partida.

### Pré-condição de Segurança (SRS)

A pré-condição para a partida de combustível sólido no SRS é que **"37220-XS-6228 Proteção principal, desarme para combustível sólido"** esteja em boas condições. Com essa permissão, a sequência de inicialização de alimentação de combustível **37228-XS-5551** (linha 1) e **37228-XS-5555** (linha 2) pode operar.

### Medições de Temperatura do Leito

12 pontos de medição distribuídos (parede dianteira, média, parede traseira × esquerda/esquerda média/direita média/direita): tags **37224-TI-5336** a **37224-TI-5347**.

* **Cálculo da temperatura do leito (37224-TIC-5333):** média das nove medições mais altas no leito (9 de 12).
* **Alarme:** quando a temperatura mais alta for **100 °C maior** do que a temperatura mais baixa no leito.

### Condição para Iniciar a Alimentação de Combustível Sólido

O SRS libera a alimentação de combustível sólido quando:
* Temperatura do leito **> 600 °C**, OU
* Temperatura do leito **> 350 °C** e pelo menos um queimador de partida estiver **LIGADO**.

Quando a temperatura do leito ultrapassa o limite de intertravamento (> 350 °C), a alimentação de combustível sólido inicia com o queimador de partida ainda em operação; depois o queimador de partida é desligado e passa a queimar apenas combustível sólido.

* A carga do queimador de partida é aumentada para que a temperatura do leito suba a **1-2 °C/min**.
* Ao iniciar a alimentação de combustível sólido, a temperatura do leito **cai cerca de 10-30 °C**. O operador monitora e **desliga a alimentação** se o combustível se acumular sob as calhas ou se a temperatura cair significativamente; após desligar, a temperatura deve subir novamente. O gradiente de temperatura do leito (**37224-XI-5334**) também é monitorado.
* Ao iniciar a alimentação, o teor de oxigênio do gás de combustão (**37224-AI-5404**, **37224-AI-5405**) diminui e as temperaturas em diferentes partes da caldeira começam a subir. **Por segurança, a ignição do combustível sólido só pode ser observada pelos visores de vidro.**

### Temperatura do Leito 450–500 °C

* Temperatura elevada a **1-4 °C/min**; o gradiente aumenta junto com o efeito do combustível.
* Fluxo de combustível sólido aumentado; carga dos queimadores de partida reduzida.
* Fluxo de ar secundário aumentado conforme necessário; níveis de O2 e NOx monitorados.

### Desligamento do Queimador de Partida

* Temperatura do leito **600-700 °C**: queimador de partida reduzido para carga mínima.
* Temperatura do leito **650-700 °C**: queimador de partida desligado (pelo DCS). Ao desligar:
  * Continuar monitorando O2 do gás de combustão (37224-AI-5404, 37224-AI-5405).
  * Aumentar o fluxo de combustível sólido (**37228-XC-5579**) conforme necessário para manter a temperatura do leito.
  * Controles de fluxo de ar secundário inferior (**37224-FIC-5372, 37224-FIC-5375**), superior (**37224-FIC-5378, 37224-FIC-5379**) e terciário (**37224-FIC-5380, 37224-FIC-5381**): modo **REMOTO**.
  * Controle de pressão de ar secundário (**37224-PIC-5369**): modo **REMOTO** (ponto de ajuste depende da carga da caldeira).
  * Controlador de teor de oxigênio do gás de combustão (**37224-AIC-5406**): modo **REMOTO**; **O2 mantido acima de 2%**.
  * Dampers de ar secundário inferior dos queimadores de partida (**37224-FIC-5373, 37224-FIC-5374, 37224-FIC-5376, 37224-FIC-5377**): modo **REMOTO**.

A sequência de inicialização (37228-XS-5551, 37228-XS-5555) define os controles para modo automático, mantendo a relação ar/combustível dentro da faixa projetada; a velocidade de todos os transportadores é alterada de acordo com as roscas de alimentação.

> **NOTA!** Certificar-se de que a partida do equipamento de alimentação de combustível não cause perigo a ninguém.

> **NOTA!** O combustível sólido levado aos silos da caldeira deve estar dentro dos requisitos de qualidade definidos na base do projeto.

### Acompanhamento Contínuo

* Monitorar a ignição do combustível sólido quando a queima em leito fluidizado começar.
* Garantir fornecimento ininterrupto e uniforme de combustível sólido, com qualidade e mistura uniformes.
* Acompanhar as medições de temperatura do leito na tela DCS.
* Confirmar que os controles estão em modo automático (combustível e ar alinhados).
* Confirmar que a qualidade do combustível atende aos requisitos do fornecedor da caldeira.

## Notas
Fragmento derivado do Capítulo 4, seção 4.14, do Manual de Operação da Caldeira de Força. Para a lógica formal de intertravamento SRS Nível 3 (desarme para combustível sólido), ver `Caldeira_Intertravamento_SRS3_Combustivel_Solido`.
