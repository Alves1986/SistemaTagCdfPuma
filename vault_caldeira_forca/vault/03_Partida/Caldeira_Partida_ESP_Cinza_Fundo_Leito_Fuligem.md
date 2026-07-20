---
id: cf_partida_esp_cinza_fundo_leito_fuligem
setor: caldeira_de_forca
categoria: partida
equipamento_foco: sistema_cinza_fundo
tags: [esp, cinza_fundo, material_leito, areia, soprador_fuligem, sequencia_automatica]
---

## Partida: Limpeza de Gás de Combustão (ESP), Cinza do Fundo, Material do Leito e Sopragem de Fuligem

### Sistema de Limpeza do Gás de Combustão (ESP)

Os gases de combustão fluem da caldeira sempre através do ESP para a chaminé. Precondições para a primeira partida do queimador:
* Sistema de aquecimento do ESP ligado por **24 horas** antes.
* Fornecimento de ar comprimido para o ESP correto.

Iniciar o ESP de acordo com as instruções do fabricante.

### Sistema de Cinza do Fundo

Recomenda-se iniciar a remoção de cinza do fundo **no mesmo dia** em que a combustão é iniciada, para evitar acúmulo de material grosso. A remoção é normalmente controlada por sequência automática **37223-KJ-5670**.

**Valores pré-selecionados (baseados em experiência):**

| Parâmetro | Faixa |
|---|---|
| Ciclo de inicialização | 1…60 min |
| Tempo de operação da rosca de cinza do fundo 1 | 10…300 seg |
| Tempo de operação da rosca de cinza do fundo 2 | 10…300 seg |
| Tempo de operação da rosca de cinza do fundo 3 | 10…300 seg |
| Tempo de operação de esvaziamento (transportador de arraste) | 10…180 seg |
| Peneira está no setpoint de uso | 1…10 |
| Peneira não está no setpoint de uso | 1…10 |

Parâmetros são ajustados posteriormente conforme: quantidade de material estranho (pedras, areia, metais) no combustível; carga da caldeira (30-100%); estado geral do leito (temperaturas); e análises de amostras de cinza do fundo.

> **NOTA!** Ao descarregar areia quente do leito, deixá-la esfriar suficientemente nos dutos e calhas antes de cair nas roscas/transportadores de corrente. **A temperatura da areia pode estar acima de 700 °C.**

Durante a operação, monitorar: temperaturas do leito e qualidade da cinza removida; reciclagem/temperatura da água de resfriamento (chaves de fluxo); e disponibilidade (não cheio) de um dos recipientes de cinza do fundo.

### Sistema de Material do Leito

O material do leito fresco é normalmente alimentado **periodicamente**. Taxa pré-selecionada: **areia 2…15 t/d**.

Após a seleção, iniciar a rosca do material do leito, mudar para modo **AUTO** e acompanhar a operação (também localmente). Em AUTO, a rosca opera conforme os tempos selecionados.

### Sistema de Sopragem de Fuligem

Iniciado com a sequência **37225-KJ-5198**, que executa todos os sopradores selecionados **em ordem numérica**.

* Selecionar o grupo de sopradores a usar — existem **3 grupos separados**; um 4º grupo inclui todos os sopradores.
* Iniciar a sequência no display DCS — primeiro aquece a tubulação do soprador; as válvulas motorizadas da linha de drenagem operam conforme a lógica.

## Notas
Fragmento derivado do Capítulo 4, seções 4.15, 4.16, 4.17 e 4.18, do Manual de Operação da Caldeira de Força.
