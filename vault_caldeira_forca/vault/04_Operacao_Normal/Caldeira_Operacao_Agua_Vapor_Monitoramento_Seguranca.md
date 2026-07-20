---
id: cf_operacao_agua_vapor_monitoramento_seguranca
setor: caldeira_de_forca
categoria: operacao
equipamento_foco: superaquecedores
tags: [monitoramento_diario, valvula_seguranca, purga_continua, temperatura_vapor, temperatura_material]
---

## Operação Normal — Sistema de Água e Vapor da Caldeira: Monitoramento Diário e Verificações de Segurança

### Monitoramento Diário

* Observar as medições no sistema de vapor e água da caldeira, **especialmente a temperatura e pressão do vapor vivo**.
* A válvula motorizada de purga da caldeira **35228-HV-1491** abre automaticamente se o nível do tubulão estiver alto.
* Ajustar a abertura da válvula de purga contínua **35228-HV-1499**. Normalmente, o **fluxo contínuo de purga é 1% do fluxo de vapor da caldeira**; a vazão adequada depende da qualidade da água de alimentação, ajustada conforme análises de água e experiência operacional.

> Consultar a Descrição do Processo "Sistema de Vapor e Água de Alimentação" para mais detalhes.

### Verificação do Equipamento de Segurança da Caldeira

Itens a verificar regularmente, no mínimo:
* Medidores de nível locais do tubulão — verificar **a cada turno de trabalho**, comparando entre si e com o DCS.
* Válvulas de segurança da caldeira operacionais — **não devem ser travadas no lugar**.
* Medições de pressão do tubulão e da tubulação de vapor principal — verificar corretude **pelo menos uma vez por ano** (verificação de ponto zero), comparando com outros medidores do mesmo sistema.

### Monitoramento da Temperatura do Vapor Superaquecido

Em operação normal, os controles principais de temperatura **37221-TIC-5098** e **37221-TIC-5099** estão em modo **REMOTO**, com ponto de ajuste obtido de uma curva em função do fluxo de vapor principal. Durante operação em temperatura especial (ex.: 475 °C), o controle vai para modo **AUTO** e o Operador fornece o SP diretamente.

### Monitoramento da Temperatura do Material do Superaquecedor

As temperaturas do material do superaquecedor são mostradas em tela "pop-up" dedicada do DCS (Figura 5 do documento original).

## Notas
Fragmento derivado do Capítulo 5, seções 5.10.1, 5.10.2, 5.10.3 e 5.10.4, do Manual de Operação da Caldeira de Força.
