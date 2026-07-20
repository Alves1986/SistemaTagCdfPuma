---
id: cf_analise_riscos_temperatura_pressao_vapor
setor: caldeira_de_forca
categoria: analise_riscos
equipamento_foco: superaquecedores
tags: [analise_riscos, temperatura_vapor, pressao_vapor, valvula_seguranca, desligamento_emergencia]
---

## Instruções de Análise de Perigos e Riscos — Sistema de Vapor: Temperatura e Pressão

### Temperatura Muito Alta do Vapor (12.5.1)

**Consequências:** danos à tubulação; vida útil reduzida.

**Preparativos:**
* Se as temperaturas do material do superaquecedor subirem acima do limite de alarme: **diminuir a carga de combustível** ou **aumentar o fluxo de vapor** através dos superaquecedores abrindo a válvula de partida.
* Se a temperatura do vapor superaquecido subir acima do limite: verificar tubulação/equipamento de dessuperaquecimento, e a tubulação de vapor do tubulão até a linha principal.
* Observar os cálculos de gradiente de temperatura do vapor vivo no DCS: se alarmar, **estabilizar a carga**; se não ajudar, **diminuir ao mínimo**; **desligar a caldeira** se as flutuações continuarem e investigar a causa.

### Pressão Muito Alta do Vapor (12.5.2)

**Consequência:** danos ao superaquecedor/tubulação.

**Preparativos:**
* Diminuir a carga ao mínimo. Observar o gradiente de pressão de vapor vivo no DCS; se alarmar, estabilizar a carga.
* Se a pressão não diminuir, **desligar a caldeira antes que as válvulas de segurança abram**.
* A válvula de controle da linha de partida **37221-PV-5146** abre antes das válvulas de segurança.

**Sequência de abertura das válvulas de segurança:**
* 1ª válvula: **110 bar(g)** (pressão após os superaquecedores).
* 2ª válvula: **125 bar(g)** (pressão do tubulão).
* 3ª válvula: **126 bar(g)** (pressão do tubulão).

> **AVISO!** O SRS possui botão de desligamento de emergência. **Se a pressão atingir a pressão de projeto de 125 bar(g) e a válvula de segurança não funcionar**, ou a pressão na linha principal não começar a cair, **o operador deve apertar o botão de Desligamento de Emergência**.

## Notas
Fragmento derivado do Capítulo 12, seções 12.5 (introdução), 12.5.1 e 12.5.2, do Manual de Operação da Caldeira de Força. Os limiares de pressão das válvulas de segurança (110/125/126 bar(g)) coincidem com os descritos em `Caldeira_Analise_Riscos_Agua_Caldeira_Tubulao` (12.4.4), pois ambas as seções tratam da mesma proteção física.
