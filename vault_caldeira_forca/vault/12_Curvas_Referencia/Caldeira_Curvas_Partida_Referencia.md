---
id: cf_curvas_partida_referencia
setor: caldeira_de_forca
categoria: referencia
equipamento_foco: geral
tags: [curvas_partida, partida_fria, partida_quente, tubulao, revestimento]
---

## Curvas de Partida da Caldeira de Força

As **curvas de partida** constituem a principal instrução para a **velocidade de partida** da caldeira. Devem ser seguidas rigorosamente para evitar danos, por exemplo, ao **tubulão de vapor** e ao **revestimento (refratário)**.

O manual original apresenta três curvas gráficas (Figuras 18, 19 e 20), referentes à unidade **Klabin Puma II**, cada uma plotando ao longo do tempo de partida (eixo horizontal, em minutos): temperatura do leito (BedTemp), temperatura do tubulão (DrumTemp), temperatura do vapor (SteamTemp), potência do combustível (FuelPower), pressão do tubulão (DrumPress) e fluxo de vapor (Steam Flow) — eixos verticais em °C (temperaturas) e MJ/s, bar(a), t/h (potência/pressão/fluxo). As curvas também marcam os eventos "queimador de partida desligado", "combustível sólido ligado", "tubulão com pressão total" e "tanque de água de alimentação em temperatura normal".

### Curva de Partida a Fria (13.1.1)

**Figura 18** — aplicável quando o tempo desde o último desligamento é **superior a 24 horas**.

### Curva de Partida a Quente (13.1.2)

**Figura 19** — aplicável quando o tempo desde o último desligamento está entre **2 e 24 horas**.

### Curva de Arranque a Quente (13.1.3)

**Figura 20** — aplicável quando o tempo desde o último desligamento é **inferior a 2 horas**.

> **NOTA!** As curvas originais são gráficos (não tabelas de dados numéricos); os valores exatos plotados devem ser consultados diretamente no PDF fonte (Manual de Operação da Caldeira de Força, Capítulo 13, páginas 201-202) ou no sistema DCS, que segue esses perfis automaticamente durante a partida. Este fragmento não reproduz valores numéricos específicos das curvas para evitar informação não verificável a partir do texto extraído.

## Notas
Fragmento derivado do Capítulo 13 (seções 13.1.1, 13.1.2 e 13.1.3), do Manual de Operação da Caldeira de Força — último fragmento/capítulo do documento. Relaciona-se com `Caldeira_Partida_Agua_Vapor_Caldeira` e `Caldeira_Partida_Combustivel_Auxiliar_Queimadores`.
