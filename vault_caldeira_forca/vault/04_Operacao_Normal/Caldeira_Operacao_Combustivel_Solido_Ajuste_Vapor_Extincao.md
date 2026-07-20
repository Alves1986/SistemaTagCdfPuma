---
id: cf_operacao_combustivel_solido_ajuste_vapor_extincao
setor: caldeira_de_forca
categoria: operacao
equipamento_foco: rosca_alimentacao_combustivel
tags: [ajuste_alimentacao, temperatura_leito, desbalanceamento, vapor_extincao]
---

## Operação Normal — Sistema de Alimentação de Combustível Sólido: Ajuste e Vapor de Extinção

### Ajuste do Sistema de Alimentação de Combustível

* Diferenças entre temperaturas do leito do lado **esquerdo e direito** podem indicar alimentação desigual entre as **linhas 1 e 2**. Ajustável pelo multiplicador de correlação (**0,5…1,5**).
* Diferenças entre temperaturas do leito da **parede dianteira e traseira** podem indicar alimentação desigual entre as roscas da mesma linha. A capacidade de cada rosca de alimentação (1 a 6) pode ser multiplicada por um fator (**0,8…1,2**) selecionado pelo operador.
* Diferenças de temperatura do leito também podem indicar **má qualidade do leito**.
* O operador pode ajustar o equilíbrio de alimentação no DCS: taxa de velocidade da rosca recuperadora de silo multiplicável por fator (**0,7…1,5**); taxa de velocidade da rosca de transporte multiplicável por fator (**1,0…1,3**).

A capacidade de alimentação de combustível sólido é controlada pelo **controlador principal de pressão do vapor** ou pelo **controlador de carga**. O SP de velocidade das roscas de alimentação é calculado com base na saída do controlador e no efeito do combustível predominante.

> **NOTA!** O combustível sólido no silo da caldeira deve atender aos requisitos de qualidade definidos nos dados de projeto, e a mistura deve ser **homogênea**.

> Consultar também a Descrição do Processo do Sistema de Combustível Sólido.

### Vapor de Extinção

O sistema de alimentação de combustível sólido é equipado com conexões de **vapor de extinção de incêndio** (vapor de baixa pressão). Normalmente, a válvula manual **37225-V-6368** é mantida **aberta** e as válvulas do equipamento ficam **fechadas**.

## Notas
Fragmento derivado do Capítulo 5, seções 5.16.1 e 5.16.2, do Manual de Operação da Caldeira de Força.
