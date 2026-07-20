---
id: cf_operacao_taxa_carga_protecao_caldeira
setor: caldeira_de_forca
categoria: operacao
equipamento_foco: sistema_protecao_srs
tags: [taxa_mudanca_carga, protecao_caldeira, srs, desarme, first_out, intertravamento]
---

## Operação Normal — Taxa de Mudança de Carga e Proteção da Caldeira

### Taxa Máxima de Mudança de Carga

* Aumento entre **50% e 90% do MCR** (fluxo de vapor principal correspondente **30,6…55,0 kg/s**): no máximo aproximadamente **5% do MCR por minuto**. A rampa entre 30% e 50% é mais baixa, pois parte da energia do combustível é usada durante a mudança de carga para atingir as temperaturas nominais em diferentes partes da caldeira (ex.: superaquecedores).
* Taxa de redução entre **100% e 50% do TMCR**: **5% do MCR por minuto**.
* Após esse período, permitir que os controles do DCS estabilizem pressão e temperatura do vapor — aproximadamente **10 minutos**.

### Proteção da Caldeira

O sistema de proteção monitora os parâmetros críticos e coloca a caldeira em condição segura, acionando componentes durante mau funcionamento ou distúrbios. A função de desarme tem **três níveis**:

1. **Desarme dos ventiladores de ar**
2. **Desarme para queima de óleo**
3. **Desarme para alimentação de combustível sólido**

Funções adicionais da proteção da caldeira:
1. Monitoramento dos intertravamentos de purga.
2. Monitoramento da purga da fornalha (fluxo de ar e tempo).
3. Monitoramento do status da caldeira (fornalha purgada ou fogo estável na fornalha).

O **Sistema Relacionado à Segurança (SRS)** da caldeira é baseado na construção Andritz; informações mais precisas estão no **Plano Funcional do SRS (doc. nº 37220-A-DIT-00031-0001)**.

### Após um Desarme da Proteção da Caldeira

1. Descobrir o motivo que ativou o apagamento (**First-Out**) e resolver o problema.
2. Liberar a proteção pelo comando de reajuste na tela do DCS e nos componentes acionados pela partida.

**Documentos de referência para testes e O&M do SRS:**
* Instruções de teste periódico do Sistema Relacionado à Segurança.
* Plano de operação e manutenção do Sistema Relacionado à Segurança.
* Instruções de modificação do Sistema Relacionado à Segurança.

O equipamento SRS é identificado em P&ID pelo índice superior **"SRS"**, quando aplicável.

## Notas
Fragmento derivado do Capítulo 5, seções 5.4 e 5.5, do Manual de Operação da Caldeira de Força. Para a lógica detalhada dos três níveis de desarme, ver os fragmentos da categoria `intertravamento` (`Caldeira_Intertravamento_SRS1/2/3_*`).
