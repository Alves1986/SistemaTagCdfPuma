---
id: cf_especificacao_combustiveis
setor: caldeira_de_forca
categoria: especificacao_tecnica
equipamento_foco: sistema_combustivel
tags: [combustivel, biomassa, casca, eucalipto, pinus, oleo_combustivel, granulometria, poder_calorifico]
---

## Especificação de Combustíveis da Caldeira de Força

A caldeira é projetada para queimar **resíduos de casca e madeira** (biomassa) para produzir vapor para a usina.

### Características do Combustível Sólido por Caso

| Parâmetro | Unidade | Eucalipto – Caso 1 (Casca) | Eucalipto – Caso 1 (Refugo madeira) | Pinus – Caso 2 (Casca) | Pinus – Caso 2 (Refugo madeira) | Mistura Euc.-Pinus Caso 3 (Casca) | Mistura Euc.-Pinus Caso 3 (Refugo madeira) |
|---|---|---|---|---|---|---|---|
| Distribuição (fluxo de massa úmido) | % | 19 | 81 | 54 | 46 | 29 | 71 |
| Valor de aquecimento superior (HHV) | MJ/kg | 19,5 | 16,1 | 20,5 | 20,9 | 19,6 | 16,7 |
| Valor de aquecimento inferior (LHV) | MJ/kg | 18,2 | 15,0 | 19,1 | 19,7 | 18,3 | 15,6 |
| Teor de umidade, H2O | %-w | 50 | 56,2 | 55 | 55 | 51,5 | 55,8 |
| Teor de cinza no combustível | %-w DS | 1,3 | 9,6 | 0,6 | 3,2 | 0,9 | 9,6 |
| Carbono (C) | %-w DS | 48,6 | 42 | 49,9 | 52 | 49,3 | 43,9 |
| Hidrogênio (H) | %-w DS | 5,96 | 5,3 | 6,29 | 5,69 | 6,1 | 5,4 |
| Oxigênio (O) | %-w DS | 43,8 | 42,46 | 42,87 | 38,47 | 43,36 | 40,46 |

* Valor de aquecimento inferior da mistura de combustível (LHV, a.r.): Caso 1 = **5,7 MJ/kg**; Caso 2 = **7,4 MJ/kg**; Caso 3 = **6,1 MJ/kg**.
* Faixa de umidade (mistura): **46,5% – 60,0%**.
* Enxofre (S): **< 0,1 %-w DS** (todos os casos). Cloro (Cl): **máximo 0,09 %-w DS**.
* Nitrogênio (N): 0,2–0,5 %-w DS conforme o caso.

### Composição da Cinza do Combustível (%)

| Componente | Euc. Casca | Euc. Refugo | Pinus Casca | Pinus Refugo | Mistura Casca | Mistura Refugo |
|---|---|---|---|---|---|---|
| Al2O3 | 2,6 | 3,7 | 3,6 | 11,4 | 2,68 | 4,62 |
| CaO | 45 | 51 | 32 | 12,1 | 43,96 | 46,3 |
| Fe2O3 | 2,5 | 1,8 | 3 | 2,8 | 2,54 | 1,92 |
| P2O5 | 3,7 | 1,1 | 4,4 | 2 | 3,75 | 1,13 |
| MgO | 4 | 3,5 | 9,9 | 4,8 | 4,47 | 3,65 |
| MnO | 1,1 | 0,94 | 3,9 | 0,6 | 1,32 | 0,9 |
| K2O | 19 | 10,9 | 27 | 19,3 | 19,6 | 11,9 |
| Na2O | 1,7 | 0,5 | 0,9 | 0,18 | 1,64 | 0,46 |
| SiO2 | 7 | 20 | 9 | 39 | 7,16 | 22,3 |

### Variação Permitida nas Propriedades do Combustível

Faixa permitida (analisada em amostra única de combustível):

| Propriedade | Unidade | Valor |
|---|---|---|
| Faixa de umidade | %-w(wb) | 45-60 |
| Valor de aquecimento inferior (LHV) | MJ/kg(ar) | 5,5-9,6 |
| Enxofre (S) | %-w(db) | **≤ 0,1** |
| Nitrogênio (N) | %-w(db) | **≤ 0,5** |
| Cloro (Cl) | %-w(db) | **≤ 0,09** |
| Cinza com impurezas | %-w(db) | **≤ 8** |
| Sódio (Na) + Potássio (K) | mg/kg(db) | ≤ 5.000 |
| Na2O+K2O da cinza | %-w(db) | ≤ 20 |

> **NOTA!** Ver diagrama de queima para capacidade total (fragmento `Caldeira_Desempenho_Consumo_Diagrama_Queima`).

Densidade aparente de projeto do combustível: **160 kg/m³ @ 60% de teor de umidade** (usada para os transportadores de combustível).

### Tamanho de Partícula do Combustível

O tamanho da partícula (P) deve estar de acordo com:
* **3 mm < P < 100 mm** → mais de **65% do peso**.
* **P < 3 mm** → menos de **30% do peso**.

Requisito adicional de comprimento das partículas:
* **> 100 mm e < 350 mm** → menos de **15% do peso**.
* **> 350 mm e < 650 mm** → menos de **7% do peso**.

> **AVISO!** Partículas de casca longa podem causar entupimentos nas roscas e nas linhas de alimentação de combustível.

### Combustível Auxiliar

Usado apenas como combustível de partida: **óleo combustível pesado** e **óleo combustível leve**.

**Óleo combustível pesado:**
| Parâmetro | Unidade | Valor |
|---|---|---|
| Tipo | — | Óleo combustível 1B |
| Temperatura do óleo | °C | **130** |
| Pressão do óleo | bar(g) | **10** |
| Viscosidade | cSt | abaixo de 20 |

**Óleo combustível leve:** Tipo = Óleo diesel.

## Notas
Fragmento derivado do Capítulo 2 (seção 2.7 e subseções) do Manual de Operação da Caldeira de Força.
