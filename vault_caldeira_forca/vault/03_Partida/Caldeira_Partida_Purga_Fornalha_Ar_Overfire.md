---
id: cf_partida_purga_fornalha_overfire
setor: caldeira_de_forca
categoria: partida
equipamento_foco: ventilador_ar_overfire
tags: [purga_fornalha, ar_overfire, sequencia_purga, seguranca, srs, preaquecedor_vapor]
---

## Partida: Purga da Fornalha e Sistema de Ar Overfire

> **AVISO!** A fornalha da caldeira é **purgada com ar overfire** através dos bocais de ar secundário e queimadores de partida antes da ignição de qualquer queimador, para evacuar gases explosivos — pré-condição obrigatória para uma partida segura.

### Pré-condições para Iniciar a Sequência de Purga

* O Sistema Relacionado à Segurança (**SRS**) da caldeira está em boas condições — ex.: desarme dos ventiladores de ar não está ativo, e o SRS é redefinido quando o fluxo de ar de combustão e a pressão estão acima do limite de purga.
* **Sem fogo na fornalha.**

### Sequência de Purga da Caldeira (37224-XS-5384)

1. O operador inicia a sequência de purga **37224-XS-5384** com o comando "iniciar" no display DCS.
2. O ventilador de ar overfire **37224-M-5324** é iniciado automaticamente.
3. Os dampers de controle de fluxo de ar overfire (**37224-PIC-5369, 37224-FIC-5372, 37224-FIC-5375, 37224-FIC-5378, 37224-FIC-5379**) e os dampers de ar dos queimadores de partida (**37224-FIC-5373, 37224-FIC-5374, 37224-FIC-5376, 37224-FIC-5377**) abrem automaticamente para a posição de purga.
4. Contagem regressiva de purga em execução: **5 minutos**, desde que todas as condições estejam OK. O display DCS mostra "Purga da fornalha está ligada" e o "Tempo restante de purga".
5. Ao término da contagem, os dampers de purga voltam à posição inicial.
6. A sequência termina; a fornalha está purgada. Após o período de purga (5 min), o **queimador inicial pode ser aceso**. O display mostra "Tempo restante de ignição" (10…0 min). O queimador de óleo tem **duas tentativas de ignição** para atingir a primeira chama.

### Quando a Purga NÃO é Necessária

A purga pode ser dispensada se:
* A temperatura do leito fluidizado **37221-TIC-5333** permanecer **acima de 600 °C**, **E**
* Menos de **10 minutos** se passaram desde que os transportadores de combustível sólido pararam.

Neste caso, o ventilador de ar overfire é iniciado e os controles de pressão/fluxo são definidos pelo operador. A combustão do leito fluidizado pode iniciar diretamente se: temperatura do leito > 600 °C, o fluxo do gás de fluidização (**37224-XS-6002**) excede o valor de intertravamento inferior, e demais critérios de proteção da caldeira são atendidos.

> **NOTA!** O procedimento de purga é **obrigatório sempre que a caldeira apaga**.

> Referência: Descrição do Processo — Sistema de Ar (C03835372088_0003001_0704504) e SRS FUP 37220-A-DIT-00031-0001.

### Pré-Aquecedor de Vapor de Ar Overfire

Usado para elevar a temperatura do ar overfire antes de entrar no pré-aquecedor de ar de combustão, elevando também a temperatura do gás de combustão na saída da caldeira.

* Válvulas manuais **37225-V-6366** e **37225-V-6364** (linhas de vapor SLP): **abertas**.
* Válvulas manuais **37225-V-6408** e **37225-V-6409** (linhas de condensado): **abertas**.
* Durante a partida, o purgador de vapor é desviado abrindo a válvula manual **37225-V-6407** (linha de condensado); mantida aberta até a linha de condensado aquecer.
* Iniciar o pré-aquecedor abrindo a válvula de controle de vapor LP **37224-TV-5362** em cerca de **15%**. Partida lenta, acompanhando o aquecimento do pré-aquecedor e da tubulação de condensado.
* Quando as linhas estiverem aquecidas, o controle de temperatura do ar overfire **37225-TIC-5362** é definido para modo **REMOTO**.

## Notas
Fragmento derivado do Capítulo 4, seções 4.7 e 4.7.1, do Manual de Operação da Caldeira de Força. Para a lógica formal de intertravamento (SRS Nível 1 — desarme dos ventiladores de ar), ver `Caldeira_Intertravamento_SRS1_Ventiladores`.
