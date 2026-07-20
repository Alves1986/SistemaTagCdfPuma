---
id: cf_partida_agua_alimentacao
setor: caldeira_de_forca
categoria: partida
equipamento_foco: bomba_agua_alimentacao
tags: [agua_alimentacao, bomba_alimentacao, partida, mudanca_automatica_bomba, valvula_circulacao_minima]
---

## Partida: Sistema de Alimentação de Água

As tubulações de água de alimentação e a caldeira são cheias na fase de pré-partida (ver `Caldeira_Preparativos_Agua_Alimentacao_Enchimento`). Na partida da caldeira, verificar se as bombas de água de alimentação estão operacionais e a água disponível. As bombas partem conforme instruções do fabricante.

### Checklist de Partida da Bomba

* Verificar o nível de óleo dos mancais da bomba.
* Abrir válvulas manuais no lado da sucção; encher a bomba com água de alimentação; deixar aquecer uniformemente e remover o ar do sistema.
* Válvulas manuais da linha de circulação mínima **35221-V-1557** e **35221-V-1555**: **abertas**.
  > **NOTA!** O fechamento da válvula de circulação mínima **destruirá a bomba imediatamente**. Sempre manter essas válvulas abertas durante a operação.
* Válvulas manuais nas linhas de drenagem: **fechadas**.
* Válvulas de desligamento de medição de pressão: **abertas**.
* Água de resfriamento disponível e válvulas de desligamento da linha abertas (conferir instruções do fabricante da bomba).
* Monitorar a partida da bomba: velocidade mínima definida pelo fabricante deve ser alcançada rapidamente. **Ruídos altos ou vibração anormal → desligar a bomba imediatamente.**

### Partida com Tubulação Não Pressurizada

* Encher e ventilar a tubulação com cuidado até a válvula de controle de água de alimentação **37221-FV-5015**, usando a altura estática do tanque.
* Válvula de controle **37221-FV-5015** e seu desvio **37221-HV-5021**: fechados.
* Abrir a válvula do motor gradualmente para aumento suave de pressão na tubulação.
* Verificar se o controlador de velocidade da bomba **35221-SIC-1040** (bomba FW1) / **35221-SIC-1047** (bomba FW2) está em modo **REMOTO**.

### Partida com Tubulação Pressurizada (pressão antes de 37221-FV-5015 > 25 bar(g))

* Aumentar o ponto de ajuste do controlador de velocidade **35221-SIC-1040** (FW1) / **35221-SIC-1047** (FW2) para a pressão normal de operação.

> **NOTA!** O **fluxo mínimo da bomba de água de alimentação deve sempre ser mantido**.

### Mudança Automática da Bomba de Água de Alimentação

Se a bomba em operação desligar por falha, a bomba pré-selecionada de reserva parte automaticamente quando:
* A bomba reserva está selecionada.
* O interruptor de segurança da bomba reserva está conectado.
* O controle de velocidade da bomba reserva está em modo **REMOTO** (segue o ponto de ajuste da bomba em funcionamento).

O operador deve confirmar adicionalmente (se a troca automática estiver selecionada):
* Válvulas de isolamento manual (sucção e pressão) da bomba reserva: **abertas**; válvulas de circulação mínima: **abertas**.
* Água de resfriamento da bomba de água de alimentação já circulando.

## Notas
Fragmento derivado do Capítulo 4, seções 4.4 e 4.4.1, do Manual de Operação da Caldeira de Força.
