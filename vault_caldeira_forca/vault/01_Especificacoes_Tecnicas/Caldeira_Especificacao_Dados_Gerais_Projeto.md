---
id: cf_dados_gerais_projeto
setor: caldeira_de_forca
categoria: especificacao_tecnica
equipamento_foco: geral
tags: [dados_projeto, condicoes_locais, capacidade, pressao_vapor, temperatura_vapor, agua_alimentacao, klabin, puma_ii]
---

## Dados de Projeto e Desempenho — Visão Geral e Parâmetros Gerais

Esta descrição de processo pertence à **Caldeira de Força** (Klabin Puma II, Ortigueira-PR) e apresenta o projeto da caldeira e os dados de desempenho. Informações detalhadas de sistema estão nos P&ID's; informações de equipamento nas listas de equipamentos e manuais dos fabricantes; e o nível mais detalhado de automação (loops, sequências, lógicas, proteções e intertravamentos) está no **Plano Funcional (FUPs)**.

### Abreviaturas Usadas no Capítulo de Dados de Projeto

* **DCS** — Sistema de Controle Distribuído.
* **REM** — modo em que o ponto de ajuste é calculado no DCS ou vem do controle em cascata.
* **Auto** — modo automático; o operador ajusta o ponto de ajuste (sequências: DCS inicia sozinho; equipamento: DCS pode iniciar/parar sozinho).
* **Manual** — controlador desligado; apenas o operador ajusta a saída/inicia a sequência/equipamento.
* **PV** — medição do controlador. **SP** — ponto de ajuste do controlador.
* **SIS** — Sistema Instrumentado de Segurança. **SRS** — Sistema Relacionado à Segurança (ex.: proteção da caldeira).
* **Intertravamento** — método de prevenção de estados indesejados em uma máquina (dispositivo/sistema elétrico, eletrônico ou mecânico), por exemplo para impedir a partida.
* **Proteção** — ato ou estado de proteção que altera o estado da máquina (ex.: acionamento).
* **FR** — Restante de Falha (travado na posição). **FI** — Falha Indeterminada. **FC** — Falha de Fechamento. **FO** — Falha de Abertura.
* **FUD** — Descrição Funcional. **FUP** — Plano Funcional. **VFD** — Comando de frequência variável.
* **a.r.** — "conforme recebido"; usado para o valor de aquecimento inferior do combustível (LHV).

### Condições do Local

| Parâmetro | Unidade | Valor |
|---|---|---|
| Localização da Fábrica | — | Estado do Paraná, Ortigueira, Brasil |
| Elevação acima do nível do mar | m | **773** |
| Temperatura ambiente média (máxima), verão | °C | 25,9 (34,5) |
| Temperatura ambiente média (mínima), inverno | °C | 13,4 |
| Temperatura ambiente média anual | °C | 18,6 |
| Umidade relativa do ar ambiente, média anual a 18,4°C | % | 79 |
| Teor de umidade do ar (RH 79% a 18,4°C) | gw/kgdry | 10,6 |
| Queda de chuva, volume máximo de lagoa de águas pluviais (24h) | mm | 112,8 |

### Capacidade da Caldeira

| Parâmetro | Unidade | Valor |
|---|---|---|
| Classificação contínua máxima 100% (MCR) com combustível de garantia (LP1-Caso1) | kg/s | **61,1** |
| idem | t/h | **220** |
| Carga mínima, 30% do MCR com mistura de combustível projetada | kg/s | 18,3 |
| idem | t/h | 66 |

### Pressão e Temperatura do Vapor Principal

* Pressão do vapor principal na saída da caldeira: **103 bar(g)**.
* Temperatura do vapor principal na saída da caldeira na carga MCR: **503,3 °C**.
* Faixa de controle da temperatura de vapor principal com queima de mistura de combustível do projeto: 60-100%.

### Água de Alimentação

O tanque de água de alimentação é comum para RB (Caldeira de Recuperação) e PB (Caldeira de Força). Pressão de operação: **~2,6 bar(g)**, temperatura correspondente **140°C**. Pressão de projeto: **5,0 bar(g)**.

Água de alimentação na entrada da caldeira (carga 100% MCR):

| Parâmetro | Unidade | Valor |
|---|---|---|
| Temperatura da água de alimentação antes do pré-aquecedor de água de alimentação | °C | 140 |
| Temperatura da água de alimentação na entrada do economizador | °C | 160 |
| Temperatura da água de alimentação na entrada do economizador — faixa | °C | 140-160 |

## Notas
Fragmento derivado do Capítulo 2 (seções 2.1 a 2.6) do Manual de Operação da Caldeira de Força. Para especificação de combustíveis, ver `Caldeira_Especificacao_Combustiveis`. Para parâmetros de desempenho por caso de carga (LP1-LP5), ver os fragmentos da série `Caldeira_Desempenho_*`.
