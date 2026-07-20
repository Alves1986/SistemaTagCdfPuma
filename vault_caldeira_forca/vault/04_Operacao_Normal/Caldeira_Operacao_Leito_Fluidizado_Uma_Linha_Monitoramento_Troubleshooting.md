---
id: cf_operacao_leito_fluidizado_uma_linha_monitoramento_troubleshooting
setor: caldeira_de_forca
categoria: operacao
equipamento_foco: leito_fluidizado
tags: [leito_fluidizado, uma_linha_alimentacao, altura_leito, remocao_cinzas, troubleshooting, oxigenio, co]
---

## Operação Normal — Leito Fluidizado: Operação com Uma Linha, Monitoramento, Remoção de Cinzas e Diagnóstico

### Combustão com Apenas Uma Linha de Alimentação de Combustível

Em caso de problema em uma das linhas, operar com apenas uma linha é possível, observando-se:

* A linha remanescente aumenta as rotações imediatamente para uniformizar a quantidade de combustível. **Recomenda-se limitar a carga da caldeira a no máximo 70%** com apenas uma linha.
* Aumentar o **coeficiente total de ar** acima do normal (nível de O2 acima do normal) para garantir mistura suficiente e evitar formação de incombustíveis:
  * Aumentar o fator de O2 na tela do DCS.
  * Alterar o controle de O2 do gás de combustão para acompanhar o **valor mínimo** entre as medições **37224-AI-5404** e **37224-AI-5405**.
* Aumentar ar secundário e terciário no lado operacional: mudar a proporção do lado dianteiro do ar secundário inferior/superior e do ar terciário para **1,3** (se apenas a linha 1 operar) ou **0,7** (se apenas a linha 2 operar).
* Elevar a proporção de ar de fluidização/combustão (ex.: de 1,0 para 1,1) até nível suficiente para fluidizar todo o leito.
* Verificar pelos visores se **ambos os lados** do leito estão fluidizados.
* Atenção redobrada à estabilidade das temperaturas: uma **queda súbita** (ex.: 830 °C → 680 °C) indica problema de fluidização e ar de fluidização insuficiente, podendo formar uma pilha de combustível no lado frio — evitar com ar de fluidização suficiente.
* Se necessário, acender o queimador de partida e tentar corrigir/restabelecer a linha de alimentação.

### Monitoramento da Condição do Leito Fluidizado

Formas de monitorar:
* Observação visual pelos visores de vidro da fornalha.
* Cálculo da altura do leito no DCS (medições de pressão).
* Medições de temperatura do leito (12 unidades).
* Quantidade de material grosso removido na remoção de cinza do fundo.

* **Altura do leito (37224-LI-5335):** calculada no DCS pela diferença de pressão entre o leito e a fornalha. **Recomendada em condições estáticas: 40-60 cm** acima do bocal de ar de fluidização. Baixa → adicionar material do leito; muito alta → remover via sequência de cinza do fundo.
* Regra de referência: **10 cm de areia BFB (densidade 1500 kg/m³) ≈ 1,5 kPa** de queda de pressão (ex.: altura estática de 50 cm ≈ 7,5 kPa; leitura do manômetro com fluxo normal de fluidização ≈ 9,5-11 kPa). **Altura estática do leito varia ~0,45-0,55 m.** Queda de pressão sobre leito+grelha: tipicamente **8-12,5 kPa**.
* Monitorar a altura do leito é importante porque desvios podem causar: **alto teor de CO** mesmo com O2 normal; leito engrossando mais rápido que o normal; e, no pior caso, **danos aos bocais de ar de fluidização**.

### Remoção de Cinzas (do Leito)

A cinza da combustão de madeira é bem moída no leito e removida como cinza da caldeira; pedras e materiais grossos demais para fluidização permanecem no fundo da grelha — daí a necessidade de remoção pelo fundo.

* Mais material grosso no leito → mais demanda de ar de fluidização → uso excessivo de ar total. Evitável com remoção regular pelas calhas de cinza do fundo.
* Diferenças de temperatura **> 50 °C** entre pontos, com fluxo de ar normal, indicam fluidização insuficiente e acúmulo de material grosso no ponto mais frio.
* Recomenda-se remoção de cinza do fundo **controlada por sequência**. Ao remover material grosso, material fino também escapa — por isso é necessário alimentar mais areia de make-up. O consumo de material fresco é reduzido reciclando a cinza do fundo: ela é peneirada, o material fino retorna pneumaticamente à fornalha, e o material grosso vai ao recipiente de cinza do fundo.

### Combustão em Leito Fluidizado Livre de Problemas

**Características de sucesso:**
* Fluxo de combustível sólido estável.
* Material do leito adequado para fluidização.
* Fluxo de ar de fluidização correto.
* Nível do leito correto (**45-55 cm**).
* Temperaturas em diferentes partes do leito na faixa de **750-900 °C**, sem diferenças significativas.
* Capacidade de vapor controlada pela alteração do fluxo de combustível sólido.
* Teor de O2 estável; teor de CO baixo.
* Pressão da fornalha estável.

**Falhas típicas e correções:**

| Sintoma | Ação de Correção |
|---|---|
| Pressão da fornalha e teor de O2 variam significativamente | Verificar problemas na alimentação de combustível |
| Grande diferença de O2 entre lados esquerdo/direito | Verificar desbalanceamento da alimentação |
| Fluidização irregular, diferenças de temperatura > 100 °C | Remover material grosso do leito; verificar fluxo de gás de fluidização |
| Temperatura do leito baixa | Combustível de má qualidade ou fluxo de combustível insuficiente |
| Temperatura do leito muito alta | Densidade aparente, tamanho de partícula ou valor calorífico do combustível muito altos |

## Notas
Fragmento derivado do Capítulo 5, seções 5.17.6, 5.17.7, 5.17.8 e 5.17.9, do Manual de Operação da Caldeira de Força. Último fragmento da série "Controle de Leito Fluidizado" — ver também `Caldeira_Operacao_Leito_Fluidizado_Fundamentos_Temperatura`.
