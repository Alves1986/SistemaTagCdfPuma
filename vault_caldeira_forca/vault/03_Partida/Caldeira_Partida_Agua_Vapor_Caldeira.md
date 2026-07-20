---
id: cf_partida_agua_vapor_caldeira
setor: caldeira_de_forca
categoria: partida
equipamento_foco: tubulao_superaquecedor
tags: [tubulao, nivel_tubulao, superaquecedor, valvula_partida, curva_partida, tanque_purga]
---

## Partida: Sistema de Água e Vapor da Caldeira

Quando o controle de fluxo de água de alimentação **37221-FIC-5015** estiver em operação, o controlador de nível do tubulão **37221-LIC-5071** também está normalmente em operação (o controle de 3 pontos do nível do tubulão também pode ser usado durante a partida).

### Itens Importantes Durante a Partida

* Acompanhar as **curvas de partida da caldeira**; aumentar a pressão lentamente; acompanhar o aquecimento do leito; verificar a situação geral a cada meia hora. Monitorar a **expansão térmica** durante todo o aumento de pressão.
* Abrir a tubulação de partida: válvula de desligamento do motor **37221-HV-5145** e válvula de controle de partida **37221-PV-5146** (cerca de **10%**).
* Ao aquecer o leito e aumentar a pressão com os queimadores de partida, recomenda-se circular água com a válvula de nível do tubulão (purga) **35228-HV-1491**, para evitar fervura no economizador. Válvulas de drenagem manual da caldeira também podem ser abertas (uma a uma, ex. 1 min cada) — especialmente se houver problemas de qualidade de água.
  > **AVISO!** Não é recomendado abrir válvulas de drenagem manual quando a pressão da caldeira for **superior a 10 bar(g)**.
* Recomenda-se fluxo contínuo de água de alimentação de **~1-2 kg/s** pelos economizadores, para evitar ebulição e danos ao tubo.
  > **NOTA!** As linhas de ventilação manual e drenagem da água/vapor são conectadas ao **tanque de purga 35221-M-1101** pela tubulação de coleta de drenagem atmosférica.
  > **AVISO!** Evitar se aproximar do tanque de purga **35221-M-1101** durante a partida — em caso de problema, água quente pode vazar.
* Quando o aquecimento inicia, o condensado retido nos superaquecedores é evaporado pelos vents/drenos do superaquecedor. As válvulas de drenagem da linha principal de vapor também ficam levemente abertas para remover condensação.
* Verificar as **temperaturas do material do superaquecedor**. Se subir muito, reduzir a taxa de queima ou aumentar a circulação de vapor abrindo a válvula de partida **37221-PV-5146**.
* Verificar se os controladores de temperatura de vapor (**37221-TIC-5092 a 5099**, 8 controladores) estão em modo **REMOTO** quando a temperatura do vapor estiver próxima dos valores nominais.
* Abrir a válvula de partida **37221-PV-5146** no mínimo **30%** até atingir a carga mínima da caldeira (**45 t/h = 12,5 kg/s**).
* Fechar as válvulas de ventilação quando a pressão do tubulão atingir **2 bar(g)**.
* O gradiente de pressão/temperatura do tubulão pode ser controlado pela potência do queimador e/ou pela abertura da válvula de partida **37221-PV-5146**.
* Quando a pressão do vapor estiver **acima de 10 bar(g)**, fechar todas as válvulas de drenagem manual.

## Notas
Fragmento derivado do Capítulo 4, seção 4.10, do Manual de Operação da Caldeira de Força. Para colocar vapor na turbina, ver `Caldeira_Partida_Producao_Vapor_Turbina`.
