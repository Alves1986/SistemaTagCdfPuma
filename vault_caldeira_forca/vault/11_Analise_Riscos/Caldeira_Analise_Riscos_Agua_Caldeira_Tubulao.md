---
id: cf_analise_riscos_agua_caldeira_tubulao
setor: caldeira_de_forca
categoria: analise_riscos
equipamento_foco: tubulao
tags: [analise_riscos, nivel_tubulao, pressao_tubulao, valvula_seguranca, choque_termico, desligamento_emergencia]
---

## Instruções de Análise de Perigos e Riscos — Sistema de Água da Caldeira (Tubulão)

### Sem Fluxo de Água de Alimentação para o Tubulão (12.4.1)

**Consequências:** nível baixo de água no tubulão; superaquecimento de economizadores; vida útil reduzida da tubulação.

**Preparativos:** verificar tubulação/equipamento do tanque de água de alimentação até o tubulão (vazamentos, posição de válvulas manuais, funcionalidade); se não resolvido, diminuir a carga. **A caldeira desarmará por nível baixo no tubulão.** Corrigir no próximo desligamento.

### Nível de Água Muito Alto no Tubulão (12.4.2)

**Consequências:** possíveis danos ao superaquecedor, tubulação e turbina; vida útil da tubulação diminui.

**Preparativos:** diminuir a carga ao mínimo. Se o nível permanecer alto mesmo após o sistema de automação fechar a válvula de controle de água de alimentação **37221-FV-5015** e abrir a válvula de drenagem do tubulão **35228-HV-1491**: **desligar a caldeira** e localizar a origem da água.

> **NOTA!** As válvulas de drenagem manual **37221-V-5427** e **37221-V-5428** devem estar **abertas** durante operação normal. Se fechadas quando o sistema abrir a válvula de drenagem do tubulão, o nível **não consegue diminuir**.

### Nível de Água Muito Baixo no Tubulão (12.4.3)

**Consequências:** ausência de água no tubulão; dano ao tubo; dano ao tubulão.

**Preparativos:** diminuir a carga ao mínimo; verificar tubulação/equipamento (vazamentos, válvulas manuais, funcionalidade); **desligar a caldeira** se não resolvido durante a operação. **A caldeira desarmará por nível baixo.**

### Pressão do Tubulão Ultrapassa a Pressão Operacional Permitida (12.4.4)

**Consequências:** dano ao tubulão; danos à tubulação; possibilidade de **ferimento pessoal sério**.

**Preparativos:** diminuir a carga ao mínimo. A válvula de controle da linha de partida **37221-PV-5146** abre antes das válvulas de segurança.

**Sequência de abertura das válvulas de segurança:**
* 1ª válvula de segurança: abre quando a pressão após os superaquecedores atinge **110 bar(g)**.
* 2ª válvula de segurança: abre quando a pressão do tubulão atinge **125 bar(g)**.
* 3ª válvula de segurança: abre quando a pressão do tubulão atinge **126 bar(g)**.

> **ADVERTÊNCIA!** O SRS possui botão de desligamento de emergência que desarma a caldeira. **Se a pressão do tubulão atingir a pressão de projeto de 125 bar(g) e a válvula de segurança não funcionar**, ou a pressão não começar a cair, **o operador deve apertar o botão de Desligamento de Emergência**.

### Subpressão no Tubulão (12.4.5)

**Consequência:** dano ao tubulão e/ou acessórios.

**Preparativo:** os superaquecedores e especialmente as válvulas de duto do tubulão **37221-V-5370** e **37221-V-5371** devem ser abertas quando a pressão no tubulão for **inferior a 2 bar(g)**.

### Temperatura Muito Baixa da Água no Tubulão (12.4.6)

**Consequências:** dano ao tubulão; vida útil reduzida.

**Preparativos:** verificar se a temperatura está **acima de 20 °C**; desligar a caldeira se a temperatura mínima permitida for atingida.

### Flutuações Muito Rápidas de Temperatura no Tubulão (12.4.7)

**Consequências:** dano ao tubulão (**choque térmico**); vida útil reduzida.

**Preparativos:** observar os cálculos de gradiente de temperatura no DCS; se houver alarme, **estabilizar a carga**; se não ajudar, diminuir ao mínimo; **desligar a caldeira** se as flutuações continuarem e investigar a causa.

## Notas
Fragmento derivado do Capítulo 12, seções 12.4 (introdução), 12.4.1, 12.4.2, 12.4.3, 12.4.4, 12.4.5, 12.4.6 e 12.4.7, do Manual de Operação da Caldeira de Força. Para os riscos do condensador Dolezal, ver `Caldeira_Analise_Riscos_Dolezal`.
