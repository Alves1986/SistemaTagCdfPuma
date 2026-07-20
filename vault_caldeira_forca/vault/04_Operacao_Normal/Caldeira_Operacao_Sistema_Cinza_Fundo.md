---
id: cf_operacao_sistema_cinza_fundo
setor: caldeira_de_forca
categoria: operacao
equipamento_foco: sistema_cinza_fundo
tags: [cinza_fundo, configuracoes_dcs, peneira, sequencia, entupimento]
---

## Operação Normal — Sistema de Cinza do Fundo: Configurações DCS e Monitoramento

### Tabela 9 — Configurações do DCS no Sistema de Cinza do Fundo

| Ponto | Instrução |
|---|---|
| "Iniciar sequência" | Ciclo de partida (**1…60 min**) para a sequência |
| "Peneira usando permissão" | Liga/desliga o uso da peneira na sequência |
| "Linha 1/2/3 selecionada" | Permite ignorar a respectiva rosca de cinza do fundo na sequência |
| Ponto de ajuste de velocidade da rosca 1/2/3 | **0…100%** para cada rosca de cinza do fundo |
| Ponto de ajuste de velocidade do transportador de arraste | **0…100%** |
| "Ponto de ajuste para peneira em uso" | Número de sequências (**1…10**) quando a peneira é usada |
| "Ponto de ajuste para peneira fora de uso" | Número de sequências (**1…10**) quando a peneira não é usada |
| "Contador para uso/fora de uso da peneira" | Contadores (**1…10**) |
| Tempo de execução da rosca de cinza do fundo 1/2/3 | **10…300 s** em sequência |
| "Tempo de esvaziamento" | **10…180 s** para o transportador de arraste de cinza do fundo **37223-M-5194** |
| "Contadores" | Nº de remoções de cinza do fundo (reajustável); do dia atual; dos últimos 7 dias (dia a dia) |

### Monitoramento do Sistema de Cinza do Fundo

* Verificar se o sistema de remoção está em operação (sequência em execução o tempo todo). Normalmente, os **três transportadores** são selecionados na sequência.
* O volume necessário depende da qualidade do combustível sólido e da carga da caldeira — ajustado pela experiência operacional.
* Acompanhar a **altura do leito**; os tempos da sequência de remoção são ajustados junto com a alimentação de material do leito. Se necessário, corrigir o SP de peneira em uso/fora de uso.
  > **NOTA!** A perda de peneira (eficiência não é 100%) também afeta a altura do leito.
* A **temperatura nas calhas de cinza do fundo aumenta durante o esvaziamento** — se isso não ocorrer, é indicação de **entupimento**.

> Consultar também a Descrição do Processo do Sistema de Cinza do Fundo.

## Notas
Fragmento derivado do Capítulo 5, seções 5.19 e 5.19.1, do Manual de Operação da Caldeira de Força.
