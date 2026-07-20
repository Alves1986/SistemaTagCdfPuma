---
id: cf_operacao_sopragem_fuligem
setor: caldeira_de_forca
categoria: operacao
equipamento_foco: soprador_fuligem
tags: [sopragem_fuligem, frequencia, pressao_soprador, loops_controle, vazamento_vapor]
---

## Operação Normal — Sistema de Sopragem de Fuligem

O equipamento é mostrado na tela do DCS "Sistema de sopragem de fuligem" (Figura 6 do documento original).

### Loop de Controle

| Código (tag) | Loop | Modo | Ponto de ajuste | Controles de saída | Notas |
|---|---|---|---|---|---|
| **37227-PIC-5172** | Controle de pressão dos sopradores de fuligem | R (SP externo)* | **20 bar(g)** | Válvula 37227-PV-5172 | *Quando a sequência de sopragem está em operação |

### Frequência da Sopragem de Fuligem

Soprar a fuligem da caldeira de biomassa **apenas periodicamente**. A frequência adequada depende da qualidade do combustível e da carga da caldeira. A necessidade de sopragem pode ser observada por:
* Aumento das diferenças de pressão do gás de combustão nas superfícies do trocador de calor.
* Diminuição da temperatura do vapor.
* Aumento da temperatura de saída do gás de combustão.

Antes de adquirir experiência sobre a operação da caldeira, a fuligem é soprada **uma vez por dia**. Com mais experiência, procedimentos mais detalhados podem ser desenvolvidos.

Durante a sopragem, é importante acompanhar a operação da caldeira, pois pode causar mudanças de temperatura na fornalha e no vapor. Uma inspeção pela casa da caldeira durante a sopragem é uma boa forma de verificar vazamentos nos sopradores e na tubulação, e de confirmar que os sopradores funcionam normalmente (ruído, retorno ao limite, consumo de vapor).

> **AVISO!** Não se aproximar muito do soprador de fuligem em operação — há risco de vazamento de vapor.

## Notas
Fragmento derivado do Capítulo 5, seções 5.11 e 5.11.1, do Manual de Operação da Caldeira de Força.
