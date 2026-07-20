---
id: cf_troubleshooting_falha_energia
setor: caldeira_de_forca
categoria: troubleshooting
equipamento_foco: geral
tags: [falha_energia, estado_seguro, fail_safe, energia_emergencia, restart]
---

## Resolução de Problemas — Falha de Energia: Comportamento Fail-Safe por Sistema

Este fragmento descreve o **estado de falha segura (fail-safe)** de cada subsistema da Caldeira de Força durante uma **falha geral de energia**.

* **Sistema de Combustível Auxiliar:** válvulas de desligamento de segurança do queimador se fecham; válvulas de desligamento de incêndio se fecham; o sistema de aquecimento tem proteção de energia de emergência e permanece **LIGADO**.
* **Sistema de Água de Alimentação:** a bomba de água de alimentação desliga.
* **Sistema de Água-Vapor da Caldeira:** conectadas ao sistema de energia de emergência — válvula de desligamento de vapor principal, válvula de purga contínua, válvula de aquecimento de vapor principal (desvio), válvula de desligamento da linha de partida, válvula de desligamento do vapor de sopragem de fuligem. Fecham diante de falha: válvula de controle da linha de partida e válvula de controle do vapor de sopragem de fuligem.
* **Sistema de Ar:** ventiladores de ar primário e de ar overfire param; dampers automáticos de ar de combustão **abrem** mediante perda de pressão do ar de instrumento; válvulas de controle de temperatura do ar primário e overfire se fecham.
* **Sistema do Gás de Combustão:** ventilador de gás de combustão e ventilador de gás de recirculação param.
* **Sistema de Limpeza do Gás de Combustão:** o ESP desliga.
* **Sistema de Material do Leito:** roscas de alimentação param.
* **Sistema de Sopragem de Fuligem:** a sequência para; porém os alimentadores Ímpares e Pares têm energia de emergência protegida e **movem o soprador de volta ao limite inicial** (mesmo que esteja dentro da caldeira).
* **Sistema de Purga:** válvula de controle de temperatura de drenagem do tanque de purga se fecha.
* **Sistema de Condensado:** a bomba de condensado, se em execução, para.
* **Sistemas de Combustível Sólido e Cinza:** todos os transportadores desligam; válvulas de controle de água de resfriamento das roscas de cinza do fundo (1, 2, 3) e da rosca de cinza do banco da caldeira de 2ª passagem se fecham; o filtro do silo de cinza, se em funcionamento, para.
* **Sistema de Produto Químico:** a bomba, se em funcionamento, para.

> Após uma falha de energia, a planta é reiniciada de acordo com a **partida normal** (ver fragmentos da série `Caldeira_Partida_*`).

## Notas
Fragmento derivado do Capítulo 7, seção 7.2.4, do Manual de Operação da Caldeira de Força. Este é o último fragmento do Capítulo 7 (Resolução de Problemas).
