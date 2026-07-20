---
id: cf_operacao_ar_gas_combustao_monitoramento_ajuste
setor: caldeira_de_forca
categoria: operacao
equipamento_foco: sistema_ar_gas_combustao
tags: [ajuste_ar, temperatura_leito, velocidade_fluidizacao, emissoes, co, nox, ventilador_gas_combustao, vibração]
---

## Operação Normal — Sistemas de Ar e Gás de Combustão: Monitoramento, Ajuste e Emissões

### Monitoramento e Ajuste do Sistema de Ar

* Acompanhar as medições de pressão e fluxo do ar primário.
* Acompanhar a temperatura do leito: **diferença normal entre medições: 30…50 °C**. Se a temperatura cair (alarme), tentar aumentar o fluxo de ar de fluidização — baixa temperatura do leito pode indicar problemas na combustão em leito fluidizado.
* **Correção de ar primário** (fator **0,7…1,3**) na tela do DCS multiplica a quantidade de gás de fluidização, afetando principalmente a temperatura do leito.
  * Se o fluxo de recirculação do gás de combustão for alto, diminuir o fator.
  * Monitorar a velocidade de fluidização — em alta carga, manter na faixa de **1,1…1,4 m/s**.
* **Correções de ar secundário** (inferior e superior, cada uma **-0,1…0,2**) — atuam principalmente sobre as emissões de **CO e NOx**. Proporção entre paredes dianteira/traseira do ar secundário inferior ajustável pela proporção do lado esquerdo (**0,7…1,3**).
* **Ar terciário:** proporção dianteira/traseira ajustável (0,7…1,3); quantidade ajustável na tela "Cálculo de controle de fluxo de ar" pela **correção de oxigênio (-1…1%)**. Se o teor de CO estiver alto, aumentar o valor.
* O operador seleciona o **teor de umidade do combustível sólido (40…55%)** na tela do DCS — influencia o fator de ar usado nos cálculos de ar secundário inferior/superior e terciário; maior umidade aumenta o fator de ar.
* Fluxo de recirculação de gás ajustável por **recirculação múltipla (0,5…1,0)**.
* O fluxo de ar de combustão baseia-se na carga da caldeira; a demanda estequiométrica é calculada conforme carga e combustível padrão.
* É fundamental acompanhar regularmente as **medições de emissão dos gases de combustão (CEMS)** para otimizar a operação.

> **NOTA!** Ao otimizar a combustão ajustando correções de cálculo do ar, usar sempre **pequenas alterações**. Acompanhar a situação e reverter ao valor original se necessário.

### Emissões da Caldeira

É possível afetar as emissões de **CO e NOx** com o sistema de ar da caldeira, usando fatores de correção do operador no DCS para alterar a divisão do ar de combustão. Diferentes cargas e qualidades de combustível sólido exigem divisões de ar diferentes para melhor queima.

* Ao mudar a divisão do ar: dar **pequenos passos, um de cada vez**; esperar e observar os efeitos antes da próxima alteração.
* Ao encontrar uma boa divisão de ar, **anotar os fatores de cálculo, o combustível sólido usado e a carga da caldeira**.

### Monitoramento do Ventilador de Gás de Combustão

O ventilador de gás de combustão mantém leve pressão negativa (**corrente ≈ -300…-100 Pa**) no topo da fornalha. Em operação normal, o controle de velocidade de rotação mantém a corrente no valor de projeto conforme o SP do DCS.

* Monitorar pressões e temperaturas da fornalha.
* Monitorar temperaturas e diferenças de pressão nas passagens do gás de combustão.
* Monitorar o teor de oxigênio.
* Monitorar o fluxo e a temperatura do gás de recirculação para a caixa de ar.

### Monitoramento de Ventiladores em Execução

* Verificar óleo/lubrificação, resfriamento e estanqueidade.
* Monitoramento manual de vibrações e temperaturas superficiais dos mancais.
* Acompanhar temperaturas dos mancais e vibrações do ventilador.
* Ouvir som e vibrações incomuns.
* Certificar-se de que os mancais estejam devidamente lubrificados.

## Notas
Fragmento derivado do Capítulo 5, seções 5.15.1, 5.15.2, 5.15.3 e 5.15.4, do Manual de Operação da Caldeira de Força. Último fragmento da série "Sistemas de Ar e Gás de Combustão" (ver também `Caldeira_Operacao_Ar_Gas_Combustao_Loops_Controle`).
